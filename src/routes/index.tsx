import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, brl, dataBR, totais, useListas, type Lista } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minhas listas — Cestinha" },
      { name: "description", content: "Veja suas listas de compras ativas e o histórico de listas anteriores." },
      { property: "og:title", content: "Minhas listas — Cestinha" },
      { property: "og:description", content: "Listas de compras ativas e histórico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MinhasListas,
});

function MinhasListas() {
  const listas = useListas();
  const [aba, setAba] = useState<"ativas" | "historico">("ativas");
  const [nome, setNome] = useState("");
  const navigate = useNavigate();
  const visiveis = listas.filter((l) => (aba === "ativas" ? !l.concluida : l.concluida));
  const nAtivas = listas.filter((l) => !l.concluida).length;

  const criar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const id = actions.criar(nome.trim());
    setNome("");
    navigate({ to: "/lista/$id", params: { id } });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Minhas listas</h1>
          <p className="mt-1 text-muted-foreground">Organize o que comprar e acompanhe quanto gastou.</p>
        </div>
        <form onSubmit={criar} className="flex w-full gap-2 md:w-auto">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da nova lista"
            className="h-11 flex-1 rounded-lg border border-input bg-card px-3 outline-none focus:ring-2 focus:ring-ring md:w-64" />
          <button className="inline-flex h-11 items-center gap-1 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Criar
          </button>
        </form>
      </div>

      <div className="mt-8 inline-flex rounded-lg bg-muted p-1">
        {(["ativas", "historico"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${aba === a ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
            {a === "ativas" ? `Ativas (${nAtivas})` : `Histórico (${listas.length - nAtivas})`}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {aba === "ativas" ? "Nenhuma lista ativa. Crie uma acima!" : "Nenhuma lista concluída ainda."}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((l) => <ListaCard key={l.id} lista={l} />)}
        </div>
      )}
    </AppShell>
  );
}

function ListaCard({ lista }: { lista: Lista }) {
  const t = totais(lista);
  const navigate = useNavigate();
  const pct = t.total ? (t.comprados / t.total) * 100 : 0;
  const btn = "rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground";
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <Link to="/lista/$id" params={{ id: lista.id }} className="block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{lista.nome}</h3>
          {lista.concluida && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Concluída</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Criada em {dataBR(lista.criadaEm)} · {t.total} itens</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-success" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Estimado <b className="text-foreground">{brl(t.estimado)}</b></span>
          <span className="text-muted-foreground">Gasto <b className="text-primary">{brl(t.gasto)}</b></span>
        </div>
      </Link>
      <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
        {!lista.concluida && (
          <>
            <button title="Renomear" className={btn} onClick={() => { const n = prompt("Novo nome", lista.nome); if (n?.trim()) actions.renomear(lista.id, n.trim()); }}><Pencil className="h-4 w-4" /></button>
            <button title="Concluir" className={btn} onClick={() => actions.concluir(lista.id)}><CheckCircle2 className="h-4 w-4" /></button>
          </>
        )}
        <button title="Duplicar" className={btn} onClick={() => { const id = actions.duplicar(lista.id); if (id) navigate({ to: "/lista/$id", params: { id } }); }}><Copy className="h-4 w-4" /></button>
        <button title="Excluir" className={`${btn} hover:text-destructive`} onClick={() => confirm(`Excluir "${lista.nome}"?`) && actions.excluir(lista.id)}><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
