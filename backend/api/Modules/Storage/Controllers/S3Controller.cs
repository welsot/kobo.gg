using System;
using System.Threading.Tasks;
using api.Modules.Common.Controllers;
using api.Modules.Storage.Services;
using api.Modules.User.Auth;
using Microsoft.AspNetCore.Mvc;

namespace api.Modules.Storage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class S3Controller : ApiController
    {
        private readonly IS3Service _s3Service;

        public S3Controller(IS3Service s3Service)
        {
            _s3Service = s3Service;
        }

        /// <summary>
        /// Generates a pre-signed URL for uploading a file to S3
        /// </summary>
        /// <param name="key">The object key (file path in the bucket)</param>
        /// <param name="contentType">The content type of the file</param>
        /// <returns>A pre-signed URL for uploading</returns>
        [ApiTokenRequired]
        [HttpGet("upload-url")]
        public async Task<IActionResult> GetUploadUrl([FromQuery] string key, [FromQuery] string contentType)
        {
            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(contentType))
            {
                return BadRequest("Key and content type are required.");
            }

            // Generate a unique key to avoid overwriting existing files
            var uniqueKey = $"{Guid.NewGuid()}/{key}";
            
            var url = await _s3Service.GeneratePresignedUploadUrlAsync(uniqueKey, contentType);
            
            return Ok(new { Url = url, Key = uniqueKey });
        }

        /// <summary>
        /// Generates a pre-signed URL for downloading a file from S3
        /// </summary>
        /// <param name="key">The object key (file path in the bucket)</param>
        /// <returns>A pre-signed URL for downloading</returns>
        [ApiTokenRequired]
        [HttpGet("download-url")]
        public async Task<IActionResult> GetDownloadUrl([FromQuery] string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return BadRequest("Key is required.");
            }
            
            var url = await _s3Service.GeneratePresignedDownloadUrlAsync(key);
            
            return Ok(new { Url = url });
        }
    }
}