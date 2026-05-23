using System;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api;
using KoboGg.Api.Dtos;
using KoboGg.Models;

namespace KoboGg.Services;

public sealed class UploadOrchestrator : IUploadOrchestrator
{
    private readonly IKoboApiClient _api;
    private readonly SemaphoreSlim _bundleLock = new(1, 1);
    private TmpBookBundleDto? _bundle;

    public UploadOrchestrator(IKoboApiClient api)
    {
        _api = api;
    }

    public TmpBookBundleDto? CurrentBundle => _bundle;

    public void Reset() => _bundle = null;

    public async Task<TmpBookBundleDto> EnsureBundleAsync(CancellationToken ct)
    {
        if (_bundle is { } cached) return cached;

        await _bundleLock.WaitAsync(ct);
        try
        {
            if (_bundle is { } existing) return existing;
            var created = await _api.CreateBundleAsync(ct);
            _bundle = created;
            return created;
        }
        finally
        {
            _bundleLock.Release();
        }
    }

    public async Task<UploadedBook> UploadAsync(
        PickedFile file,
        IProgress<double>? progress,
        CancellationToken ct)
    {
        var contentType = FilePickerService.GetContentTypeFor(file.Name)
            ?? throw new UnsupportedFileException(file.Name);

        var bundle = await EnsureBundleAsync(ct);

        var urlResponse = await _api.RequestUploadUrlAsync(
            new EpubUploadUrlRequestDto(
                TmpBookBundleId: bundle.Id,
                FileName: file.Name,
                ContentType: contentType),
            ct);

        await using (var raw = await file.OpenReadAsync(ct))
        await using (var tracked = new ProgressStream(raw, file.Length, progress))
        {
            await _api.PutToPresignedUrlAsync(
                presignedUrl: urlResponse.Url,
                content: tracked,
                contentLength: file.Length,
                contentType: contentType,
                ct: ct);
        }

        progress?.Report(1.0);

        var confirm = await _api.ConfirmUploadAsync(urlResponse.PendingBookId, ct);

        return new UploadedBook(
            id: confirm.Id,
            fileName: file.Name,
            sizeBytes: file.Length);
    }

    public async Task<FinalizeBooksResponseDto> FinalizeAsync(CancellationToken ct)
    {
        var bundle = _bundle
            ?? throw new InvalidOperationException("No active bundle. Pick a file first.");

        return await _api.FinalizeAsync(
            new FinalizeBooksRequestDto(bundle.Id),
            ct);
    }
}
