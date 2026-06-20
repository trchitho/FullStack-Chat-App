import { Component } from "react";

class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error("Render error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-h-dvh items-center justify-center bg-base-100 p-6">
        <section role="alert" className="max-w-md rounded-2xl border border-error/30 bg-base-200 p-6 text-center">
          <h1 className="text-xl font-bold">PingMe gặp sự cố</h1>
          <p className="mt-2 text-base-content/70">Vui lòng tải lại trang để tiếp tục.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => window.location.reload()}>
            Tải lại
          </button>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
