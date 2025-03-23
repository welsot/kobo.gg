import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { 
  BookOpenIcon, 
  TrashIcon, 
  PlusIcon, 
  ArrowRightIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { apiFinalizeBooks } from '../api/apiComponents';
import type { TmpBookBundleDto } from '../api/apiSchemas';

interface UploadedBook {
  id: string;
  name: string;
  key: string;
  size: number;
}

export function BookList() {
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const bookBundle = location.state?.bookBundle as TmpBookBundleDto;

  useEffect(() => {
    // Retrieve uploaded books from localStorage
    const storedBooks = localStorage.getItem('uploadedBooks');
    if (storedBooks) {
      setUploadedBooks(JSON.parse(storedBooks));
    }

    // If no bookBundle in state, try to get from localStorage
    if (!bookBundle) {
      navigate('/');
    }
  }, [navigate, bookBundle]);

  const deleteBook = (bookId: string) => {
    const updatedBooks = uploadedBooks.filter(book => book.id !== bookId);
    setUploadedBooks(updatedBooks);
    localStorage.setItem('uploadedBooks', JSON.stringify(updatedBooks));
    
    // If no books left, go back to upload screen
    if (updatedBooks.length === 0) {
      navigate('/');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFinalizeBooks = async () => {
    if (!bookBundle) {
      navigate('/');
      return;
    }

    setIsFinalizing(true);
    setError(null);

    try {
      const result = await apiFinalizeBooks({
        body: {
          tmpBookBundleId: bookBundle.id,
        },
      });

      // Attempt to track analytics if available (like in the web version)
      if ((window as any).plausible) {
        (window as any).plausible('BooksConfirmed', {
          props: {
            bookCount: uploadedBooks.length
          }
        });
      }

      // Navigate to success screen with result and shortUrlCode
      navigate('/success', { 
        state: { 
          finalizationResult: result,
          shortUrl: `kobo.gg/${bookBundle.shortUrlCode}`
        } 
      });
      
      // Clear uploaded books from localStorage
      localStorage.removeItem('uploadedBooks');
    } catch (err) {
      console.error('Failed to finalize books:', err);
      setError('Failed to finalize your books. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
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
        className="book-list-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="book-list-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2>Review Your Books</h2>
          <span className="book-count">{uploadedBooks.length} book(s)</span>
        </motion.div>

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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="book-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatePresence>
            {uploadedBooks.map((book, index) => (
              <motion.div 
                key={book.id} 
                className="book-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                layout
              >
                <div className="book-info">
                  <BookOpenIcon className="book-icon" />
                  <div style={{ minWidth: 0, width: '100%' }}>
                    <div className="book-name" title={book.name}>{book.name}</div>
                    <div className="book-size">{formatFileSize(book.size)}</div>
                  </div>
                </div>
                <motion.button
                  className="delete-button"
                  onClick={() => deleteBook(book.id)}
                  aria-label="Delete"
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <TrashIcon width={20} height={20} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            className="add-more-button"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusIcon width={20} height={20} />
            Add More Books
          </motion.button>
          <motion.button
            className="continue-button"
            onClick={handleFinalizeBooks}
            disabled={uploadedBooks.length === 0 || isFinalizing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFinalizing ? (
              <>
                <div className="spinner small-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRightIcon width={18} height={18} style={{ marginLeft: '6px' }} />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
}