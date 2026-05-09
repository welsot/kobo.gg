using api.Modules.User.Repository;

namespace api.Modules.User.Services;

public class OneTimePasswordCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OneTimePasswordCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(1);

    public OneTimePasswordCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<OneTimePasswordCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OneTimePassword cleanup service is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredOneTimePasswordsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while cleaning up expired one-time passwords");
            }

            await Task.Delay(_cleanupInterval, stoppingToken);
        }
    }

    private async Task CleanupExpiredOneTimePasswordsAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Starting expired one-time password cleanup");
        
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOneTimePasswordRepository>();
        
        // First find the expired OTPs to log the count
        var expiredOtpsCount = await repository.CountExpiredAsync(cancellationToken);
        
        if (expiredOtpsCount > 0)
        {
            _logger.LogInformation("Removing {Count} expired one-time passwords", expiredOtpsCount);
            await repository.DeleteExpiredAsync(cancellationToken);
            _logger.LogInformation("Completed removal of expired one-time passwords");
        }
        else
        {
            _logger.LogDebug("No expired one-time passwords found");
        }
    }
}