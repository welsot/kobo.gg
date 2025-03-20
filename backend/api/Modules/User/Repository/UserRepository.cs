using api.Data;
using Microsoft.EntityFrameworkCore;

namespace api.Modules.User.Repository;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    
    public UserRepository(ApplicationDbContext context) 
    {
        _context = context;
    }
    
    public void Add(Models.User user)
    {
        _context.Users.Add(user);
    }

    public async Task<Models.User?> FindByEmailAsync(string email) 
        => await _context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
    
    public async Task<Models.User?> FindByIdAsync(Guid id)
        => await _context.Users.FindAsync(id);
}