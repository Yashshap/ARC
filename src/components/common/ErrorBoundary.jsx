import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      const componentName = this.props.name || 'Component';

      return (
        <div className="error-boundary-container glass-card">
          <div className="error-boundary-icon-wrap">
            <AlertTriangle size={32} className="text-warning" />
          </div>

          <h3 className="error-boundary-title">
            {this.props.title || `Something went wrong in ${componentName}`}
          </h3>

          <p className="error-boundary-message">
            {this.props.message ||
              'A temporary issue occurred while rendering this section. Your local data remains safely saved.'}
          </p>

          <div className="error-boundary-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={this.handleReset}
            >
              <RotateCcw size={16} />
              <span>Try Again</span>
            </button>

            {this.props.showHomeAction && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
              >
                <Home size={16} />
                <span>Reload App</span>
              </button>
            )}
          </div>

          {/* Collapsible Error Debug Info */}
          <div className="error-boundary-details-wrap">
            <button
              type="button"
              className="error-details-toggle-btn"
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
            >
              {this.state.showDetails ? 'Hide Technical Details' : 'View Error Details'}
            </button>

            {this.state.showDetails && (
              <pre className="error-details-pre">
                {this.state.error?.toString()}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
