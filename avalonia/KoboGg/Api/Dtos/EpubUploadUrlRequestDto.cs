using System;

namespace KoboGg.Api.Dtos;

public sealed record EpubUploadUrlRequestDto(
    Guid TmpBookBundleId,
    string FileName,
    string ContentType);
