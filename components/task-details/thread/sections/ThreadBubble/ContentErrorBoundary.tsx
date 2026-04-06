import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Content parsing error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-2">
          <p className="text-red-800 dark:text-red-200 font-semibold mb-1">
            Unable to display content
          </p>
          <p className="text-red-600 dark:text-red-300 text-sm">
            The content could not be parsed. This may be due to malformed HTML.
          </p>
          {this.state.error && (
            <details className="mt-2">
              <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer">
                Error details
              </summary>
              <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-x-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
