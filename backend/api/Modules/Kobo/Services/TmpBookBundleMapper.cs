using api.Modules.Kobo.DTOs;
using api.Modules.Kobo.Models;

namespace api.Modules.Kobo.Services;

public class TmpBookBundleMapper
{
    public TmpBookBundleDto Map(TmpBookBundle tmpBookBundle)
    {
        return new TmpBookBundleDto(
            Id: tmpBookBundle.Id,
            ShortUrlCode: tmpBookBundle.ShortUrlCode,
            ExpiresAt: tmpBookBundle.ExpiresAt
        );
    }
}