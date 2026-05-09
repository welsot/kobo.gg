using api.Modules.Kobo.Repository;
using api.Modules.Storage.Services;

namespace api.Modules.Kobo.Services;

public class TmpBookBundleCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TmpBookBundleCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(5);

    public TmpBookBundleCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<TmpBookBundleCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TmpBookBundle cleanup service is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredTmpBookBundlesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while cleaning up expired temporary book bundles");
            }

            await Task.Delay(_cleanupInterval, stoppingToken);
        }
    }

    private async Task CleanupExpiredTmpBookBundlesAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Starting expired temporary book bundles cleanup");

        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<ITmpBookBundleRepository>();
        var s3Service = scope.ServiceProvider.GetRequiredService<IS3Service>();

        // First find the expired bundles
        var expiredCount = await repository.CountExpiredAsync(cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("Found {Count} expired temporary book bundles to clean up", expiredCount);
            
            // Get the expired bundles to access their books and S3 keys
            var expiredBundles = await repository.GetExpiredAsync(cancellationToken);
            
            // Collect all S3 keys (both original and kepub if exists)
            var s3KeysToDelete = new List<string>();
            
            foreach (var bundle in expiredBundles)
            {
                foreach (var book in bundle.Books)
                {
                    s3KeysToDelete.Add(book.S3Key);
                    
                    if (!string.IsNullOrEmpty(book.KepubS3Key))
                    {
                        s3KeysToDelete.Add(book.KepubS3Key);
                    }
                }
            }
            
            // Delete the files from S3
            if (s3KeysToDelete.Any())
            {
                try
                {
                    _logger.LogInformation("Deleting {Count} files from S3", s3KeysToDelete.Count);
                    var deletedKeys = await s3Service.DeleteObjectsAsync(s3KeysToDelete);
                    _logger.LogInformation("Successfully deleted {Count} files from S3", deletedKeys.Count);
                }
                catch (Exception ex)
                {
                    // Log but continue with DB cleanup even if S3 deletion fails
                    _logger.LogError(ex, "Error deleting files from S3");
                }
            }
            
            // Now delete the records from the database
            _logger.LogInformation("Removing expired temporary book bundles from database");
            await repository.DeleteExpiredAsync(cancellationToken);
            _logger.LogInformation("Completed cleanup of expired temporary book bundles");
        }
        else
        {
            _logger.LogDebug("No expired temporary book bundles found");
        }
    }
}