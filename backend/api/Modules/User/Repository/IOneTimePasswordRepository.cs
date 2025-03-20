using api.Modules.Common.Repository;
using api.Modules.User.Models;

namespace api.Modules.User.Repository;

public interface IOneTimePasswordRepository : IRepository<OneTimePassword>
{
    Task<Models.User?> FindByEmailAndCodeAsync(string email, string code);
    Task<int> CountExpiredAsync(CancellationToken cancellationToken = default);
    Task DeleteExpiredAsync(CancellationToken cancellationToken = default);
}