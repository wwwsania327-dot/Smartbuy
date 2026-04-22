"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] px-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-700">
            <div className="text-6xl">🤕</div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Oops, something went wrong!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>
            <div className="pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Reload Page
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all">
              {this.state.error?.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
