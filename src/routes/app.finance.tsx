import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Trash2, Pencil, Search, X,
  TrendingUp, TrendingDown, Wallet, Receipt,
  BarChart3, ChevronDown, Filter,
} from "lucide-react";
import { useDb } from "@/hooks/use-db";
import {
  costsRepo, analytics,
  type CostEntry, type CostKind, type CostFrequency,
} from "@/services/db";
import { brl, fmtDate, fmtDateInput, parseDateInput, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/finance")({ component: FinancePage });

/* ── Constants ──────────────────────────────────────────── */

const SUGGESTED_CATEGORIES = [
  "Aluguel", "Energia", "Internet", "Telefone",
  "Marketing", "Software", "Materiais", "Transporte",
  "Alimentação", "Saúde", "Educação", "Outro",
];

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */

function FinancePage() {
  const costs = useDb(() => costsRepo.list());
  const data = useDb(() => ({
    revenue:   analytics.monthRevenue(),
    profCosts: analytics.monthCosts(),
    persCosts: analytics.monthPersonalCosts(),
    profit:    analytics.monthProfit(),
  }));

  const [creating, setCreating]               = React.useState(false);
  const [editing, setEditing]                 = React.useState<CostEntry | null>(null);
  const [search, setSearch]                   = React.useState("");
  const [filterKind, setFilterKind]           = React.useState<CostKind | "todos">("todos");
  const [filterFrequency, setFilterFrequency] = React.useState<CostFrequency | "todos">("todos");

  /* filtered list */
  const filtered = React.useMemo(() => {
    let list = costs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.description.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q),
      );
    }
    if (filterKind !== "todos")      list = list.filter(c => c.kind === filterKind);
    if (filterFrequency !== "todos") list = list.filter(c => c.frequency === filterFrequency);
    return list;
  }, [costs, search, filterKind, filterFrequency]);

  const hasActiveFilter = search || filterKind !== "todos" || filterFrequency !== "todos";
  const clearFilters = () => { setSearch(""); setFilterKind("todos"); setFilterFrequency("todos"); };

  const handleDelete = async (c: CostEntry) => {
    if (!confirm(`Excluir "${c.description}"?`)) return;
    await costsRepo.remove(c.id);
    toast.success("Custo excluído");
  };

  /* footer total */
  const filteredTotal = filtered.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Finanças"
        subtitle="Acompanhe seus custos e a saúde financeira do negócio"
        action={
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="size-4" /> Novo custo
          </button>
        }
      />

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Receita do mês"
          value={brl(data.revenue)}
          icon={TrendingUp}
          color="emerald"
          hint="Vendas confirmadas no mês atual"
        />
        <KpiCard
          label="Custos profissionais"
          value={brl(data.profCosts)}
          icon={Receipt}
          color="violet"
          hint="Gastos do negócio no mês"
        />
        <KpiCard
          label="Custos pessoais"
          value={brl(data.persCosts)}
          icon={Wallet}
          color="pink"
          hint="Seus gastos pessoais no mês"
        />
        <KpiCard
          label="Lucro líquido"
          value={brl(data.profit)}
          icon={data.profit >= 0 ? TrendingUp : TrendingDown}
          color={data.profit >= 0 ? "emerald" : "red"}
          hint="Receita menos todos os custos"
          highlight
        />
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por descrição ou categoria…"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-card text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* kind filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={filterKind}
              onChange={e => setFilterKind(e.target.value as CostKind | "todos")}
              className="pl-9 pr-8 py-2 rounded-xl border border-border bg-card text-sm appearance-none cursor-pointer min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="todos">Todos os tipos</option>
              <option value="profissional">Profissional</option>
              <option value="pessoal">Pessoal</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* frequency filter */}
          <div className="relative">
            <select
              value={filterFrequency}
              onChange={e => setFilterFrequency(e.target.value as CostFrequency | "todos")}
              className="pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm appearance-none cursor-pointer min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="todos">Toda frequência</option>
              <option value="unico">Único</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* active-filter summary bar */}
        {hasActiveFilter && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline ml-auto"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Card>

      {/* ── Table ──────────────────────────────────────────── */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Frequência</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-surface/60 transition-colors group">
                  <td className="px-4 py-3 font-semibold">{c.description}</td>
                  <td className="px-4 py-3">
                    <KindPill kind={c.kind} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category || "—"}</td>
                  <td className="px-4 py-3">
                    <FrequencyPill frequency={c.frequency} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtDate(c.date)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-destructive tabular-nums">
                    − {brl(c.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(c)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="size-3.5 text-destructive/70" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-12 rounded-2xl bg-surface flex items-center justify-center">
                        <BarChart3 className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground/70 text-sm">
                          {hasActiveFilter ? "Nenhum custo encontrado" : "Nenhum custo lançado ainda"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {hasActiveFilter
                            ? "Tente ajustar os filtros acima"
                            : 'Clique em "Novo custo" para começar'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer total */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-surface/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} custo{filtered.length !== 1 ? "s" : ""} exibido{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold font-mono text-destructive tabular-nums">
              Total: − {brl(filteredTotal)}
            </span>
          </div>
        )}
      </Card>

      {creating && <CostDialog onClose={() => setCreating(false)} />}
      {editing  && <CostDialog cost={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════ */

type KpiColor = "emerald" | "violet" | "pink" | "red" | "blue";

const KPI_COLORS: Record<KpiColor, string> = {
  emerald: "bg-emerald-50   border-emerald-200  text-emerald-700",
  violet:  "bg-violet-50    border-violet-200   text-violet-700",
  pink:    "bg-pink-50      border-pink-200     text-pink-700",
  red:     "bg-red-50       border-red-200      text-red-700",
  blue:    "bg-blue-50      border-blue-200     text-blue-700",
};

const KPI_ICON_BG: Record<KpiColor, string> = {
  emerald: "bg-emerald-100",
  violet:  "bg-violet-100",
  pink:    "bg-pink-100",
  red:     "bg-red-100",
  blue:    "bg-blue-100",
};

const KPI_RING: Record<KpiColor, string> = {
  emerald: "ring-2 ring-emerald-300/70 ring-offset-1",
  violet:  "ring-2 ring-violet-300/70  ring-offset-1",
  pink:    "ring-2 ring-pink-300/70    ring-offset-1",
  red:     "ring-2 ring-red-300/70     ring-offset-1",
  blue:    "ring-2 ring-blue-300/70    ring-offset-1",
};

function KpiCard({
  label, value, icon: Icon, color, hint, highlight,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: KpiColor;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cls(
      "rounded-2xl p-5 border",
      KPI_COLORS[color],
      highlight && KPI_RING[color],
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 leading-tight max-w-[80%]">
          {label}
        </p>
        <div className={cls("p-1.5 rounded-lg shrink-0", KPI_ICON_BG[color])}>
          <Icon className="size-3.5" />
        </div>
      </div>
      <p className="font-display text-2xl md:text-3xl font-bold tabular-nums leading-none">
        {value}
      </p>
      {hint && (
        <p className="text-[10px] opacity-50 mt-1.5 leading-tight">{hint}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PILLS
══════════════════════════════════════════════════════════ */

function KindPill({ kind }: { kind: CostKind }) {
  return (
    <span className={cls(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1",
      kind === "profissional"
        ? "bg-violet-50 text-violet-700 ring-violet-200"
        : "bg-pink-50   text-pink-700   ring-pink-200",
    )}>
      {kind === "profissional" ? "Profissional" : "Pessoal"}
    </span>
  );
}

const FREQUENCY_MAP: Record<CostFrequency, { label: string; style: string }> = {
  unico:  { label: "Único",  style: "bg-slate-50  text-slate-600  ring-slate-200" },
  mensal: { label: "Mensal", style: "bg-blue-50   text-blue-700   ring-blue-200"  },
  anual:  { label: "Anual",  style: "bg-amber-50  text-amber-700  ring-amber-200" },
};

function FrequencyPill({ frequency }: { frequency: CostFrequency }) {
  const { label, style } = FREQUENCY_MAP[frequency] ?? FREQUENCY_MAP.unico;
  return (
    <span className={cls(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1",
      style,
    )}>
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   DIALOG
══════════════════════════════════════════════════════════ */

function CostDialog({ cost, onClose }: { cost?: CostEntry; onClose: () => void }) {
  const isEditing = !!cost;

  const [form, setForm] = React.useState({
    description: cost?.description ?? "",
    kind:        (cost?.kind      ?? "profissional") as CostKind,
    category:    cost?.category   ?? "",
    amount:      cost?.amount     ?? (0 as number),
    frequency:   (cost?.frequency ?? "unico") as CostFrequency,
    date:        fmtDateInput(cost?.date ?? Date.now()),
  });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  /* keyboard close */
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const save = async () => {
    if (!form.description.trim()) {
      toast.error("Informe uma descrição para o custo");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      toast.error("Informe um valor maior que zero");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, date: parseDateInput(form.date) };
      if (isEditing) {
        await costsRepo.update(cost.id, payload);
        toast.success("Custo atualizado! ✓");
      } else {
        await costsRepo.create(payload);
        toast.success("Custo registrado! ✓");
      }
      onClose();
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const frequencyHint: Record<CostFrequency, string> = {
    unico:  "Aparece apenas uma vez",
    mensal: "Contabilizado todo mês",
    anual:  "Contabilizado 1× por ano",
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-3xl max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold">
              {isEditing ? "Editar custo" : "Novo custo"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Atualize os dados deste custo"
                : "Registre um gasto profissional ou pessoal"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
            aria-label="Fechar"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4">
          <Field label="Descrição" hint='Ex: "Aluguel do espaço", "Netflix", "Gasolina"'>
            <input
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="O que é esse custo?"
              className="inp"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select
                value={form.kind}
                onChange={e => set("kind", e.target.value as CostKind)}
                className="inp"
              >
                <option value="profissional">💼 Profissional</option>
                <option value="pessoal">🏠 Pessoal</option>
              </select>
            </Field>

            <Field label="Categoria">
              <input
                value={form.category}
                onChange={e => set("category", e.target.value)}
                placeholder="Ex: Aluguel"
                list="finance-categories"
                className="inp"
              />
              <datalist id="finance-categories">
                {SUGGESTED_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>

            <Field label="Valor (R$)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount || ""}
                onChange={e => set("amount", Number(e.target.value))}
                placeholder="0,00"
                className="inp"
              />
            </Field>

            <Field label="Frequência" hint={frequencyHint[form.frequency]}>
              <select
                value={form.frequency}
                onChange={e => set("frequency", e.target.value as CostFrequency)}
                className="inp"
              >
                <option value="unico">Único</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </Field>

            <Field label="Data" col2>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                className="inp"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-8 pb-7 pt-5 border-t border-border">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
                       hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
          >
            {saving
              ? "Salvando…"
              : isEditing ? "Salvar alterações" : "Registrar custo"}
          </button>
        </div>
      </div>

      <style>{`
        .inp {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--card);
          font-size: 0.875rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          color: var(--foreground);
        }
        .inp:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
        }
        .inp::placeholder { color: var(--muted-foreground); opacity: 0.6; }
      `}</style>
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────── */
function Field({
  label, hint, children, col2,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  col2?: boolean;
}) {
  return (
    <div className={col2 ? "col-span-2" : ""}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-muted-foreground/60 mt-1 leading-tight">{hint}</p>
      )}
    </div>
  );
}