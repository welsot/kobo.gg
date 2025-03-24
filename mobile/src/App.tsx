import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from '@tauri-apps/plugin-fs';
import * as tauriPath from '@tauri-apps/api/path';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { apiConfirmUpload, apiGetEpubUploadUrl, apiTmpBookBundleCreate } from "./api/apiComponents";
import Header from './components/Header';
import Footer from './components/Footer';
import "./App.css";
import { isDev, apiUrl } from "./utils/env";
import { useBookStore } from "./utils/store";

const determineFileType = (fileName: string): string => {
  if (fileName.endsWith('.epub')) return 'application/epub+zip';
  if (fileName.endsWith('.mobi')) return 'application/x-mobipocket-ebook';
  if (fileName.endsWith('.pdf')) return 'application/pdf';
  if (fileName.endsWith('.txt')) return 'text/plain';
  if (fileName.endsWith('.cbz')) return 'application/x-cbr';
  if (fileName.endsWith('.cbr')) return 'application/x-cbr';
  return 'application/octet-stream';
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Use Zustand store
  const {
    bookBundle, setBookBundle,
    uploadedBooks,
    addBook,
    isUploading, setIsUploading,
    uploadProgress, setUploadProgress,
    currentFileName, setCurrentFileName,
    setFinalizationResult,
    setShortUrl
  } = useBookStore();

  const createTmpBookBundle = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const bundle = await apiTmpBookBundleCreate();
      setBookBundle(bundle);
    } catch (err) {
      setError(apiUrl + ': failed to create temporary book bundle. Please try again. ' + JSON.stringify(err));
      console.error(JSON.stringify(err));
      throw err;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      setIsInitialLoad(false);
    }
  };

  // Create a temporary book bundle when component mounts
  // without showing loading indicator on initial load
  useEffect(() => {
    createTmpBookBundle(false);
    
    // Reset upload state when component mounts
    useBookStore.getState().resetUploadState();

    // reset success screen state if it was defined
    setFinalizationResult(null);
    setShortUrl(null);
  }, []);

  const uploadFile = async (filePath: string): Promise<void> => {
    if (!bookBundle) {
      alert("Book bundle wasn't created, please ensure your internet is working, restart the app and try again")
      return
    }

    const fileName = await tauriPath.basename(filePath);

    const ext = fileName.split('.').pop();
    if (!ext) {
      alert(`File ${fileName} has no extension, please try again`)
      return
    }

    if (!['epub', 'mobi', 'pdf', 'txt', 'cbz', 'cbr'].includes(ext)) {
      alert(`File ${fileName} has an unsupported extension, please try again, supported extensions are .epub, .mobi, .pdf, .txt, .cbz, .cbr`)
      return
    }

    try {

      // Update current file being uploaded
      setCurrentFileName(fileName);
      setUploadProgress(0);

      // timeout to reset the uploading if we stuck at reading file
      const stuckTimeout = setTimeout(() => {
          alert('Error reading file.. Maybe it is too large? Please try again');
          useBookStore.getState().resetUploadState();
      }, 5000);

      // Read the file contents using Tauri's fs plugin
      const fileContent = await readFile(filePath);
      clearTimeout(stuckTimeout);
      setUploadProgress(1);
      const fileSize = fileContent.length; // Use the array length as file size

      let fileType = determineFileType(fileName);

      // Get signed upload URL
      const uploadUrlResponse = await apiGetEpubUploadUrl({
        body: {
          tmpBookBundleId: bookBundle.id,
          fileName: fileName,
          contentType: fileType || 'application/octet-stream',
        },
      });

      setUploadProgress(2);

      let finalUrl = uploadUrlResponse.url;
      if (isDev) {
        finalUrl = finalUrl.replace('http://localhost:4566', 'https://legally-ideal-macaw.ngrok-free.app');
      }

      const stuckTimeout2 = setTimeout(() => {
                alert('Error reading file.. Maybe it is too large? Please try again');
                useBookStore.getState().resetUploadState();
            }, 5000);
      // Create a Blob from the file content
      const blob = new Blob([fileContent], { type: fileType });
      clearTimeout(stuckTimeout2);
      setUploadProgress(3);

      // Upload the file with progress tracking
      try {
        // Use XMLHttpRequest to track upload progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Set up progress tracking
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed due to network error"));
          });

          xhr.open("PUT", finalUrl);
          xhr.setRequestHeader("Content-Type", fileType);
          xhr.send(blob);
        });
      } catch (error) {
        useBookStore.getState().resetUploadState();
        console.error('Upload failed:' + JSON.stringify(error));
        throw error;
      }

      // Confirm the upload with the backend
      await apiConfirmUpload({
        pathParams: {
          pendingBookId: uploadUrlResponse.pendingBookId,
        },
      });

      // Add to uploaded books using Zustand
      addBook({
        id: uploadUrlResponse.pendingBookId,
        name: fileName,
        key: uploadUrlResponse.key,
        size: fileSize,
      });

    } catch (err) {
      console.error('Upload error: ' + JSON.stringify(err));
      throw err;
    }
  };

  const handleFileSelect = async () => {
    if (!bookBundle || isUploading) return;

    setIsUploading(true);
    setError(null);

    let uploadedCount = 0;

    try {
      // Open file dialog
      const selected = await open({
        multiple: true,
      });

      if (selected === null) {
        // User canceled the selection
        setIsUploading(false);
        return;
      }

      if (Array.isArray(selected)) {
        if (!selected.length) {
          setIsUploading(false);
          return;
        }
        // Multiple files selected
        for (const path of selected) {
          await uploadFile(path);
          uploadedCount++
        }
      }

      if (uploadedCount > 0 || uploadedBooks.length > 0) {
        useBookStore.getState().resetUploadState();
        navigate('/book-list');
      }

    } catch (err) {
      console.error('File selection error:', err);
      setError('Failed to upload one or more files. Please try again. Err: ' + JSON.stringify(err));
    } finally {
      useBookStore.getState().resetUploadState();
    }
  };

  const onRetry = () => {
    createTmpBookBundle(true);
  };

  // Animated background particles
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="app-container">
      {/* Animated background */}
      <div className="animated-background">
        {particles.map((i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
              opacity: [Math.random() * 0.3 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.3 + 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              background: 'rgba(124, 77, 255, 0.2)',
              borderRadius: '50%',
              position: 'absolute'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Header />

      <motion.div
        className="book-uploader-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Upload Books to Your Kobo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Select your book files to upload and get a short code for your Kobo e-reader
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExclamationTriangleIcon className="error-icon" />
              <p>{error}</p>
              <motion.button
                className="retry-button"
                onClick={onRetry}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'Retrying...' : 'Retry'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="upload-area"
          onClick={handleFileSelect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner">&nbsp;</div>
              <span>Loading...</span>
            </div>
          ) : isUploading ? (
            <div className="loading-spinner">
              <div className="spinner">&nbsp;</div>
              <div className="upload-progress">
                <span>Uploading {currentFileName}...</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">{uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon-container">
                <BookOpenIcon className="book-icon" />
                <ArrowUpTrayIcon className="upload-arrow-icon" />
              </div>
              <p className="upload-text">Tap to select e-book files</p>
              <p className="file-types">Supported formats: .epub, .mobi, .pdf, .txt, .cbz, .cbr</p>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {uploadedBooks.length > 0 && (
            <motion.div
              className="book-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <p><span className="book-count">{uploadedBooks.length}</span> {uploadedBooks.length > 1 ? 'books' : 'book'} selected</p>
              <motion.button
                className="continue-button"
                onClick={() => navigate('/book-list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;