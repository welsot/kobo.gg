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
}