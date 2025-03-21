using api.Modules.Storage.Services;

namespace api.Modules.Kobo.Services;


public class EpubConverter(
    KepubifyService kepubifyService,
    IS3Service s3Service,
    ILogger<EpubConverter> logger
    )
{
    
    public async Task<string> ConvertToKepubAsync(string s3Key, string fileName)
    {
        try
        {
            logger.LogInformation("Converting {FileName} to Kepub format", fileName);
            
            // Create temp file paths for processing with proper extension
            // Clean the original filename to create a valid filename for the temporary file
            string safeFileName = Path.GetFileNameWithoutExtension(fileName)
                .Replace(" ", "-")
                .Replace(".", "-");
                
            // Limit to 50 chars to avoid issues with too long paths
            if (safeFileName.Length > 50)
                safeFileName = safeFileName.Substring(0, 50);
                
            // Make sure we don't overwrite existing files by adding a unique suffix
            string uniqueSuffix = DateTime.Now.ToString("yyyyMMddHHmmss");
            string tempInputPath = Path.Combine(Path.GetTempPath(), $"{safeFileName}-{uniqueSuffix}.epub");
            string tempOutputPath = Path.Combine(Path.GetTempPath(), $"{safeFileName}-{uniqueSuffix}.kepub.epub");
            
            logger.LogDebug("Using temporary paths - Input: {InputPath}, Output: {OutputPath}", 
                tempInputPath, tempOutputPath);
            
            try
            {
                // Download the epub file from S3
                var downloadUrl = await s3Service.GeneratePresignedDownloadUrlAsync(s3Key);
                logger.LogDebug("Generated presigned download URL for S3 key: {S3Key}", s3Key);
                
                using (var httpClient = new HttpClient())
                {
                    logger.LogDebug("Downloading file from S3...");
                    using (var response = await httpClient.GetAsync(downloadUrl))
                    {
                        response.EnsureSuccessStatusCode();
                        
                        using (var stream = await response.Content.ReadAsStreamAsync())
                        using (var fileStream = new FileStream(tempInputPath, FileMode.Create))
                        {
                            await stream.CopyToAsync(fileStream);
                        }
                    }
                }
                
                // Verify the file exists and has content
                var fileInfo = new FileInfo(tempInputPath);
                if (!fileInfo.Exists || fileInfo.Length == 0)
                {
                    throw new FileNotFoundException($"Downloaded file is missing or empty: {tempInputPath}");
                }
                
                logger.LogDebug("Downloaded file successfully, size: {FileSize} bytes", fileInfo.Length);
                
                // Convert epub to kepub
                logger.LogDebug("Starting kepubify conversion...");
                await kepubifyService.ConvertAsync(tempInputPath, tempOutputPath);
                
                // Verify the output file exists
                if (!File.Exists(tempOutputPath))
                {
                    throw new FileNotFoundException($"Kepubify did not create output file at: {tempOutputPath}");
                }
                
                // Generate new S3 key for the kepub file
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                if (fileNameWithoutExt.EndsWith(".kepub", StringComparison.OrdinalIgnoreCase))
                {
                    fileNameWithoutExt = fileNameWithoutExt.Substring(0, fileNameWithoutExt.Length - 6);
                }
                
                string kepubFileName = $"{fileNameWithoutExt}.kepub.epub";
                string kepubS3Key = s3Key.Replace(Path.GetFileName(s3Key), kepubFileName);
                
                logger.LogDebug("Generated kepub S3 key: {KepubS3Key}", kepubS3Key);
                
                // Upload the converted file back to S3
                var uploadUrl = await s3Service.GeneratePresignedUploadUrlAsync(kepubS3Key, "application/epub+zip");
                
                using (var fileStream = new FileStream(tempOutputPath, FileMode.Open))
                using (var httpClient = new HttpClient())
                {
                    var content = new StreamContent(fileStream);
                    content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/epub+zip");
                    
                    logger.LogDebug("Uploading kepub file to S3...");
                    using (var request = new HttpRequestMessage(HttpMethod.Put, uploadUrl))
                    {
                        request.Content = content;
                        var response = await httpClient.SendAsync(request);
                        response.EnsureSuccessStatusCode();
                        logger.LogDebug("Upload to S3 successful");
                    }
                }
                
                logger.LogInformation("Successfully converted {FileName} to Kepub format", fileName);
                return kepubS3Key;
            }
            finally
            {
                // Clean up temporary files
                try
                {
                    if (File.Exists(tempInputPath))
                    {
                        File.Delete(tempInputPath);
                        logger.LogDebug("Deleted temporary input file: {Path}", tempInputPath);
                    }
                    
                    if (File.Exists(tempOutputPath))
                    {
                        File.Delete(tempOutputPath);
                        logger.LogDebug("Deleted temporary output file: {Path}", tempOutputPath);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Error cleaning up temporary files");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error converting epub to kepub: {Message}", ex.Message);
            throw;
        }
    }
}