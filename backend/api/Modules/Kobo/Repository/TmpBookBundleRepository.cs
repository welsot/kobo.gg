using api.Data;
using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.Kobo.Repository;

public class TmpBookBundleRepository : BaseRepository<TmpBookBundle>, ITmpBookBundleRepository
{
    public TmpBookBundleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<TmpBookBundle?> FindByIdAsync(Guid id)
    {
        return await _context.TmpBookBundles
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<TmpBookBundle?> FindByShortUrlCodeAsync(string shortUrlCode)
    {
        return await _context.TmpBookBundles
            .Include(b => b.Books)
            .FirstOrDefaultAsync(b => b.ShortUrlCode == shortUrlCode);
    }
    
    public async Task<bool> ShortUrlCodeExistsAsync(string shortUrlCode)
    {
        return await _context.TmpBookBundles.AnyAsync(b => b.ShortUrlCode == shortUrlCode);
    }
    
    public async Task<int> CountExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.TmpBookBundles
            .Where(b => b.ExpiresAt < now)
            .CountAsync(cancellationToken);
    }
    
    public async Task<List<TmpBookBundle>> GetExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.TmpBookBundles
            .Include(b => b.Books)
            .Where(b => b.ExpiresAt < now)
            .ToListAsync(cancellationToken);
    }
    
    public async Task DeleteExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var expiredBundles = await _context.TmpBookBundles
            .Where(b => b.ExpiresAt < now)
            .ToListAsync(cancellationToken);
            
        _context.TmpBookBundles.RemoveRange(expiredBundles);
        await _context.SaveChangesAsync(cancellationToken);
    }
}