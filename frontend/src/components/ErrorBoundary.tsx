import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

/**
 * ============================================================================
 * ERROR BOUNDARY COMPONENT (React 19 / TypeScript)
 * ============================================================================
 * 
 * ARCHITECTURAL ROLE:
 * React error boundaries are class components that catch JavaScript errors anywhere
 * in their child component tree, log those errors, and display a fallback UI instead
 * of crashing the entire application with a blank screen (unhandled exception cascade).
 * 
 * CORE LIFECYCLE HOOKS:
 * 1. static getDerivedStateFromError(error: Error):
 *    - Invoked during the "render" phase after a descendant component throws an error.
 *    - Updates the state (`hasError: true`) so the next render shows the fallback UI.
 *    - Must be a pure function with no side effects.
 * 
 * 2. componentDidCatch(error: Error, errorInfo: ErrorInfo):
 *    - Invoked during the "commit" phase after an error occurred in a descendant.
 *    - Used for side effects, such as telemetry logging, monitoring service reports
 *      (e.g., Sentry, Datadog), or local diagnostic inspection.
 * 
 * BOUNDARY ISOLATION STRATEGY:
 * - Root Boundary: Prevents total blank-screen failure at application startup.
 * - Feature-level Boundaries: Encapsulates complex modules (e.g., CCTV simulator,
 *   Canvas QR generator, high-density booking tables) so that if one module fails,
 *   devotees can still access the rest of the portal without interruption.
 */

interface ErrorBoundaryProps {
  /** Component tree to protect */
  children: ReactNode;
  /** Optional custom title for the fallback alert */
  title?: string;
  /** Optional custom fallback component to render instead of the default */
  fallback?: ReactNode;
  /** Optional error reset callback triggered when the user clicks 'Try Again' */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Derives state from thrown error to switch rendering to fallback UI.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Catches errors in child components and captures error stack telemetry.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // In a production environment, send to centralized telemetry logging service:
    console.error(' [ErrorBoundary Caught Exception]:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Resets the error boundary state to attempt rendering the children again.
   */
  handleReset = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Hard-reloads the page to clean stale DOM or memory leaks.
   */
  handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Navigates back to home page safely.
   */
  handleNavigateHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided via props, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default production-grade fallback UI
      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
            {/* Warning Shield Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {this.props.title || 'Something went wrong / பிழை ஏற்பட்டது'}
            </h2>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              We encountered an unexpected rendering error in this section of the portal.
              The rest of the system remains operational. You can attempt to reload or navigate back to the home directory.
            </p>

            {/* Dev Stack Trace Details (Collapsible) */}
            {isDev && this.state.error && (
              <details className="text-left bg-slate-900 text-slate-100 rounded-xl p-4 mb-6 text-xs font-mono overflow-auto max-h-48">
                <summary className="cursor-pointer font-bold text-amber-400 mb-2 select-none flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Technical Diagnostic Stack (Development Mode)</span>
                </summary>
                <div className="whitespace-pre-wrap text-red-400 font-semibold mb-2">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div className="whitespace-pre-wrap text-slate-400 text-[11px]">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg active:scale-95 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again / மீண்டும் முயற்சி</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleNavigateHome}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Home Directory</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
