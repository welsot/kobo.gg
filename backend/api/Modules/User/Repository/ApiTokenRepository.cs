using api.Data;
using api.Modules.Common.Repository;
using api.Modules.User.Models;

using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Repository;

public class ApiTokenRepository(ApplicationDbContext context) : BaseRepository<ApiToken>(context)
{
    public async Task<Models.User?> FindByEmailAsync(string email)
        => await context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
}