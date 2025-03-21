using System.Diagnostics;
using System.IO;
using System.Net.Http;
using api.Modules.Storage.Services;
using Microsoft.Extensions.Logging;

namespace api.Modules.Kobo.Services;

public interface IKepubifyService
{
    Task<string> ConvertToKepubAsync(string s3Key, string fileName);
}

public class KepubifyService : IKepubifyService
{
    private readonly string _executablePath;
    private readonly IS3Service _s3Service;
    private readonly ILogger<KepubifyService> _logger;
    
    public KepubifyService(
        string executablePath, 
        IS3Service s3Service,
        ILogger<KepubifyService> logger) 
    {
        _executablePath = executablePath;
        _s3Service = s3Service;
        _logger = logger;
    }
    
    public async Task ConvertAsync(string inputPath, string outputPath) 
    {
        var process = new Process 
        {
            StartInfo = new ProcessStartInfo 
            {
                FileName = _executablePath,
                Arguments = $"\"{inputPath}\" \"{outputPath}\"",
                RedirectStandardOutput = true,
                UseShellExecute = false
            }
        };
        
        process.Start();
        await process.WaitForExitAsync();
    }
    
    public async Task<string> ConvertToKepubAsync(string s3Key, string fileName)
    {
        try
        {
            _logger.LogInformation("Converting {FileName} to Kepub format", fileName);
            
            // Create temp file paths for processing
            string tempInputPath = Path.GetTempFileName();
            string tempOutputPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.kepub.epub");
            
            try
            {
                // Download the epub file from S3
                var downloadUrl = await _s3Service.GeneratePresignedDownloadUrlAsync(s3Key);
                
                using (var httpClient = new HttpClient())
                using (var stream = await httpClient.GetStreamAsync(downloadUrl))
                using (var fileStream = new FileStream(tempInputPath, FileMode.Create))
                {
                    await stream.CopyToAsync(fileStream);
                }
                
                // Convert epub to kepub
                await ConvertAsync(tempInputPath, tempOutputPath);
                
                // Generate new S3 key for the kepub file
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                if (fileNameWithoutExt.EndsWith(".kepub", StringComparison.OrdinalIgnoreCase))
                {
                    fileNameWithoutExt = fileNameWithoutExt.Substring(0, fileNameWithoutExt.Length - 6);
                }
                
                string kepubFileName = $"{fileNameWithoutExt}.kepub.epub";
                string kepubS3Key = s3Key.Replace(Path.GetFileName(s3Key), kepubFileName);
                
                // Upload the converted file back to S3
                var uploadUrl = await _s3Service.GeneratePresignedUploadUrlAsync(kepubS3Key, "application/epub+zip");
                
                using (var fileStream = new FileStream(tempOutputPath, FileMode.Open))
                using (var httpClient = new HttpClient())
                {
                    var content = new StreamContent(fileStream);
                    content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/epub+zip");
                    
                    using (var request = new HttpRequestMessage(HttpMethod.Put, uploadUrl))
                    {
                        request.Content = content;
                        var response = await httpClient.SendAsync(request);
                        response.EnsureSuccessStatusCode();
                    }
                }
                
                _logger.LogInformation("Successfully converted {FileName} to Kepub format", fileName);
                return kepubS3Key;
            }
            finally
            {
                // Clean up temporary files
                if (File.Exists(tempInputPath))
                {
                    File.Delete(tempInputPath);
                }
                
                if (File.Exists(tempOutputPath))
                {
                    File.Delete(tempOutputPath);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting epub to kepub: {Message}", ex.Message);
            throw;
        }
    }
}
