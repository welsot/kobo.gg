namespace api.Modules.Kobo.DTOs;

public record FinalizeBooksResponseDto(
    int ConvertedCount,
    Guid TmpBookBundleId
);