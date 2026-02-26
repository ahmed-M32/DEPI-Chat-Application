import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="loading-screen">
          <i className="fas fa-triangle-exclamation"></i>
          <span>Something went wrong. Please refresh the page.</span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

