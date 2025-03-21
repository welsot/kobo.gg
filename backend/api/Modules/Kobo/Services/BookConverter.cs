using api.Data;
using api.Modules.Common.Data;
using api.Modules.Kobo.Models;
using api.Modules.Kobo.Repository;
using api.Modules.Storage.Services;

namespace api.Modules.Kobo.Services;

public class BookConverter
{
    private readonly ITmpBookBundleRepository _tmpBookBundleRepository;
    private readonly IPendingBookRepository _pendingBookRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IS3Service _s3Service;
    private readonly Db _db;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BookConverter> _logger;

    public BookConverter(
        ITmpBookBundleRepository tmpBookBundleRepository,
        IPendingBookRepository pendingBookRepository,
        IBookRepository bookRepository,
        IS3Service s3Service,
        Db db,
        ApplicationDbContext context,
        ILogger<BookConverter> logger)
    {
        _tmpBookBundleRepository = tmpBookBundleRepository;
        _pendingBookRepository = pendingBookRepository;
        _bookRepository = bookRepository;
        _s3Service = s3Service;
        _db = db;
        _context = context;
        _logger = logger;
    }

    public async Task<int> ConvertPendingBooksToBooks(Guid tmpBookBundleId)
    {
        var tmpBookBundle = await _tmpBookBundleRepository.FindByIdAsync(tmpBookBundleId);
        if (tmpBookBundle == null)
        {
            _logger.LogWarning("TmpBookBundle with ID {Id} not found", tmpBookBundleId);
            throw new KeyNotFoundException($"TmpBookBundle with ID {tmpBookBundleId} not found");
        }

        var pendingBooks = await _pendingBookRepository.GetByTmpBookBundleIdAsync(tmpBookBundleId);
        int convertedCount = 0;

        // Check which files exist in S3 and convert them
        foreach (var pendingBook in pendingBooks)
        {
            try
            {
                // Try to generate a download URL for the file to verify it exists
                var fileExists = await _s3Service.KeyExistsAsync(pendingBook.S3Key);
                
                if (!fileExists) continue;

                // If we got here, the file exists in S3
                // Create a new Book entity from the PendingBook
                var book = new Book(
                    id: Guid.NewGuid(),
                    tmpBookBundle: tmpBookBundle,
                    fileName: pendingBook.FileName,
                    originalFileName: pendingBook.FileName,
                    filePath: pendingBook.S3Key,
                    fileSize: 0);
                _bookRepository.Add(book);

                // Delete the PendingBook as it's now converted to a Book
                _context.PendingBooks.Remove(pendingBook);

                convertedCount++;
            }
            catch (Exception ex)
            {
                // Log the error but continue processing other pending books
                _logger.LogError(ex, "Error converting pending book {Id} to book", pendingBook.Id);
            }
        }

        await _db.SaveChangesAsync();
        return convertedCount;
    }
}