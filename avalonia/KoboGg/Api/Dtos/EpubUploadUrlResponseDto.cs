using System;

namespace KoboGg.Api.Dtos;

public sealed record EpubUploadUrlResponseDto(
    string Url,
    string Key,
    Guid PendingBookId);
