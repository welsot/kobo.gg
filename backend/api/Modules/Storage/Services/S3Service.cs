using System;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using api.Modules.Storage.Config;
using Microsoft.Extensions.Options;

namespace api.Modules.Storage.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly S3Settings _s3Settings;

        public S3Service(IAmazonS3 s3Client, IOptions<S3Settings> s3Settings)
        {
            _s3Client = s3Client;
            _s3Settings = s3Settings.Value;
        }

        public async Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int? expirationMinutes = null)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                ContentType = contentType,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes ?? _s3Settings.SignedUrlExpirationMinutes)
            };

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
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

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
        }
    }
}