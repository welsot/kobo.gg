namespace api.Modules.User.Repository;

public interface IUserRepository
{
    void Add(Models.User user);
    Task<Models.User?> FindByEmailAsync(string email);
}