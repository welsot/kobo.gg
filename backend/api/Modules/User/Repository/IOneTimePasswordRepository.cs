using api.Modules.Common.Repository;

namespace api.Modules.User.Repository;

public interface IOneTimePasswordRepository : IRepository<Models.OneTimePassword>
{
    Task<Models.User?> FindByEmailAndCodeAsync(string email, string code);
}