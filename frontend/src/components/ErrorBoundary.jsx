import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex min-h-dvh flex-col items-center justify-center bg-base-100 p-6 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold text-error">⚠️ Đã xảy ra lỗi</h1>
            <p className="text-base-content/75">
              Ứng dụng gặp sự cố ngoài ý muốn. Vui lòng tải lại trang hoặc thử lại sau.
            </p>
            {this.state.error?.message && (
              <pre className="bg-base-200 text-error p-4 rounded text-xs text-left overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button onClick={this.handleRetry} className="btn btn-primary w-full">
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
