using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api;
using KoboGg.Api.Dtos;

namespace KoboGg.Tests.TestDoubles;

/// <summary>
/// In-memory <see cref="IKoboApiClient"/> that records the order of calls and lets a test
/// introduce a delay on bundle creation (to widen the concurrency window).
/// </summary>
internal sealed class FakeKoboApiClient : IKoboApiClient
{
    public List<string> Calls { get; } = new();
    public int CreateBundleCalls;
    public TimeSpan CreateBundleDelay { get; set; } = TimeSpan.Zero;

    public TmpBookBundleDto Bundle { get; set; } = new(Guid.NewGuid(), "code123", DateTime.UtcNow.AddHours(1));
    public Guid PendingBookId { get; set; } = Guid.NewGuid();
    public Guid ConfirmedId { get; set; } = Guid.NewGuid();

    public async Task<TmpBookBundleDto> CreateBundleAsync(CancellationToken ct)
    {
        Interlocked.Increment(ref CreateBundleCalls);
        lock (Calls) Calls.Add("CreateBundle");
        if (CreateBundleDelay > TimeSpan.Zero) await Task.Delay(CreateBundleDelay, ct);
        return Bundle;
    }

    public Task<EpubUploadUrlResponseDto> RequestUploadUrlAsync(EpubUploadUrlRequestDto request, CancellationToken ct)
    {
        lock (Calls) Calls.Add("RequestUploadUrl");
        return Task.FromResult(new EpubUploadUrlResponseDto("https://s3.example/put", "key", PendingBookId));
    }

    public Task PutToPresignedUrlAsync(string presignedUrl, Stream content, long contentLength, string contentType, CancellationToken ct)
    {
        lock (Calls) Calls.Add("Put");
        return Task.CompletedTask;
    }

    public Task<ConfirmUploadResponseDto> ConfirmUploadAsync(Guid pendingBookId, CancellationToken ct)
    {
        lock (Calls) Calls.Add("Confirm");
        return Task.FromResult(new ConfirmUploadResponseDto(ConfirmedId));
    }

    public Task<FinalizeBooksResponseDto> FinalizeAsync(FinalizeBooksRequestDto request, CancellationToken ct)
    {
        lock (Calls) Calls.Add("Finalize");
        return Task.FromResult(new FinalizeBooksResponseDto(1, request.TmpBookBundleId));
    }
}
