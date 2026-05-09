using api.Modules.Kobo.DTOs;

namespace api.Modules.Kobo.Http.Response;

public record BundleBooksResponse(
    List<BookDto> Books,
    DateTime ExpiresAt
);