#!/bin/bash

# Create a local S3 bucket for development
echo "Creating S3 bucket for local development..."
awslocal s3 mb s3://local-development-bucket

# Set CORS configuration to allow uploads from any origin
echo "Setting CORS configuration..."
awslocal s3api put-bucket-cors --bucket local-development-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

echo "S3 bucket setup complete!"