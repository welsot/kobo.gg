using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using KoboGg.Api.Dtos;

namespace KoboGg.Api;

public interface IKoboApiClient
{
    Task<TmpBookBundleDto> CreateBundleAsync(CancellationToken ct);

    Task<EpubUploadUrlResponseDto> RequestUploadUrlAsync(
        EpubUploadUrlRequestDto request,
        CancellationToken ct);

    Task PutToPresignedUrlAsync(
        string presignedUrl,
        Stream content,
        long contentLength,
        string contentType,
        CancellationToken ct);

    Task<ConfirmUploadResponseDto> ConfirmUploadAsync(
        Guid pendingBookId,
        CancellationToken ct);

    Task<FinalizeBooksResponseDto> FinalizeAsync(
        FinalizeBooksRequestDto request,
        CancellationToken ct);
}
