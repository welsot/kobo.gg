using System;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api.Dtos;
using KoboGg.Models;

namespace KoboGg.Services;

public interface IUploadOrchestrator
{
    Task<TmpBookBundleDto> EnsureBundleAsync(CancellationToken ct);

    Task<UploadedBook> UploadAsync(
        PickedFile file,
        IProgress<double>? progress,
        CancellationToken ct);

    Task<FinalizeBooksResponseDto> FinalizeAsync(CancellationToken ct);

    void Reset();

    TmpBookBundleDto? CurrentBundle { get; }
}
