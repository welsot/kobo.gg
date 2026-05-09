using api.Data;
using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;

namespace api.Modules.Kobo.Repository;

public class BookRepository : BaseRepository<Book>, IBookRepository
{
    public BookRepository(ApplicationDbContext context) : base(context)
    {
    }
}