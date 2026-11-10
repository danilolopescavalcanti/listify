// A configuração compartilhada do Vite para TanStack Start já inclui os itens abaixo — não os
// adicione manualmente ou o app quebra com plugins duplicados:
//   - TanStack devtools (só em desenvolvimento, primeiro), tanstackStart, viteReact, tailwindcss,
//     tsConfigPaths, nitro (só no build, com cloudflare como alvo padrão), injeção das variáveis
//     VITE_*, alias de caminho @, dedupe de React/TanStack, plugins de log de erros e detecção
//     do sandbox (porta/host/strictPort).
// Nunca defina ssr.external nem resolve.external: o Worker não resolve módulos em tempo de
// execução, então o build falha. Nunca adicione compressão (compressPublicAssets,
// vite-plugin-compression): a hospedagem já comprime na borda.
// Você pode passar configurações extras em defineConfig({ vite: { ... }, etc... }) se precisar.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redireciona o entry de servidor do TanStack Start para src/server.ts (nosso invólucro de
    // erro de SSR). É a partir daqui que o nitro/vite monta o build.
    server: { entry: "server" },
  },
});
