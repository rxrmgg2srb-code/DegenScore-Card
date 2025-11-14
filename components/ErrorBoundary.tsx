import React, { Component, ReactNode } from 'react';
import { logger } from '../lib/logger';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Generate unique error ID for tracking
    const eventId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.error('Error boundary caught error:', {
      error,
      errorInfo,
      eventId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    this.setState({
      errorInfo,
      eventId,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleCopyError = () => {
    if (!this.state.error) return;

    const errorReport = `
Error ID: ${this.state.eventId}
Error: ${this.state.error.toString()}
Stack: ${this.state.error.stack || 'N/A'}
Component Stack: ${this.state.errorInfo?.componentStack || 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Time: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorReport);
    alert('Error details copied to clipboard');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border-2 border-red-500/50 p-8 max-w-lg w-full">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">💥</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-400">
                An unexpected error occurred. Don't worry, we've been notified.
              </p>
              {this.state.eventId && (
                <p className="text-gray-500 text-sm mt-2 font-mono">
                  Error ID: {this.state.eventId}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-lg transition transform hover:scale-105"
              >
                🔄 Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                Refresh Page
              </button>

              <Link href="/">
                <button className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition">
                  🏠 Go to Home
                </button>
              </Link>
            </div>

            {/* Copy Error Button */}
            <button
              onClick={this.handleCopyError}
              className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 text-sm rounded-lg transition border border-gray-700"
            >
              📋 Copy Error Details
            </button>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-red-400 text-xs font-bold mb-2">Error Message:</p>
                  <p className="text-red-400 text-xs font-mono break-words">
                    {this.state.error.toString()}
                  </p>
                </div>

                {this.state.error.stack && (
                  <details className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <summary className="text-red-400 text-xs font-bold cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-red-400 text-xs font-mono mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                {this.state.errorInfo?.componentStack && (
                  <details className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <summary className="text-red-400 text-xs font-bold cursor-pointer">
                      Component Stack
                    </summary>
                    <pre className="text-red-400 text-xs font-mono mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
