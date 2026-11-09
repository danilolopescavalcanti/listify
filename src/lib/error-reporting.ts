// Errors caught by the root error boundary are reported here, with the route they
// happened on, so they still reach the browser console with their full detail.

type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const options: ErrorReportOptions = {
    mechanism: "react_error_boundary",
    handled: false,
    severity: "error",
  };

  console.error(describeThrown(error), {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...options,
    ...context,
  });
}

const MAX_SERIALIZED_LENGTH = 2000;

// Loaders and server fns throw raw Responses and plain objects (an API's
// `{ message, code, details }`), which String() reduces to "[object ...]".
function describeThrown(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const { message } = (error ?? {}) as { message?: unknown };
  if (typeof message === "string" && message.length > 0) return message;
  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}
