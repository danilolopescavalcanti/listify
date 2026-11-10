import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Um client por requisição: um QueryClient no módulo vaza dados em cache entre requisições SSR.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Deixa o Query cuidar da validade dos dados; defina os padrões de cache no QueryClient, não no router.
    defaultPreloadStaleTime: 0,
  });

  return router;
};
