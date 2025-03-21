using api.Data;
using api.Modules.Common.Repository;
using api.Modules.User.Models;

using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Repository;

public class OneTimePasswordRepository : BaseRepository<OneTimePassword>, IOneTimePasswordRepository
{
    public OneTimePasswordRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Models.User?> FindByEmailAndCodeAsync(string email, string code)
    {
        var now = DateTimeOffset.UtcNow;

        // Find a user with a matching email and an unexpired OTP with the provided code
        return await _context.Users
            .Include(u => u.OneTimePasswords)
            .Where(u => u.Email == email.ToLowerInvariant())
            .Where(u => u.OneTimePasswords.Any(otp =>
                otp.Code == code &&
                otp.ExpiresAt > now))
            .FirstOrDefaultAsync();
    }

    public async Task<int> CountExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        return await _context.OneTimePasswords
            .CountAsync(otp => otp.ExpiresAt < now, cancellationToken);
    }

    public async Task DeleteExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        await _context.OneTimePasswords
            .Where(otp => otp.ExpiresAt < now)
            .ExecuteDeleteAsync(cancellationToken);
    }
}