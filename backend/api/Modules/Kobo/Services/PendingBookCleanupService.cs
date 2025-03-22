using api.Modules.Kobo.Repository;
using api.Modules.Storage.Services;

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
        var s3Service = scope.ServiceProvider.GetRequiredService<IS3Service>();

        // First find the expired pending books
        var expiredCount = await repository.CountExpiredAsync(cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("Found {Count} expired pending books to clean up", expiredCount);
            
            // Get the expired books to access their S3 keys
            var expiredBooks = await repository.GetExpiredAsync(cancellationToken);
            
            // Collect all S3 keys (both original and kepub if exists)
            var s3KeysToDelete = new List<string>();
            
            foreach (var book in expiredBooks)
            {
                s3KeysToDelete.Add(book.S3Key);
                
                if (!string.IsNullOrEmpty(book.KepubS3Key))
                {
                    s3KeysToDelete.Add(book.KepubS3Key);
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
            _logger.LogInformation("Removing expired pending books from database");
            await repository.DeleteExpiredAsync(cancellationToken);
            _logger.LogInformation("Completed cleanup of expired pending books");
        }
        else
        {
            _logger.LogDebug("No expired pending books found");
        }
    }
}