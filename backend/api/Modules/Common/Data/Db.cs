using api.Data;

namespace api.Modules.Common.Data;

public class Db
{
    private readonly ApplicationDbContext _context;
    
    public Db(ApplicationDbContext context) 
    {
        _context = context;
    }
    public void Add(object entity)
    {
        _context.Add(entity);
    }
    
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}