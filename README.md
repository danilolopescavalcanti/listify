# Listify

Aplicação web para organizar listas de compras do mercado: cada item entra com um preço
estimado, e ao marcar como comprado você informa o preço pago. A tela da lista mostra o
total estimado, o total gasto e a diferença entre os dois.

## Telas

| Rota | Tela |
| --- | --- |
| `/` | Minhas listas — abas "Ativas" e "Histórico", criar, renomear, concluir, duplicar e excluir listas |
| `/lista/$id` | Detalhe da lista — itens separados por categoria, marcar como comprado (pede o preço pago), editar, remover, total estimado x gasto, modo mercado e compartilhamento por e-mail |
| `/lista/$id/adicionar` | Adicionar item — produto, categoria, quantidade, unidade e preço estimado, com sugestões de itens já usados e o último preço pago |

## Como rodar

Você precisa do Node.js instalado.

```sh
npm i
npm run dev
```

Acesse o endereço que aparecer no terminal (por padrão `http://localhost:8080`).

Outros comandos:

```sh
npm run build      # gera a versão de produção
npm run preview    # serve a versão gerada pelo build
npm run lint       # checagem de código
npm run test       # testes
```

## Como o código está organizado

- `src/routes/` — as três telas, uma por arquivo (rotas definidas pelo nome do arquivo).
- `src/components/AppShell.tsx` — o cabeçalho e a navegação que aparecem em todas as telas.
- `src/lib/store.ts` — todas as funções de lista e de item: criar, renomear, concluir,
  duplicar, excluir, adicionar, editar, marcar como comprado e calcular os totais.
- `src/components/ui/` — botões, campos e diálogos reaproveitados.

## Estado atual

Esta é apenas a parte de front-end. Os dados ficam na memória, nas listas de exemplo
criadas em `src/lib/store.ts`, e voltam ao estado inicial quando a página é recarregada.
O compartilhamento por e-mail só registra o endereço na lista, sem enviar mensagem.

Quem for fazer o back-end em Spring Boot precisa só trocar as funções de
`src/lib/store.ts` pelas chamadas da API; as telas continuam as mesmas.

## Feito com

- TanStack Start (React + TypeScript)
- Tailwind CSS
- Vite
