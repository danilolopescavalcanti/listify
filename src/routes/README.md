# Rotas

O TanStack Start usa **roteamento por arquivos**. Cada arquivo `.tsx` neste diretório
define uma rota. **Não** crie `src/pages/`, `src/routes/_app/index.tsx` nem
`app/layout.tsx` — essas são convenções de Next.js / Remix. O único layout raiz
é `src/routes/__root.tsx`.

## Convenções

| Arquivo | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dinâmica — só `$`, sem chaves) |
| `posts/{-$category}.tsx` | `/posts/:category?` (segmento opcional) |
| `files/$.tsx` | `/files/*` (splat — leia pelo parâmetro `_splat`, nunca `*`) |
| `_layout.tsx` | rota de layout (renderiza os filhos com `<Outlet />`) |
| `__root.tsx` | casca do app — envolve todas as páginas; preserve o `<Outlet />` |

`routeTree.gen.ts` é gerado automaticamente. Não edite à mão.
