// Os erros pegados pelo error boundary da raiz são relatados aqui, com a rota em que
// aconteceram, para continuarem chegando ao console do navegador com todos os detalhes.

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

// Loaders e server functions lançam Responses cruas e objetos simples (o
// `{ message, code, details }` de uma API), que String() reduz a "[object ...]".
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
