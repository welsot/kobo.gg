using api.Data;
using api.Modules.Common.Repository;
using api.Modules.User.Models;

using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Repository;

public class ApiTokenRepository : BaseRepository<ApiToken>
{
    public ApiTokenRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Models.User?> FindByEmailAsync(string email)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
}