using System;
using Amazon.S3;
using Amazon.Runtime;
using api.Modules.Storage.Config;
using api.Modules.Storage.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace api.Modules.Storage
{
    public static class StorageServices
    {
        public static IServiceCollection AddStorageServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register S3 settings
            services.Configure<S3Settings>(configuration.GetSection("S3"));
            
            // Register S3 client
            services.AddSingleton<IAmazonS3>(provider => 
            {
                var s3Settings = configuration.GetSection("S3").Get<S3Settings>() 
                    ?? throw new InvalidOperationException("S3 settings not found in configuration");
                
                var credentials = new BasicAWSCredentials(s3Settings.AccessKey, s3Settings.SecretKey);
                var config = new AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(s3Settings.Region)
                };
                
                // Configure for LocalStack or custom endpoint if specified
                if (!string.IsNullOrEmpty(s3Settings.ServiceUrl))
                {
                    config.ServiceURL = s3Settings.ServiceUrl;
                    config.ForcePathStyle = s3Settings.ForcePathStyle;
                }
                
                return new AmazonS3Client(credentials, config);
            });
            
            // Register S3 service
            services.AddScoped<IS3Service, S3Service>();
            
            return services;
        }
    }
}