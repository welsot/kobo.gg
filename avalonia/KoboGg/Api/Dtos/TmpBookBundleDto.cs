using System;

namespace KoboGg.Api.Dtos;

public sealed record TmpBookBundleDto(
    Guid Id,
    string ShortUrlCode,
    DateTime ExpiresAt);
