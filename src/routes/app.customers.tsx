import * as React from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import {
  Users, Search, X, Heart, TrendingUp, Star, Phone, Calendar,
  ChevronRight, ShoppingBag, DollarSign, RotateCcw, Clock,
  Award, ArrowUpRight, MessageCircle, Sparkles, Gift, Crown,
  BarChart2, ArrowRight, Package, CheckCircle2, AlertCircle,
  User, Grid3X3, List,
} from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { salesRepo, kitsRepo } from "@/services/db";
import { brl, fmtDate, fmtDateLong, cls } from "@/lib/format";
import { PageHeader } from "@/components/app/app-shell";

export const Route = createFileRoute("/app/customers")({ component: CustomersPage });

/* ─── Tipos internos ────────────────────────────────────────── */
interface CustomerProfile {
  name: string;
  phone?: string;
  sales: any[];
  totalSpent: number;
  totalPaid: number;
  firstSale: number;
  lastSale: number;
  favoriteKit: string;
  cancelledCount: number;
  completedCount: number;
  tier: "vip" | "fiel" | "regular" | "nova";
  avgTicket: number;
  lifetimeValue: number;
}

/* ─── Helpers ───────────────────────────────────────────────── */
function buildCustomers(sales: any[], kits: any[]): CustomerProfile[] {
  const kitMap = new Map(kits.map(k => [k.id, k]));
  const map = new Map<string, any[]>();

  for (const s of sales) {
    const key = s.customerName.trim().toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  return [...map.entries()].map(([, customerSales]) => {
    const active   = customerSales.filter((s: any) => s.status !== "cancelado");
    const completed = customerSales.filter((s: any) => s.status === "concluido");
    const cancelled = customerSales.filter((s: any) => s.status === "cancelado");

    const totalSpent = active.reduce((a: number, s: any) => a + s.totalPrice, 0);
    const totalPaid  = active.reduce((a: number, s: any) => a + s.paidAmount, 0);
    const sorted     = [...customerSales].sort((a: any, b: any) => a.createdAt - b.createdAt);

    // Kit favorito
    const kitCount = new Map<string, number>();
    active.forEach((s: any) => kitCount.set(s.kitNameSnapshot, (kitCount.get(s.kitNameSnapshot) ?? 0) + 1));
    const favoriteKit = [...kitCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const count = active.length;
    const avgTicket = count > 0 ? totalSpent / count : 0;

    // Tier
    let tier: CustomerProfile["tier"] = "nova";
    if (count === 0)      tier = "nova";
    else if (count >= 5)  tier = "vip";
    else if (count >= 3)  tier = "fiel";
    else if (count >= 1)  tier = "regular";

    // Lifetime value estimado (histórico + projeção simples)
    const lifetimeValue = totalSpent;

    return {
      name:           sorted[0]?.customerName ?? "—",
      phone:          customerSales.find((s: any) => s.customerPhone)?.customerPhone,
      sales:          customerSales,
      totalSpent,
      totalPaid,
      firstSale:      sorted[0]?.createdAt ?? 0,
      lastSale:       sorted[sorted.length - 1]?.createdAt ?? 0,
      favoriteKit,
      cancelledCount: cancelled.length,
      completedCount: completed.length,
      avgTicket,
      lifetimeValue,
      tier,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
}

const TIER_META: Record<CustomerProfile["tier"], { label: string; icon: React.ReactNode; pill: string; glow: string }> = {
  vip:     { label: "VIP",     icon: <Crown className="size-3" />,    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-300",   glow: "ring-amber-200" },
  fiel:    { label: "Fiel",    icon: <Heart className="size-3" />,    pill: "bg-pink-50 text-pink-700 ring-1 ring-pink-200",     glow: "ring-pink-200" },
  regular: { label: "Regular", icon: <Star className="size-3" />,     pill: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", glow: "ring-violet-200" },
  nova:    { label: "Nova",    icon: <Sparkles className="size-3" />, pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",     glow: "ring-blue-200" },
};

const TIER_ORDER: CustomerProfile["tier"][] = ["vip", "fiel", "regular", "nova"];

function daysSince(ts: number) {
  return Math.round((Date.now() - ts) / 86400000);
}

/* ─── Página principal ─────────────────────────────────────── */
function CustomersPage() {
  const sales = useDb(() => salesRepo.list());
  const kits  = useDb(() => kitsRepo.list());

  const customers = React.useMemo(() => buildCustomers(sales, kits), [sales, kits]);

  // Auto-seleciona cliente se navegou com ?q=Nome
  React.useEffect(() => {
    const q = (searchParams?.q as string) ?? "";
    if (!q || customers.length === 0) return;
    const found = customers.find(c => c.name.toLowerCase() === q.toLowerCase());
    if (found) setSelected(found);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers.length]);

  const searchParams = useSearch({ strict: false }) as any;
  const [search,   setSearch]   = React.useState((searchParams?.q as string) ?? "");
  const [tierFilter, setTierFilter] = React.useState<CustomerProfile["tier"] | "todos">("todos");
  const [view,     setView]     = React.useState<"cards" | "lista">("cards");
  const [selected, setSelected] = React.useState<CustomerProfile | null>(null);

  const filtered = React.useMemo(() => {
    let list = tierFilter === "todos" ? customers : customers.filter(c => c.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.favoriteKit.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customers, search, tierFilter]);

  /* KPIs globais */
  const totalCustomers  = customers.length;
  const vipCount        = customers.filter(c => c.tier === "vip").length;
  const recurringCount  = customers.filter(c => c.sales.filter((s: any) => s.status !== "cancelado").length > 1).length;
  const totalRevenue    = customers.reduce((a, c) => a + c.totalSpent, 0);
  const avgLTV          = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const pendingReceive  = customers.reduce((a, c) => a + Math.max(0, c.totalSpent - c.totalPaid), 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <PageHeader
        title="Clientes"
        subtitle="Histórico, fidelidade e métricas de crescimento"
        action={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} setView={setView} />
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={<Users className="size-4" />}      label="Total de clientes"   value={String(totalCustomers)} color="pink" />
        <KpiCard icon={<Crown className="size-4" />}       label="Clientes VIP"        value={String(vipCount)}       color="amber" />
        <KpiCard icon={<Heart className="size-4" />}       label="Clientes recorrentes" value={String(recurringCount)} color="violet" />
        <KpiCard icon={<DollarSign className="size-4" />} label="Valor médio por cliente" value={brl(avgLTV)}         color="emerald" />
        <KpiCard icon={<Clock className="size-4" />}       label="A receber no total"  value={brl(pendingReceive)}    color="blue" />
      </div>

      {/* Insight fidelidade */}
      {totalCustomers > 0 && (
        <FidelityInsight customers={customers} />
      )}

      {/* Filtros + Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou kit…"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filtro tier */}
        <div className="flex rounded-xl border border-border overflow-hidden bg-card shrink-0">
          {(["todos", ...TIER_ORDER] as const).map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={cls(
                "px-3 py-2 text-xs font-semibold transition-colors capitalize",
                tierFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"
              )}
            >
              {t === "todos" ? "Todos" : TIER_META[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Contagem */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Lista vazia */}
      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <Users className="size-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
          {customers.length === 0 && (
            <Link to="/app/sales" className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
              Registre sua primeira venda <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      )}

      {/* Grade de cards */}
      {view === "cards" && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CustomerCard key={c.name} customer={c} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* Tabela */}
      {view === "lista" && filtered.length > 0 && (
        <CustomerTable customers={filtered} onSelect={setSelected} />
      )}

      {/* Drawer de detalhe */}
      {selected && (
        <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ─── Toggle cards / lista ─────────────────────────────────── */
function ViewToggle({ view, setView }: { view: string; setView: (v: "cards" | "lista") => void }) {
  return (
    <div className="flex rounded-xl border border-border overflow-hidden bg-card">
      {(["cards", "lista"] as const).map(v => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={cls(
            "px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors",
            view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"
          )}
        >
          {v === "cards" ? <Grid3X3 className="size-3.5" /> : <List className="size-3.5" />}
          {v === "cards" ? "Cards" : "Lista"}
        </button>
      ))}
    </div>
  );
}

/* ─── KPI card ─────────────────────────────────────────────── */
const KPI_COLOR: Record<string, string> = {
  pink:    "bg-pink-50 text-pink-700 border-pink-100",
  violet:  "bg-violet-50 text-violet-700 border-violet-100",
  blue:    "bg-blue-50 text-blue-700 border-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber:   "bg-amber-50 text-amber-700 border-amber-100",
};

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={cls("rounded-2xl border p-4 flex items-center gap-3", KPI_COLOR[color] ?? KPI_COLOR.pink)}>
      <div className="shrink-0 opacity-70">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 truncate">{label}</p>
        <p className="text-lg font-bold leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Fidelidade insight ────────────────────────────────────── */
function FidelityInsight({ customers }: { customers: CustomerProfile[] }) {
  const vip     = customers.filter(c => c.tier === "vip").length;
  const fiel    = customers.filter(c => c.tier === "fiel").length;
  const regular = customers.filter(c => c.tier === "regular").length;
  const nova    = customers.filter(c => c.tier === "nova").length;
  const total   = customers.length;

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const topSpender = customers[0];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <BarChart2 className="size-4 text-primary" />
        <h3 className="font-bold text-sm">Panorama de fidelidade</h3>
        <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded-full px-2 py-0.5 font-medium ml-auto">
          {total} clientes no total
        </span>
      </div>
      <div className="p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        {/* Barra de fidelidade */}
        <div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
            {vip     > 0 && <div className="bg-amber-400 rounded-full transition-all"  style={{ width: `${pct(vip)}%` }} />}
            {fiel    > 0 && <div className="bg-pink-400 rounded-full transition-all"   style={{ width: `${pct(fiel)}%` }} />}
            {regular > 0 && <div className="bg-violet-400 rounded-full transition-all" style={{ width: `${pct(regular)}%` }} />}
            {nova    > 0 && <div className="bg-blue-300 rounded-full transition-all"   style={{ width: `${pct(nova)}%` }} />}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <FidelityLegend color="bg-amber-400"  label="VIP"     count={vip}     pct={pct(vip)} />
            <FidelityLegend color="bg-pink-400"   label="Fiel"    count={fiel}    pct={pct(fiel)} />
            <FidelityLegend color="bg-violet-400" label="Regular" count={regular} pct={pct(regular)} />
            <FidelityLegend color="bg-blue-300"   label="Nova"    count={nova}    pct={pct(nova)} />
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-lg">
            💡 <strong>VIP</strong>: 5+ pedidos · <strong>Fiel</strong>: 3–4 pedidos · <strong>Regular</strong>: 1–2 pedidos · <strong>Nova</strong>: ainda sem pedidos concluídos
          </p>
        </div>

        {/* Destaque top cliente */}
        {topSpender && topSpender.totalSpent > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center min-w-[160px]">
            <Crown className="size-5 text-amber-500 mx-auto mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Melhor cliente</p>
            <p className="font-bold text-sm text-amber-900 truncate">{topSpender.name}</p>
            <p className="text-xs text-amber-700 font-mono font-semibold">{brl(topSpender.totalSpent)}</p>
            <p className="text-[10px] text-amber-600 mt-1">{topSpender.sales.filter((s: any) => s.status !== "cancelado").length} pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FidelityLegend({ color, label, count, pct }: { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cls("size-2.5 rounded-full shrink-0", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-bold">{count}</span>
      <span className="text-[10px] text-muted-foreground">({pct}%)</span>
    </div>
  );
}

/* ─── Customer card ─────────────────────────────────────────── */
function CustomerCard({ customer: c, onClick }: { customer: CustomerProfile; onClick: () => void }) {
  const tier   = TIER_META[c.tier];
  const active = c.sales.filter((s: any) => s.status !== "cancelado").length;
  const pending = Math.max(0, c.totalSpent - c.totalPaid);
  const days   = daysSince(c.lastSale);

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all group overflow-hidden"
    >
      {/* Top colorido */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 group-hover:from-primary/60 group-hover:to-primary/60 transition-colors" />

      <div className="p-5">
        {/* Nome + tier */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-sm leading-tight">{c.name}</p>
            {c.phone && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Phone className="size-3 opacity-50" /> {c.phone}
              </p>
            )}
          </div>
          <span className={cls("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0", tier.pill)}>
            {tier.icon} {tier.label}
          </span>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Metric label="Pedidos" value={String(active)} />
          <Metric label="Gasto total" value={brl(c.totalSpent)} mono />
          <Metric label="Ticket médio" value={brl(c.avgTicket)} mono />
        </div>

        {/* Kit favorito */}
        <div className="flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 mb-3">
          <Sparkles className="size-3 text-primary opacity-70 shrink-0" />
          <p className="text-[11px] text-muted-foreground truncate">
            Kit favorito: <span className="font-semibold text-foreground">{c.favoriteKit}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {days === 0 ? "Hoje" : days === 1 ? "Ontem" : `Há ${days} dias`}
          </span>
          {pending > 0 && (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">
              {brl(pending)} a receber
            </span>
          )}
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
        </div>
      </div>
    </button>
  );
}

function Metric({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cls("text-xs font-bold mt-0.5 truncate", mono && "font-mono")}>{value}</p>
    </div>
  );
}

/* ─── Customer table ────────────────────────────────────────── */
function CustomerTable({ customers, onSelect }: { customers: CustomerProfile[]; onSelect: (c: CustomerProfile) => void }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <th className="px-5 py-3.5">Cliente</th>
              <th className="px-5 py-3.5">Fidelidade</th>
              <th className="px-5 py-3.5 text-right">Pedidos</th>
              <th className="px-5 py-3.5 text-right">Gasto total</th>
              <th className="px-5 py-3.5 text-right">Ticket médio</th>
              <th className="px-5 py-3.5 text-right">A receber</th>
              <th className="px-5 py-3.5">Último pedido</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map(c => {
              const tier   = TIER_META[c.tier];
              const active = c.sales.filter((s: any) => s.status !== "cancelado").length;
              const pending = Math.max(0, c.totalSpent - c.totalPaid);
              return (
                <tr
                  key={c.name}
                  onClick={() => onSelect(c)}
                  className="hover:bg-surface/60 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm">{c.name}</p>
                    {c.phone && <p className="text-[11px] text-muted-foreground">{c.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cls("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", tier.pill)}>
                      {tier.icon} {tier.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold">{active}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold">{brl(c.totalSpent)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted-foreground">{brl(c.avgTicket)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {pending > 0
                      ? <span className="text-amber-600 font-semibold font-mono">{brl(pending)}</span>
                      : <span className="text-emerald-600 text-xs">Quitado</span>}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{fmtDate(c.lastSale)}</td>
                  <td className="px-5 py-3.5">
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Customer drawer (detalhe) ─────────────────────────────── */
function CustomerDrawer({ customer: c, onClose }: { customer: CustomerProfile; onClose: () => void }) {
  const [tab, setTab] = React.useState<"resumo" | "historico" | "metricas">("resumo");

  const tier    = TIER_META[c.tier];
  const active  = c.sales.filter((s: any) => s.status !== "cancelado");
  const pending = Math.max(0, c.totalSpent - c.totalPaid);

  // Whatsapp link
  const waLink = c.phone
    ? `https://wa.me/55${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.name.split(" ")[0]}! Tudo bem? 💕`)}`
    : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-card w-full sm:w-[520px] h-[90vh] sm:h-full sm:max-h-screen flex flex-col rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold">{c.name}</h2>
                <span className={cls("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", tier.pill)}>
                  {tier.icon} {tier.label}
                </span>
              </div>
              {c.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3 opacity-50" /> {c.phone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              )}
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface text-muted-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(["resumo", "historico", "metricas"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cls(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize",
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface"
                )}
              >
                {t === "resumo" ? "Resumo" : t === "historico" ? "Histórico" : "Métricas"}
              </button>
            ))}
          </div>
        </div>

        {/* Corpo com scroll */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          {tab === "resumo" && <TabResumo c={c} pending={pending} active={active} />}
          {tab === "historico" && <TabHistorico sales={c.sales} />}
          {tab === "metricas" && <TabMetricas c={c} active={active} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab Resumo ────────────────────────────────────────────── */
function TabResumo({ c, pending, active }: { c: CustomerProfile; pending: number; active: any[] }) {
  const nextEvent = active
    .filter((s: any) => s.eventDate >= Date.now() && !["concluido","cancelado"].includes(s.status))
    .sort((a: any, b: any) => a.eventDate - b.eventDate)[0];

  return (
    <>
      {/* Cards financeiros */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 mb-1">Gasto total</p>
          <p className="text-xl font-bold text-pink-700 font-mono">{brl(c.totalSpent)}</p>
          <p className="text-[11px] text-pink-500 mt-1">{active.length} pedidos ativos</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Total pago</p>
          <p className="text-xl font-bold text-emerald-700 font-mono">{brl(c.totalPaid)}</p>
          {pending > 0 && <p className="text-[11px] text-amber-600 font-semibold mt-1">{brl(pending)} pendente</p>}
        </div>
        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-1">Ticket médio</p>
          <p className="text-xl font-bold text-violet-700 font-mono">{brl(c.avgTicket)}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">1ª compra</p>
          <p className="text-sm font-bold text-blue-700">{fmtDate(c.firstSale)}</p>
          <p className="text-[11px] text-blue-500 mt-1">há {daysSince(c.firstSale)} dias</p>
        </div>
      </div>

      {/* Kit favorito */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center gap-3">
        <Sparkles className="size-5 text-primary shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kit favorito</p>
          <p className="font-bold text-sm mt-0.5">{c.favoriteKit}</p>
        </div>
      </div>

      {/* Próximo evento */}
      {nextEvent && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center gap-3">
          <Calendar className="size-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Próximo evento</p>
            <p className="font-bold text-sm text-amber-900 mt-0.5">{nextEvent.kitNameSnapshot}</p>
            <p className="text-xs text-amber-700">{fmtDateLong(nextEvent.eventDate)}</p>
          </div>
          <Link to="/app/sales" className="text-xs text-amber-700 font-semibold hover:underline shrink-0">
            ver venda
          </Link>
        </div>
      )}

      {/* Cancelamentos */}
      {c.cancelledCount > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-3 flex items-center gap-3">
          <AlertCircle className="size-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-700">
            {c.cancelledCount} pedido{c.cancelledCount > 1 ? "s" : ""} cancelado{c.cancelledCount > 1 ? "s" : ""} no histórico
          </p>
        </div>
      )}

      {/* Dica de relacionamento */}
      <RelationshipTip customer={c} />
    </>
  );
}

/* ─── Tab Histórico ─────────────────────────────────────────── */

const STATUS_META: Record<string, { label: string; pill: string }> = {
  agendado:   { label: "Agendado",   pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  confirmado: { label: "Confirmado", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  entregue:   { label: "Entregue",   pill: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
  concluido:  { label: "Concluído",  pill: "bg-gray-100 text-gray-600 ring-1 ring-gray-200" },
  cancelado:  { label: "Cancelado",  pill: "bg-red-50 text-red-600 ring-1 ring-red-200" },
};

function TabHistorico({ sales }: { sales: any[] }) {
  const sorted = [...sales].sort((a, b) => b.eventDate - a.eventDate);

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum pedido registrado ainda.</p>
      )}
      {sorted.map((s: any) => {
        const sm = STATUS_META[s.status] ?? { label: s.status, pill: "bg-gray-100 text-gray-600" };
        const pending = Math.max(0, s.totalPrice - s.paidAmount);
        return (
          <div key={s.id} className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{s.kitNameSnapshot}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="size-3 opacity-50" /> {fmtDateLong(s.eventDate)}
                </p>
              </div>
              <span className={cls("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", sm.pill)}>
                {sm.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-mono font-bold">{brl(s.totalPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pago</p>
                <p className="font-mono font-semibold text-emerald-700">{brl(s.paidAmount)}</p>
              </div>
              {pending > 0 && (
                <div>
                  <p className="text-muted-foreground">Pendente</p>
                  <p className="font-mono font-semibold text-amber-600">{brl(pending)}</p>
                </div>
              )}
              {s.returnDate && (
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><RotateCcw className="size-3" /> Retorno</p>
                  <p className="font-semibold">{fmtDate(s.returnDate)}</p>
                </div>
              )}
            </div>
            {s.notes && (
              <p className="text-[11px] text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 italic">
                "{s.notes}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Tab Métricas ──────────────────────────────────────────── */
function TabMetricas({ c, active }: { c: CustomerProfile; active: any[] }) {
  const completed  = c.sales.filter((s: any) => s.status === "concluido");
  const cancelled  = c.sales.filter((s: any) => s.status === "cancelado");
  const total      = c.sales.length;
  const cancelRate = total > 0 ? Math.round((cancelled.length / total) * 100) : 0;
  const convRate   = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Fontes de origem
  const sources = new Map<string, number>();
  c.sales.forEach((s: any) => sources.set(s.source ?? "manual", (sources.get(s.source ?? "manual") ?? 0) + 1));
  const sourceEntries = [...sources.entries()].sort((a, b) => b[1] - a[1]);

  const SOURCE_LABEL: Record<string, string> = {
    manual: "Manual", whatsapp: "WhatsApp", instagram: "Instagram", indicacao: "Indicação",
  };

  // Tempo como cliente
  const dayAsClient = daysSince(c.firstSale);

  // Frequência média entre pedidos
  const sortedDates = active.map((s: any) => s.createdAt).sort((a: number, b: number) => a - b);
  let avgFreq = 0;
  if (sortedDates.length > 1) {
    const diffs = sortedDates.slice(1).map((d: number, i: number) => (d - sortedDates[i]) / 86400000);
    avgFreq = Math.round(diffs.reduce((a: number, b: number) => a + b, 0) / diffs.length);
  }

  // Previsão próximo pedido
  const nextPredicted = avgFreq > 0 ? new Date(c.lastSale + avgFreq * 86400000) : null;
  const nextInDays    = nextPredicted ? Math.round((nextPredicted.getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="space-y-5">
      {/* Métricas de comportamento */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBox label="Taxa de conclusão"  value={`${convRate}%`}     sub={`${completed.length} de ${total} pedidos`}   color={convRate >= 70 ? "emerald" : "amber"} />
        <MetricBox label="Taxa de cancelamento" value={`${cancelRate}%`} sub={`${cancelled.length} de ${total} pedidos`}  color={cancelRate <= 10 ? "emerald" : "red"} />
        <MetricBox label="Tempo como cliente" value={`${dayAsClient}d`}  sub={`desde ${fmtDate(c.firstSale)}`}           color="blue" />
        <MetricBox label="Frequência média"   value={avgFreq > 0 ? `${avgFreq}d` : "—"} sub="entre pedidos"              color="violet" />
      </div>

      {/* Previsão */}
      {nextPredicted && (
        <div className={cls(
          "rounded-2xl border px-5 py-4 flex items-center gap-3",
          nextInDays !== null && nextInDays <= 0
            ? "bg-pink-50 border-pink-200"
            : "bg-blue-50 border-blue-200"
        )}>
          <Sparkles className={cls("size-5 shrink-0", nextInDays !== null && nextInDays <= 0 ? "text-pink-500" : "text-blue-500")} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Previsão do próximo pedido</p>
            {nextInDays !== null && nextInDays <= 0 ? (
              <p className="font-bold text-sm text-pink-700 mt-0.5">
                Está na hora de entrar em contato! 💕
              </p>
            ) : (
              <p className="font-bold text-sm text-blue-700 mt-0.5">
                Em ~{nextInDays} dias · {nextPredicted.toLocaleDateString("pt-BR")}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Baseado na frequência histórica de pedidos
            </p>
          </div>
        </div>
      )}

      {/* Origens */}
      {sourceEntries.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Como chegou até você</p>
          <div className="space-y-2">
            {sourceEntries.map(([src, count]) => (
              <div key={src} className="flex items-center gap-3">
                <p className="text-xs font-medium w-24 shrink-0">{SOURCE_LABEL[src] ?? src}</p>
                <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.round((count / total) * 100)}%` }}
                  />
                </div>
                <p className="text-xs font-bold w-6 text-right">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LTV insight */}
      <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="size-4 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor de vida do cliente (LTV)</p>
        </div>
        <p className="text-2xl font-bold font-mono text-primary">{brl(c.lifetimeValue)}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Quanto esta cliente já gerou de receita para o seu negócio no total. Clientes fiéis valem muito mais do que apenas um único pedido — investir no relacionamento vale a pena! 💕
        </p>
      </div>
    </div>
  );
}

function MetricBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber:   "bg-amber-50 border-amber-100 text-amber-700",
    red:     "bg-red-50 border-red-100 text-red-600",
    blue:    "bg-blue-50 border-blue-100 text-blue-700",
    violet:  "bg-violet-50 border-violet-100 text-violet-700",
  };
  return (
    <div className={cls("rounded-2xl border p-4", colors[color] ?? colors.blue)}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-[11px] opacity-70 mt-0.5">{sub}</p>
    </div>
  );
}

/* ─── Dica de relacionamento ────────────────────────────────── */
function RelationshipTip({ customer: c }: { customer: CustomerProfile }) {
  const active = c.sales.filter((s: any) => s.status !== "cancelado").length;
  const daysSinceLast = daysSince(c.lastSale);

  let tip = "";
  let icon = <Heart className="size-4 text-pink-400 shrink-0" />;

  if (active === 0) {
    tip = "Esta é uma cliente nova! Capriche no primeiro contato e na entrega para conquistar a fidelidade dela. 🌸";
  } else if (daysSinceLast > 90) {
    tip = `Faz ${daysSinceLast} dias desde o último pedido. Que tal mandar uma mensagem para saber como foi a festa? Pode ser a chance de uma nova venda!`;
    icon = <Clock className="size-4 text-amber-400 shrink-0" />;
  } else if (c.tier === "vip") {
    tip = "Cliente VIP! Considere oferecer um desconto especial ou prioridade de datas. Clientes assim fazem seu negócio crescer por indicações.";
    icon = <Crown className="size-4 text-amber-500 shrink-0" />;
  } else if (c.tier === "fiel") {
    tip = "Está quase VIP! Mais um pedido e ela entra no grupo das melhores clientes. Considere um mimo surpresa na próxima entrega. 🎀";
    icon = <Gift className="size-4 text-pink-400 shrink-0" />;
  } else {
    tip = "Mantenha o contato após cada evento para saber se a cliente ficou satisfeita. Clientes felizes indicam amigas! 💕";
  }

  return (
    <div className="rounded-2xl bg-pink-50 border border-pink-100 px-5 py-4 flex gap-3">
      {icon}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 mb-1">Dica de relacionamento</p>
        <p className="text-xs text-pink-800 leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}