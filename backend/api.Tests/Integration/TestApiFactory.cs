using System.Data.Common;
using api.Data;
using api.Modules.Email.Config;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Respawn;
using Testcontainers.PostgreSql;

namespace api.Tests.Integration;

public class TestApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer;
    private Respawner _respawner = null!;
    private DbConnection _connection = null!;

    private readonly IContainer _smtpContainer;
    
    private static readonly SemaphoreSlim _initLock = new(1, 1);
    private static bool _smtpInitialized;

    public TestApiFactory()
    {
        _dbContainer = new PostgreSqlBuilder()
            .WithImage("postgres:17")
            .WithDatabase("test_db")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();

        _smtpContainer = new ContainerBuilder()
            .WithImage("schickling/mailcatcher")
            .WithPortBinding(1025, assignRandomHostPort: true)
            .WithPortBinding(1080, assignRandomHostPort: true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        
        // SMTP Container is reusable between tests
        await _initLock.WaitAsync();
        try
        {
            if (!_smtpInitialized)
            {
                await _smtpContainer.StartAsync();
                _smtpInitialized = true;
            }
        }
        finally
        {
            _initLock.Release();
        }

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();

        _connection = CreateDbConnection();
        _respawner = await Respawner.CreateAsync(_connection, new()
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"]
        });
    }

    private DbConnection CreateDbConnection()
    {
        var connection = new NpgsqlConnection(_dbContainer.GetConnectionString());
        connection.Open();
        return connection;
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
                options.UseNpgsql(_dbContainer.GetConnectionString())
                    .UseSnakeCaseNamingConvention());

            services.Configure<MailcatcherSettings>(settings =>
            {
                settings.Host = _smtpContainer.Hostname;
                settings.Port = _smtpContainer.GetMappedPublicPort(1025);
            });
        });
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _dbContainer.StopAsync();
        _connection?.Dispose();
        await base.DisposeAsync();
    }
}