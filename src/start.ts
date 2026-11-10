import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// O Start instala isso automaticamente quando src/start.ts não existe; criar o
// arquivo desativa esse comportamento, então o incluímos explicitamente para
// manter as server functions protegidas contra requisições de outros sites.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// requestMiddleware roda em toda requisição; functionMiddleware só nas server functions, onde
// o sendContext do cliente é entrada não validada. Acrescente a estes arrays, nunca os substitua.
// Se este app for ligado a um backend que exige autenticação, adicione o middleware de
// token bearer aqui como functionMiddleware: [attachAuth]. Só faça isso manualmente quando
// um backend assim estiver realmente conectado, nenhum middleware aqui definir
// Authorization e o projeto não ter substituído isso de propósito.
export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
