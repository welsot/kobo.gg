using api.Modules.Common.Repository;

namespace api.Modules.User.Repository;

public interface IUserRepository : IRepository<Models.User>
{
    Task<Models.User?> FindByEmailAsync(string email);
    
    Task<Models.User?> FindByIdAsync(Guid id);
}