using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;

namespace api.Modules.Kobo.Repository;

public interface IBookRepository : IRepository<Book>
{
    Task<Book> CreateAsync(TmpBookBundle tmpBookBundle, string fileName, string originalFileName, string filePath, long fileSize);
}