using api.Modules.Kobo.Repository;

namespace api.Modules.Kobo.Services;

public class PendingBookCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PendingBookCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(5);

    public PendingBookCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<PendingBookCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PendingBook cleanup service is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredPendingBooksAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while cleaning up expired pending books");
            }

            await Task.Delay(_cleanupInterval, stoppingToken);
        }
    }

    private async Task CleanupExpiredPendingBooksAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Starting expired pending books cleanup");

        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IPendingBookRepository>();

        // First find the expired pending books to log the count
        var expiredCount = await repository.CountExpiredAsync(cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("Removing {Count} expired pending books", expiredCount);
            await repository.DeleteExpiredAsync(cancellationToken);
            _logger.LogInformation("Completed removal of expired pending books");
        }
        else
        {
            _logger.LogDebug("No expired pending books found");
        }
    }
}