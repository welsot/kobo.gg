namespace api.Modules.Kobo.DTOs;

public record BookDto(
    Guid Id,
    string FileName,
    string OriginalFileName,
    long FileSize,
    string DownloadUrl
);