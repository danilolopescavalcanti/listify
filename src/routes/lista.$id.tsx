import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Copy, Pencil, Plus, Share2, ShoppingCart, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, brl, dataBR, totais, useLista, UNIDADES, type Item, type Lista } from "@/lib/store";

export const Route = createFileRoute("/lista/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da lista — Listify" },
      { name: "description", content: "Itens da lista por categoria, com total estimado e gasto." },
      { property: "og:title", content: "Detalhe da lista — Listify" },
      { property: "og:description", content: "Itens por categoria e painel de totais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const lista = useLista(id);
  const navigate = useNavigate();
  const [mercado, setMercado] = useState(false);

  if (!lista)
    return (
      <AppShell>
        <p className="text-muted-foreground">Lista não encontrada.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">Voltar</Link>
      </AppShell>
    );

  const t = totais(lista);
  const grupos = [...new Set(lista.itens.map((i) => i.categoria))].sort();

  return (
    <AppShell>
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Minhas listas
      </Link>

      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{lista.nome}</h1>
          <p className="text-sm text-muted-foreground">
            Criada em {dataBR(lista.criadaEm)} · {lista.concluida ? "Concluída" : "Ativa"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!lista.concluida && (
            <>
              <button onClick={() => setMercado(!mercado)}
                className={`inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-semibold ${mercado ? "border-success bg-success text-success-foreground" : "border-border bg-card"}`}>
                <ShoppingCart className="h-4 w-4" /> Modo mercado
              </button>
              <Link to="/lista/$id/adicionar" params={{ id }}
                className="inline-flex h-10 items-center gap-1 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Adicionar item
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {lista.itens.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Lista vazia. Adicione o primeiro item.
            </p>
          )}
          {grupos.map((cat) => {
            // Purchased items go to the end of each category.
            const itens = lista.itens.filter((i) => i.categoria === cat).sort((a, b) => Number(a.comprado) - Number(b.comprado));
            return (
              <div key={cat}>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">{cat}</h2>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {itens.map((i) => (
                    <ItemRow key={i.id} item={i} listaId={id} mercado={mercado} bloqueada={lista.concluida} />
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl bg-primary p-5 text-primary-foreground">
            <h2 className="text-lg font-bold">Totais</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between"><dt className="opacity-80">Estimado</dt><dd className="font-bold">{brl(t.estimado)}</dd></div>
              <div className="flex justify-between"><dt className="opacity-80">Gasto</dt><dd className="font-bold">{brl(t.gasto)}</dd></div>
              <div className="flex justify-between border-t border-primary-foreground/20 pt-3">
                <dt className="opacity-80">Diferença</dt><dd className="font-bold">{brl(t.estimado - t.gasto)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm opacity-80">{t.comprados} de {t.total} itens comprados</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="h-full bg-primary-foreground" style={{ width: `${t.total ? (t.comprados / t.total) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {!lista.concluida && (
              <button onClick={() => actions.concluir(id)} className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-card text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Concluir
              </button>
            )}
            <button onClick={() => { const nid = actions.duplicar(id); if (nid) navigate({ to: "/lista/$id", params: { id: nid } }); }}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-card text-sm font-semibold">
              <Copy className="h-4 w-4" /> Duplicar
            </button>
            <button onClick={() => { if (confirm("Excluir esta lista?")) { actions.excluir(id); navigate({ to: "/" }); } }}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-card text-sm font-semibold text-destructive">
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
          </div>

          <Compartilhar lista={lista} />
        </aside>
      </div>
    </AppShell>
  );
}

function ItemRow({ item, listaId, mercado, bloqueada }: { item: Item; listaId: string; mercado: boolean; bloqueada: boolean }) {
  const [editando, setEditando] = useState(false);
  const [f, setF] = useState(item);

  const toggle = () => {
    if (bloqueada) return;
    if (item.comprado) return actions.updateItem(listaId, item.id, { comprado: false, precoPago: null });
    const v = prompt("Preço pago por unidade (R$)", String(item.precoEstimado).replace(".", ","));
    if (v === null) return;
    const preco = Number(v.replace(",", ".")) || item.precoEstimado;
    actions.updateItem(listaId, item.id, { comprado: true, precoPago: preco });
  };

  if (editando)
    return (
      <li className="grid gap-2 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input className="h-9 rounded-md border border-input px-2" value={f.produto} onChange={(e) => setF({ ...f, produto: e.target.value })} />
        <input type="number" step="any" className="h-9 rounded-md border border-input px-2" value={f.quantidade} onChange={(e) => setF({ ...f, quantidade: Number(e.target.value) })} />
        <select className="h-9 rounded-md border border-input px-2" value={f.unidade} onChange={(e) => setF({ ...f, unidade: e.target.value as Item["unidade"] })}>
          {UNIDADES.map((u) => <option key={u}>{u}</option>)}
        </select>
        <input type="number" step="0.01" className="h-9 rounded-md border border-input px-2" value={f.precoEstimado} onChange={(e) => setF({ ...f, precoEstimado: Number(e.target.value) })} />
        <div className="flex gap-1">
          <button className="rounded-md bg-primary p-2 text-primary-foreground" onClick={() => { actions.updateItem(listaId, item.id, f); setEditando(false); }}><Check className="h-4 w-4" /></button>
          <button className="rounded-md p-2 hover:bg-muted" onClick={() => { setF(item); setEditando(false); }}><X className="h-4 w-4" /></button>
        </div>
      </li>
    );

  return (
    <li className={`flex items-center gap-3 ${mercado ? "p-5" : "p-3"} ${item.comprado ? "bg-muted/60" : ""}`}>
      <button onClick={toggle} aria-label="Marcar como comprado"
        className={`flex shrink-0 items-center justify-center rounded-full border-2 ${mercado ? "h-10 w-10" : "h-6 w-6"} ${item.comprado ? "border-success bg-success text-success-foreground" : "border-border"}`}>
        {item.comprado && <Check className={mercado ? "h-6 w-6" : "h-4 w-4"} />}
      </button>
      <div className="min-w-0 flex-1" onClick={mercado ? toggle : undefined}>
        <p className={`font-semibold ${mercado ? "text-lg" : ""} ${item.comprado ? "text-muted-foreground line-through" : ""}`}>{item.produto}</p>
        <p className="text-xs text-muted-foreground">
          {item.quantidade} {item.unidade} × {brl(item.precoEstimado)}
          {item.comprado && item.precoPago !== null && <> · pago {brl(item.precoPago)}</>}
        </p>
      </div>
      <span className="text-sm font-bold">{brl(item.quantidade * (item.precoPago ?? item.precoEstimado))}</span>
      {!mercado && !bloqueada && (
        <div className="flex">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={() => setEditando(true)}><Pencil className="h-4 w-4" /></button>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive" onClick={() => actions.removeItem(listaId, item.id)}><Trash2 className="h-4 w-4" /></button>
        </div>
      )}
    </li>
  );
}

function Compartilhar({ lista }: { lista: Lista }) {
  const [email, setEmail] = useState("");
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 font-bold"><Share2 className="h-4 w-4" /> Compartilhar</h3>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(email)) { actions.compartilhar(lista.id, email.trim()); setEmail(""); } }}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com"
          className="h-9 min-w-0 flex-1 rounded-md border border-input px-2 text-sm" />
        <button className="rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">Enviar</button>
      </form>
      <ul className="mt-3 space-y-1 text-sm">
        {lista.compartilhadoCom.map((e) => (
          <li key={e} className="flex items-center justify-between">
            <span>{e} <span className="text-xs text-muted-foreground">· colaborador</span></span>
            <button onClick={() => actions.removerCompartilhamento(lista.id, e)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
