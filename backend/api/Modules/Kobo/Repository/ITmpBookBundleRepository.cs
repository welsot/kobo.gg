using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;

namespace api.Modules.Kobo.Repository;

public interface ITmpBookBundleRepository : IRepository<TmpBookBundle>
{
    Task<TmpBookBundle?> FindByIdAsync(Guid id);
    Task<TmpBookBundle?> FindByShortUrlCodeAsync(string shortUrlCode);
    Task<bool> ShortUrlCodeExistsAsync(string shortUrlCode);
}