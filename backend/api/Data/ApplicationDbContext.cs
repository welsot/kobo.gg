using api.Modules.User.Models;
using api.Modules.Kobo.Models;

using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<ApiToken> ApiTokens { get; set; }
    public DbSet<OneTimePassword> OneTimePasswords { get; set; }
    
    public DbSet<TmpBookBundle> TmpBookBundles { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<PendingBook> PendingBooks { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //modelBuilder.ApplyConfiguration(new OneTimePassword.Configuration());
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    
        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder.UseSnakeCaseNamingConvention());
    }
}