using System;

namespace api.Modules.Storage.Config
{
    public class S3Settings
    {
        public string BucketName { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public int SignedUrlExpirationMinutes { get; set; } = 15;
        public string ServiceUrl { get; set; } = string.Empty;
        public bool ForcePathStyle { get; set; } = false;
    }
}