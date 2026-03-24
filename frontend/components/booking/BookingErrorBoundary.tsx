"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorHandler from "./ErrorHandler";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BookingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Booking error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <ErrorHandler
              error={this.state.error?.message || "An unexpected error occurred"}
              onRetry={() => this.setState({ hasError: false, error: null })}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}




