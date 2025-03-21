using System.Net;

using Amazon.S3;
using Amazon.S3.Model;

using api.Modules.Storage.Config;

using Microsoft.Extensions.Options;

namespace api.Modules.Storage.Services
{
    public class S3Service(
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        IWebHostEnvironment env
        ) : IS3Service
    {
        private readonly S3Settings _s3Settings = s3Settings.Value;

        public async Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType,
            int? expirationMinutes = null)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                ContentType = contentType,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes ?? _s3Settings.SignedUrlExpirationMinutes)
            };

            var signedUrl = await s3Client.GetPreSignedURLAsync(request);

            if (env.IsDevelopment())
            {
                signedUrl = signedUrl.Replace("https://", "http://");
            }

            return signedUrl;
        }

        public async Task<string> GeneratePresignedDownloadUrlAsync(string key, int? expirationMinutes = null)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes ?? _s3Settings.SignedUrlExpirationMinutes)
            };

            var signedUrl = await s3Client.GetPreSignedURLAsync(request);
            
            if (env.IsDevelopment())
            {
                signedUrl = signedUrl.Replace("https://", "http://");
            }

            return signedUrl;
        }

        public async Task<bool> KeyExistsAsync(string key)
        {
            try
            {
                var request = new GetObjectMetadataRequest { BucketName = _s3Settings.BucketName, Key = key };

                // Attempt to fetch object metadata
                await s3Client.GetObjectMetadataAsync(request);
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // Return false if the object is not found
                return false;
            }
            catch
            {
                // Re-throw other exceptions if any
                throw;
            }
        }
        
        public async Task<long?> GetFileSizeAsync(string key)
        {
            try
            {
                var request = new GetObjectMetadataRequest { BucketName = _s3Settings.BucketName, Key = key };

                // Get object metadata which includes content length
                var response = await s3Client.GetObjectMetadataAsync(request);
                return response.ContentLength;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // Return null if the object is not found
                return null;
            }
            catch
            {
                // Re-throw other exceptions
                throw;
            }
        }
    }
}