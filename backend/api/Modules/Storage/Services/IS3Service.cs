using System;
 using System.Threading.Tasks;

namespace api.Modules.Storage.Services
{
    public interface IS3Service
    {
        /// <summary>
        /// Generates a pre-signed URL for uploading a file to S3
        /// </summary>
        /// <param name="key">The object key (file path in the bucket)</param>
        /// <param name="contentType">The content type of the file</param>
        /// <param name="expirationMinutes">Optional: URL expiration in minutes</param>
        /// <returns>A pre-signed URL for PUT operation</returns>
        Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int? expirationMinutes = null);
        
        /// <summary>
        /// Generates a pre-signed URL for downloading a file from S3
        /// </summary>
        /// <param name="key">The object key (file path in the bucket)</param>
        /// <param name="expirationMinutes">Optional: URL expiration in minutes</param>
        /// <returns>A pre-signed URL for GET operation</returns>
        Task<string> GeneratePresignedDownloadUrlAsync(string key, int? expirationMinutes = null);

        Task<bool> KeyExistsAsync(string key);
        
        /// <summary>
        /// Gets the file size in bytes for an object in S3
        /// </summary>
        /// <param name="key">The object key (file path in the bucket)</param>
        /// <returns>The file size in bytes, or null if the object doesn't exist</returns>
        Task<long?> GetFileSizeAsync(string key);
    }
}