import { useSyncExternalStore } from "react";

// Frontend-only mock store; the backend team will replace these functions with real API calls.
export type Unidade = "un" | "kg" | "g" | "L" | "ml" | "pct";
export type Item = {
  id: string;
  produto: string;
  categoria: string;
  quantidade: number;
  unidade: Unidade;
  precoEstimado: number;
  precoPago: number | null;
  comprado: boolean;
};
export type Lista = { id: string; nome: string; criadaEm: string; concluida: boolean; itens: Item[] };

export const CATEGORIAS = ["Hortifruti", "Padaria", "Laticínios", "Carnes", "Mercearia", "Bebidas", "Limpeza", "Higiene"];
export const UNIDADES: Unidade[] = ["un", "kg", "g", "L", "ml", "pct"];

const uid = () => Math.random().toString(36).slice(2, 10);
const it = (produto: string, categoria: string, quantidade: number, unidade: Unidade, precoEstimado: number, precoPago: number | null = null): Item => ({
  id: uid(), produto, categoria, quantidade, unidade, precoEstimado, precoPago, comprado: precoPago !== null,
});

let listas: Lista[] = [
  { id: "l1", nome: "Compra da semana", criadaEm: "2026-11-07", concluida: false, itens: [
    it("Banana prata", "Hortifruti", 1.5, "kg", 6.9, 7.2), it("Tomate", "Hortifruti", 1, "kg", 8.5),
    it("Pão francês", "Padaria", 10, "un", 0.8, 0.75), it("Leite integral", "Laticínios", 6, "L", 5.49),
    it("Queijo muçarela", "Laticínios", 300, "g", 0.07), it("Arroz", "Mercearia", 1, "pct", 24.9),
    it("Café", "Mercearia", 1, "pct", 18.5), it("Detergente", "Limpeza", 2, "un", 2.79),
  ]},
  { id: "l2", nome: "Churrasco de sábado", criadaEm: "2026-11-08", concluida: false, itens: [
    it("Picanha", "Carnes", 1.2, "kg", 79.9), it("Carvão", "Mercearia", 1, "pct", 22),
    it("Refrigerante", "Bebidas", 2, "L", 9.5),
  ]},
  { id: "l3", nome: "Mês de outubro", criadaEm: "2026-10-02", concluida: true, itens: [
    it("Feijão", "Mercearia", 2, "pct", 8.9, 8.49), it("Sabonete", "Higiene", 4, "un", 2.5, 2.2),
    it("Maçã", "Hortifruti", 1, "kg", 11.9, 12.5),
  ]},
];

const subs = new Set<() => void>();
const set = (next: Lista[]) => { listas = next; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => subs.delete(f); };

export const useListas = () => useSyncExternalStore(subscribe, () => listas, () => listas);
export const useLista = (id: string) => useListas().find((l) => l.id === id);

const updateLista = (id: string, fn: (l: Lista) => Lista) => set(listas.map((l) => (l.id === id ? fn(l) : l)));

export const actions = {
  criar: (nome: string) => { const id = uid(); set([{ id, nome, criadaEm: new Date().toISOString().slice(0, 10), concluida: false, itens: [] }, ...listas]); return id; },
  renomear: (id: string, nome: string) => updateLista(id, (l) => ({ ...l, nome })),
  excluir: (id: string) => set(listas.filter((l) => l.id !== id)),
  concluir: (id: string) => updateLista(id, (l) => ({ ...l, concluida: true })),
  duplicar: (id: string) => {
    const o = listas.find((l) => l.id === id); if (!o) return;
    const nid = uid();
    set([{ ...o, id: nid, nome: `${o.nome} (cópia)`, criadaEm: new Date().toISOString().slice(0, 10), concluida: false,
      itens: o.itens.map((i) => ({ ...i, id: uid(), comprado: false, precoPago: null })) }, ...listas]);
    return nid;
  },
  addItem: (id: string, item: Omit<Item, "id" | "comprado" | "precoPago">) =>
    updateLista(id, (l) => ({ ...l, itens: [...l.itens, { ...item, id: uid(), comprado: false, precoPago: null }] })),
  updateItem: (id: string, itemId: string, patch: Partial<Item>) =>
    updateLista(id, (l) => ({ ...l, itens: l.itens.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })),
  removeItem: (id: string, itemId: string) => updateLista(id, (l) => ({ ...l, itens: l.itens.filter((i) => i.id !== itemId) })),
};

export const totais = (l: Lista) => {
  const estimado = l.itens.reduce((s, i) => s + i.quantidade * i.precoEstimado, 0);
  const gasto = l.itens.reduce((s, i) => s + (i.comprado ? i.quantidade * (i.precoPago ?? i.precoEstimado) : 0), 0);
  const comprados = l.itens.filter((i) => i.comprado).length;
  return { estimado, gasto, comprados, total: l.itens.length };
};

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dataBR = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
