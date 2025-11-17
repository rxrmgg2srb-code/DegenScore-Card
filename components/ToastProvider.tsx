import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
          padding: '16px',
          fontSize: '14px',
        },
        // Success
        success: {
          duration: 3000,
          icon: '✅',
          style: {
            background: '#065f46',
            border: '1px solid #10b981',
          },
        },
        // Error
        error: {
          duration: 5000,
          icon: '❌',
          style: {
            background: '#7f1d1d',
            border: '1px solid #ef4444',
          },
        },
        // Loading
        loading: {
          icon: '⏳',
          style: {
            background: '#1e3a8a',
            border: '1px solid #3b82f6',
          },
        },
      }}
    />
  );
}
