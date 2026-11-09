import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, brl, CATEGORIAS, sugestoes, UNIDADES, useLista, useListas, type Unidade } from "@/lib/store";

export const Route = createFileRoute("/lista/$id_/adicionar")({
  head: () => ({
    meta: [
      { title: "Adicionar item — Listify" },
      { name: "description", content: "Adicione um produto com quantidade, unidade e preço estimado." },
      { property: "og:title", content: "Adicionar item — Listify" },
      { property: "og:description", content: "Adicione produtos à sua lista de compras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Adicionar,
});

function Adicionar() {
  const { id } = Route.useParams() as { id: string };
  const lista = useLista(id);
  const todas = useListas();
  const navigate = useNavigate();
  const [produto, setProduto] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0] ?? "Mercearia");
  const [quantidade, setQuantidade] = useState(1);
  const [unidade, setUnidade] = useState<Unidade>("un");
  const [preco, setPreco] = useState(0);
  const [aberto, setAberto] = useState(false);

  const busca = produto.trim().toLowerCase();
  const opcoes = busca ? sugestoes(todas).filter((s) => s.produto.toLowerCase().includes(busca)).slice(0, 6) : [];

  const salvar = (continuar: boolean) => {
    if (!produto.trim() || quantidade <= 0) return;
    actions.addItem(id, { produto: produto.trim(), categoria, quantidade, unidade, precoEstimado: preco });
    if (continuar) { setProduto(""); setQuantidade(1); setPreco(0); }
    else navigate({ to: "/lista/$id", params: { id } });
  };

  const campo = "mt-1 h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppShell>
      <Link to="/lista/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {lista?.nome ?? "Voltar"}
      </Link>
      <h1 className="mt-3 text-3xl font-bold md:text-4xl">Adicionar item</h1>

      <form onSubmit={(e) => { e.preventDefault(); salvar(false); }} className="mt-6 max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 md:p-8">
        <label className="relative block">
          <span className="text-sm font-semibold">Produto</span>
          <input required autoFocus value={produto} className={campo} placeholder="Ex.: Arroz"
            onChange={(e) => { setProduto(e.target.value); setAberto(true); }} onBlur={() => setTimeout(() => setAberto(false), 150)} />
          {aberto && opcoes.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              {opcoes.map((s) => (
                <li key={s.produto}>
                  <button type="button" className="flex w-full justify-between px-3 py-2 text-left hover:bg-muted"
                    onClick={() => { setProduto(s.produto); setCategoria(s.categoria); setUnidade(s.unidade); setPreco(s.preco); setAberto(false); }}>
                    <span>{s.produto} <span className="text-xs text-muted-foreground">· {s.categoria}</span></span>
                    <span className="text-sm text-muted-foreground">{brl(s.preco)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Categoria</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold">Quantidade</span>
            <input type="number" min="0" step="any" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className={campo} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Unidade</span>
            <select value={unidade} onChange={(e) => setUnidade(e.target.value as Unidade)} className={campo}>
              {UNIDADES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Preço estimado (R$)</span>
            <input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(Number(e.target.value))} className={campo} />
          </label>
        </div>

        <p className="text-sm text-muted-foreground">Subtotal estimado: <b className="text-foreground">{brl(quantidade * preco)}</b></p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => salvar(true)} className="h-11 rounded-lg border border-border px-4 font-semibold">Salvar e adicionar outro</button>
          <button className="h-11 rounded-lg bg-primary px-6 font-semibold text-primary-foreground">Adicionar</button>
        </div>
      </form>
    </AppShell>
  );
}
