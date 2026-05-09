using api.Data;

namespace api.Modules.Common.Repository;

public abstract class BaseRepository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    
    protected BaseRepository(ApplicationDbContext context) 
    {
        _context = context;
    }
    
    public void Add(T entity)
    {
        _context.Add(entity);
    }
}