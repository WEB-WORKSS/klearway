import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Klearway UI error', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold">This page could not be displayed.</h1>
        <p className="mt-3 text-ink-600">Reload the page to try again. If it keeps happening, email olawale@klearway.site.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-ink px-5 py-2.5 text-paper">
          Reload page
        </button>
      </div>
    );
  }
}
