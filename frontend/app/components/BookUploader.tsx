import { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { 
  apiTmpBookBundleCreate, 
  apiGetEpubUploadUrl 
} from '~/api/apiComponents';
import type { TmpBookBundleDto } from '~/api/apiSchemas';

const ACCEPTED_FILE_TYPES = [
  '.txt',
  '.epub',
  '.mobi',
  '.pdf',
  '.cbz',
  '.cbr',
  'application/epub+zip',
  'application/epub',
  'application/x-mobipocket-ebook',
  'application/pdf',
  'application/vnd.comicbook+zip',
  'application/vnd.comicbook-rar'
];

export function BookUploader() {
  const [bookBundle, setBookBundle] = useState<TmpBookBundleDto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create a temporary book bundle when component mounts
  useEffect(() => {
    const createTmpBookBundle = async () => {
      try {
        const bundle = await apiTmpBookBundleCreate();
        setBookBundle(bundle);
        setShortUrl(`kobo.gg/${bundle.shortUrlCode}`);
      } catch (err) {
        setError('Failed to create temporary book bundle. Please try again.');
        console.error(err);
      }
    };

    createTmpBookBundle();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !bookBundle) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get signed upload URL
      const uploadUrlResponse = await apiGetEpubUploadUrl({
        body: {
          tmpBookBundleId: bookBundle.id,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream'
        }
      });

      // Upload file to the signed URL
      const uploadResponse = await fetch(uploadUrlResponse.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      setUploadComplete(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const copyShortUrlToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
        .then(() => {
          // You could add a toast notification here
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
        });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3 text-red-700">
            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Upload Books to Your Kobo</h2>
          <p className="text-gray-600">
            Select your book file to upload and get a shortcode for your Kobo e-reader
          </p>
        </div>

        {uploadComplete ? (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-20 h-20 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Upload Complete!</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Use this URL on your Kobo e-reader to download your books:
              </p>
              <div 
                className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer"
                onClick={copyShortUrlToClipboard}
              >
                <span className="text-lg font-medium text-purple-800">{shortUrl}</span>
                <LinkIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <button
              onClick={() => {
                setUploadComplete(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="mt-4 text-purple-600 font-medium hover:text-purple-800"
            >
              Upload another book
            </button>
          </div>
        ) : (
          <div>
            <div 
              className={`
                border-2 border-dashed rounded-xl p-10 mb-6 text-center cursor-pointer
                transition-colors duration-200
                ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-purple-300 hover:border-purple-500 bg-purple-50'}
              `}
              onClick={handleButtonClick}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Uploading your file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ArrowUpTrayIcon className="w-16 h-16 text-purple-500 mb-3" />
                  <p className="text-lg font-medium text-gray-800 mb-1">
                    Drag your file here or click to browse
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supported formats: .txt, .epub, .mobi, .pdf, .cbz, .cbr
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading || !bookBundle}
              />
            </div>

            {shortUrl && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentIcon className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">Your download URL:</span>
                </div>
                <div 
                  className="flex items-center gap-1 text-blue-700 font-medium cursor-pointer"
                  onClick={copyShortUrlToClipboard}
                >
                  <span>{shortUrl}</span>
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}