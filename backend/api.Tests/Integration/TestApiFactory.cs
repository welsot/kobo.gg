using System.Data.Common;
using api;
using api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using Testcontainers.PostgreSql;
using Xunit;

namespace api.Tests.Integration;

public class TestApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer;
    private RespawnerOptions _respawnerOptions = null!;
    private Respawner _respawner = null!;
    private DbConnection _connection = null!;

    public TestApiFactory()
    {
        _dbContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("kobogg_test_db")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        _connection = CreateDbConnection();
        await InitializeRespawner();
    }

    private DbConnection CreateDbConnection()
    {
        var connection = new Npgsql.NpgsqlConnection(_dbContainer.GetConnectionString());
        connection.Open();
        return connection;
    }

    private async Task InitializeRespawner()
    {
        _respawnerOptions = new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = new[] { "public" },
            WithReseed = true,
        };
        
        // Initialize database first to ensure tables exist
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureCreatedAsync();
        //await db.Database.MigrateAsync(); // if this is uncommented i get: Npgsql.PostgresException 42P07: relation "users" already exists
        
        _respawner = await Respawner.CreateAsync(_connection, _respawnerOptions);
    }

    public async Task ResetDatabaseAsync()
    {
        await _respawner.ResetAsync(_connection);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => 
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }
            
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(_dbContainer.GetConnectionString())
                      .UseSnakeCaseNamingConvention();
            });
            
            // Ensure database is created and migrated
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Create the database and ensure it's clean
            db.Database.EnsureDeleted();
            //db.Database.EnsureCreated();
            
            // Apply migrations
            //db.Database.Migrate();
        });
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _dbContainer.StopAsync();
        _connection?.Dispose();
        await base.DisposeAsync();
    }
}