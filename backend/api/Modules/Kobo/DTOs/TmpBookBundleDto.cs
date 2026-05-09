namespace api.Modules.Kobo.DTOs;

public record TmpBookBundleDto(Guid Id, string ShortUrlCode, DateTime ExpiresAt);