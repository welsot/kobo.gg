using api.Data;
using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.Kobo.Repository;

public class BookRepository : BaseRepository<Book>, IBookRepository
{
    public BookRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Book> CreateAsync(TmpBookBundle tmpBookBundle, string fileName, string originalFileName, string filePath, long fileSize)
    {
        var book = new Book(
            Guid.NewGuid(),
            tmpBookBundle,
            fileName,
            originalFileName,
            filePath,
            fileSize
        );

        await _context.Books.AddAsync(book);

        return book;
    }
}