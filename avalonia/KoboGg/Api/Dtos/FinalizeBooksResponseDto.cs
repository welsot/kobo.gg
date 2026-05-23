using System;

namespace KoboGg.Api.Dtos;

public sealed record FinalizeBooksResponseDto(
    int ConvertedCount,
    Guid TmpBookBundleId);
