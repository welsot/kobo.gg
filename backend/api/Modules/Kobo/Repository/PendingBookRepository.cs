using api.Data;
using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;

using Microsoft.EntityFrameworkCore;

namespace api.Modules.Kobo.Repository;

public class PendingBookRepository : BaseRepository<PendingBook>, IPendingBookRepository
{
    public PendingBookRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PendingBook> CreateAsync(TmpBookBundle tmpBookBundle, string fileName, string s3Key,
        CancellationToken cancellationToken = default)
    {
        var pendingBook = new PendingBook(
            Guid.NewGuid(),
            tmpBookBundle,
            fileName,
            s3Key
        );

        await _context.PendingBooks.AddAsync(pendingBook, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return pendingBook;
    }

    public async Task<IEnumerable<PendingBook>> GetByTmpBookBundleIdAsync(Guid tmpBookBundleId,
        CancellationToken cancellationToken = default)
    {
        return await _context.PendingBooks
            .Where(pb => pb.TmpBookBundleId == tmpBookBundleId)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.PendingBooks
            .Where(pb => pb.ExpiresAt < now)
            .CountAsync(cancellationToken);
    }

    public async Task DeleteExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await _context.PendingBooks
            .Where(otp => otp.ExpiresAt < now)
            .ExecuteDeleteAsync(cancellationToken);
    }
}