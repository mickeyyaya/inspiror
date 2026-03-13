import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7] p-8 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-extrabold text-[#222] mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-500 mb-6 max-w-md">
            Don't worry — your projects are saved. Try reloading the page!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-[var(--color-candy-blue)] text-[#222] font-bold
              border-3 border-[#222] shadow-[4px_4px_0_#222]
              hover:scale-105 active:translate-y-[4px] active:shadow-none transition-all"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
