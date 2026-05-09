import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { SuccessScreenError } from './SuccessScreenError';
import {
  CheckCircleIcon, 
  DocumentDuplicateIcon, 
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useBookStore } from '../utils/store';

export function SuccessScreen() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  
  // Use Zustand store
  const { 
    finalizationResult, 
    shortUrl,
    resetAll
  } = useBookStore();

  // Extract the short code from the URL
  const shortCode = shortUrl ? shortUrl.split('/').pop() || '' : '';

  const copyShortUrlToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
        });
    }
  };

  const handleUploadMore = () => {
    resetAll();
    navigate('/');
  };

  if (!finalizationResult || !shortUrl) {
    return <SuccessScreenError/>;
  }

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
        className="book-uploader-container success-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2
          }}
        >
          <CheckCircleIcon className="success-icon" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Download Your Books
        </motion.h1>

        <motion.div
          className="url-display"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Full URL display */}
          <motion.div 
            className="full-url" 
            onClick={copyShortUrlToClipboard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {shortUrl}
            <AnimatePresence>
              {copied ? (
                <motion.span 
                  className="copied-indicator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircleIcon width={16} height={16} style={{ marginLeft: '8px' }} />
                </motion.span>
              ) : (
                <motion.span 
                  className="copy-icon"
                  initial={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1 }}
                >
                  <DocumentDuplicateIcon width={14} height={14} style={{ marginLeft: '8px' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="short-code-label">Your Short Code:</div>
          
          {/* Short code display */}
          <motion.div 
            className="short-code" 
            onClick={copyShortUrlToClipboard}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="short-code-text">{shortCode}</div>
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="copy-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          (Tap either to copy full URL to clipboard)
        </motion.p>

        {finalizationResult && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Successfully processed {finalizationResult.convertedCount} book{finalizationResult.convertedCount !== 1 ? 's' : ''}.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="instruction-text"
        >
          <InformationCircleIcon width={24} height={24} style={{ marginRight: '12px', flexShrink: 0 }} />
          <span>Open <b>kobo.gg</b> on your e-reader and enter your short code to download your books.</span>
        </motion.div>

        <motion.button
          className="upload-more-button"
          onClick={handleUploadMore}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowPathIcon width={18} height={18} style={{ marginRight: '6px' }} />
          Upload more books
        </motion.button>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
}