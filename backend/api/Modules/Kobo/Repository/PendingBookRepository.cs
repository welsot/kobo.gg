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

    public Task<PendingBook?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
         return _context.PendingBooks.Where(pb => pb.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PendingBook> CreateAsync(TmpBookBundle tmpBookBundle, string fileName, string originalFileName, long fileSize, string s3Key,
        CancellationToken cancellationToken = default)
    {
        var pendingBook = new PendingBook(
            Guid.NewGuid(),
            tmpBookBundle,
            fileName,
            originalFileName,
            fileSize,
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
    
    public async Task UpdateKepubS3KeyAsync(Guid pendingBookId, string kepubS3Key, CancellationToken cancellationToken = default)
    {
        var pendingBook = await _context.PendingBooks.FindAsync([pendingBookId], cancellationToken);
        if (pendingBook != null)
        {
            pendingBook.SetKepubS3Key(kepubS3Key);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
    
    public async Task UpdateAsync(PendingBook pendingBook, CancellationToken cancellationToken = default)
    {
        _context.PendingBooks.Update(pendingBook);
        await _context.SaveChangesAsync(cancellationToken);
    }
}