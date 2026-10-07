import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering exception occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuraQuote ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#121212] border border-neutral-800 p-8 rounded-2xl">
            <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
              AuraQuote · Monograph Recovery
            </p>
            <h1 className="text-2xl font-serif font-semibold text-white mb-3">
              A momentary interruption in the archive.
            </h1>
            <p className="text-sm text-[#E0E0E0] leading-relaxed mb-6">
              Our client-side safety boundary intercepted a rendering error to preserve your session and saved reflections.
            </p>
            {this.state.errorMessage && (
              <div className="p-3 bg-black border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400 mb-6 overflow-x-auto">
                {this.state.errorMessage}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Restore Session
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-neutral-900 text-neutral-300 border border-neutral-700 text-xs font-medium rounded-lg hover:text-white transition-colors cursor-pointer"
              >
                Reload Archive
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
