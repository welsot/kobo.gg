# S3 Storage Setup

This document describes how to set up S3 storage for the Kobo.gg backend.

## Local Development

For local development, you have two options:

### Option 1: Use LocalStack (Recommended for local development)

1. Uncomment the `localstack` service in `compose.yml`
2. Run `docker-compose up -d` to start the services
3. Create a `.env` file in the project root by copying `.env.example`
4. Set the values as follows:

```
S3__BucketName=local-development-bucket
S3__Region=us-east-1
S3__AccessKey=test
S3__SecretKey=test
S3__SignedUrlExpirationMinutes=30
```

5. When using LocalStack, the S3 endpoint will be at `http://localhost:4566`

### Option 2: Use an actual AWS S3 bucket

1. Create an S3 bucket in your AWS account
2. Create an IAM user with permissions to access the bucket
3. Create a `.env` file in the project root by copying `.env.example`
4. Set the values with your AWS credentials:

```
S3__BucketName=your-bucket-name
S3__Region=your-region (e.g., us-east-1)
S3__AccessKey=your-access-key
S3__SecretKey=your-secret-key
S3__SignedUrlExpirationMinutes=30
```

## Production Setup

For production, you should set environment variables on your host or deployment platform. 
Do not commit your AWS credentials to the repository.

### Docker Compose

For production with Docker, add these environment variables to your compose file:

```yaml
services:
  api:
    environment:
      - S3__BucketName=your-production-bucket-name
      - S3__Region=your-region
      - S3__AccessKey=your-access-key
      - S3__SecretKey=your-secret-key
      - S3__SignedUrlExpirationMinutes=15
```

### CORS Configuration

Make sure your S3 bucket has the proper CORS configuration:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://your-production-domain.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

## Using the S3 Service

The S3 service provides methods for:

1. Generating pre-signed upload URLs (`GeneratePresignedUploadUrlAsync`)
2. Generating pre-signed download URLs (`GeneratePresignedDownloadUrlAsync`)

Example API usage:

```
GET /api/s3/upload-url?key=myfile.jpg&contentType=image/jpeg
GET /api/s3/download-url?key=myfile.jpg
```