namespace api.Modules.Kobo.DTOs;

public record EpubUploadUrlResponseDto(
    string Url,
    string Key,
    Guid PendingBookId
);