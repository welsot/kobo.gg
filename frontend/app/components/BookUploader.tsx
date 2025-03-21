import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  LinkIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { apiGetEpubUploadUrl, apiTmpBookBundleCreate } from '~/api/apiComponents';
import type { TmpBookBundleDto } from '~/api/apiSchemas';
import { isDev } from '~/utils/env';

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
  'application/vnd.comicbook-rar',
];

interface UploadedBook {
  id: string;
  name: string;
  key: string;
  size: number;
}

export function BookUploader() {
  const [bookBundle, setBookBundle] = useState<TmpBookBundleDto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  const uploadFile = async (file: File): Promise<void> => {
    if (!bookBundle) return;

    try {
      // Get signed upload URL
      const uploadUrlResponse = await apiGetEpubUploadUrl({
        body: {
          tmpBookBundleId: bookBundle.id,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
        },
      });

      const signedUrl = isDev
        ? uploadUrlResponse.url.replace('https://', 'http://')
        : uploadUrlResponse.url;

      // Upload file to the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Add to uploaded books list
      setUploadedBooks(prev => [
        ...prev,
        {
          id: uploadUrlResponse.pendingBookId,
          name: file.name,
          key: uploadUrlResponse.key,
          size: file.size,
        },
      ]);

    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !bookBundle) return;

    setIsUploading(true);
    setError(null);

    try {
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }

      // Show the confirmation screen with all uploaded books
      setShowConfirmation(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload one or more files. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUploading || !bookBundle) return;

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || !droppedFiles.length) return;

    // Update the input element with the dropped files
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();

      // Add all dropped files to the DataTransfer object
      for (let i = 0; i < droppedFiles.length; i++) {
        dataTransfer.items.add(droppedFiles[i]);
      }

      fileInputRef.current.files = dataTransfer.files;

      // Manually trigger the change event
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const deleteBook = (bookId: string) => {
    setUploadedBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const handleConfirmUpload = () => {
    setUploadComplete(true);
    setShowConfirmation(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  const resetUploader = () => {
    setUploadComplete(false);
    setShowConfirmation(false);
    setUploadedBooks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            Select your book files to upload and get a shortcode for your Kobo e-reader
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
              onClick={resetUploader}
              className="mt-4 text-purple-600 font-medium hover:text-purple-800"
            >
              Upload more books
            </button>
          </div>
        ) : showConfirmation ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Uploaded Books</h3>
            <div className="border rounded-lg mb-6 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <div className="w-7/12">Name</div>
                  <div className="w-3/12 text-right">Size</div>
                  <div className="w-2/12 text-right">Action</div>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {uploadedBooks.map((book) => (
                  <div key={book.id} className="px-4 py-3 border-b last:border-0 flex justify-between items-center">
                    <div className="w-7/12 flex items-center">
                      <DocumentIcon className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-800 truncate">{book.name}</span>
                    </div>
                    <div className="w-3/12 text-right text-gray-600">
                      {formatFileSize(book.size)}
                    </div>
                    <div className="w-2/12 text-right">
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Add More Books
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={uploadedBooks.length === 0}
                className={`px-5 py-2 rounded-lg font-medium ${
                  uploadedBooks.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Continue
              </button>
            </div>
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
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="w-10 h-10 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Uploading your files...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ArrowUpTrayIcon className="w-16 h-16 text-purple-500 mb-3" />
                  <p className="text-lg font-medium text-gray-800 mb-1">
                    Drag your files here or click to browse
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
                multiple
              />
            </div>

            {uploadedBooks.length > 0 && (
              <div className="mt-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Books ({uploadedBooks.length})</h4>
                <div className="border rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                  {uploadedBooks.map((book) => (
                    <div key={book.id}
                         className="px-3 py-2 border-b last:border-0 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center">
                        <DocumentIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-800 truncate">{book.name}</span>
                      </div>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {uploadedBooks.length > 0 && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => setShowConfirmation(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}