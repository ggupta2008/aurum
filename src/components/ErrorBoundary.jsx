import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_) {
        return { hasError: true };
    }

    componentDidCatch(_, errorInfo) {
        console.error("Uncaught error:", _, errorInfo);
        this.setState({ error: _, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'white', background: '#1a1a1a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: '#ff6b6b' }}>Something went wrong.</h1>
                    <p>The Aurum engine encountered a critical error.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', opacity: 0.7 }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        style={{ marginTop: '2rem', padding: '10px 20px', background: '#D4AF37', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reset Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
