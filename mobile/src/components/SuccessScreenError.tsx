import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export function SuccessScreenError() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="sse-container">
      <motion.div
        className="sse-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <ExclamationTriangleIcon className="sse-icon" />
        </motion.div>

        <h2 className="sse-title">Oops! Something went wrong</h2>
        <p className="sse-message">We couldn't find the requested information. Please try again.</p>

        <motion.button
          className="sse-button"
          onClick={handleGoHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="sse-button-icon" />
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
}
