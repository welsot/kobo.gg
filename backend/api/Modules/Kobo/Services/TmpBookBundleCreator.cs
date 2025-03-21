using api.Modules.Common.Data;
using api.Modules.Common.Services;
using api.Modules.Kobo.Models;
using api.Modules.Kobo.Repository;

namespace api.Modules.Kobo.Services;

public class TmpBookBundleCreator(
    ITmpBookBundleRepository tmpBookBundles,
    Db db
)
{
    public async Task<TmpBookBundle> CreateTmpBookBundleWithShortUrlCodeAsync()
    {
        for (int attempt = 1; attempt <= 5; attempt++)
        {
            var length = 3 + attempt;
            var shortUrlCode = RandomTokenGenerator.GenerateShortUrlCode(length);
            var codeAlreadyExists = await tmpBookBundles.ShortUrlCodeExistsAsync(shortUrlCode);

            if (codeAlreadyExists) continue;

            var tmpBookBundle = new TmpBookBundle(id: Guid.NewGuid(), shortUrlCode);

            tmpBookBundles.Add(tmpBookBundle);
            await db.SaveChangesAsync();
            return tmpBookBundle;
        }

        throw new Exception("Could not generate a unique short URL code");
    }
}