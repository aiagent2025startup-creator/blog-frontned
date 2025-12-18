import React from 'react';

interface State {
  hasError: boolean;
  error?: any;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded p-6">
            <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
            <p className="text-sm text-red-600 mt-2">The page encountered an error. Check the console for details or try reloading.</p>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
