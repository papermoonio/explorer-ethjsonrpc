import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  resetKey: number
}

/**
 * Classic React error boundary.
 *
 * Catches render-time errors in its subtree and displays either a custom
 * `fallback` or a default "Something went wrong" message with a retry button.
 * The retry button forces a full remount of the subtree via a key change.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, error: null, resetKey: 0 }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            {this.state.error?.message}
          </p>
          <Button
            variant="outline"
            onClick={() =>
              this.setState((s) => ({
                hasError: false,
                error: null,
                resetKey: s.resetKey + 1,
              }))
            }
          >
            Try again
          </Button>
        </div>
      )
    }

    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>
  }
}
