import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Prevents a render error in one route from blanking the entire app.
 * Also handles failed lazy chunks by offering a hard reload.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
        this.handleReload = this.handleReload.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Keep the real error visible in the console for debugging.
        console.error('Route render error:', error, info?.componentStack);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    }

    handleReload() {
        window.location.reload();
    }

    handleReset() {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        const message = String(this.state.error?.message || 'An unexpected error occurred.');

        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
                <div className="card w-full max-w-lg p-6 text-center sm:p-8">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
                        <AlertTriangle className="h-7 w-7" />
                    </span>
                    <h1 className="mt-4 font-display text-xl font-bold text-[var(--text-primary)]">
                        This page couldn&rsquo;t load
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        A temporary error stopped this screen from rendering. Your data is safe.
                    </p>
                    <p className="mt-3 break-words rounded-lg bg-[var(--bg-raised)] px-3 py-2 text-left font-mono text-[11px] text-[var(--text-muted)]">
                        {message}
                    </p>
                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                        <button type="button" onClick={this.handleReload} className="btn-primary gap-2 px-4 py-2.5 text-sm">
                            <RefreshCw className="h-4 w-4" /> Reload page
                        </button>
                        <button type="button" onClick={this.handleReset} className="btn-secondary gap-2 px-4 py-2.5 text-sm">
                            Try again
                        </button>
                        <a href="/dashboard/overview" className="btn-ghost gap-2 px-4 py-2.5 text-sm">
                            <Home className="h-4 w-4" /> Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
