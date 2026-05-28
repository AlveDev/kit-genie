import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp, TrendingDown, AlertTriangle, Calendar,
  Package, ArrowRight, ChevronRight, Sparkles, Star,
  DollarSign, ShoppingBag, Target, Zap,
  CheckCircle2, BarChart2, MessageCircle, Trophy,
  Percent, RotateCcw, Award,
} from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { analytics, kitsRepo, salesRepo, settingsRepo } from "@/services/db";
import { brl, cls } from "@/lib/format";
import { PageHeader } from "@/components/app/app-shell";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
}
function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}

/* ─── Dashboard ─────────────────────────────────────────────── */
function Dashboard() {
  const d = useDb(() => ({
    revenue:    analytics.monthRevenue(),
    prev:       analytics.prevMonthRevenue(),
    salesCount: analytics.monthSalesCount(),
    costs:      analytics.monthCosts(),
    profit:     analytics.monthProfit(),
    lowStock:   analytics.lowStock(),
    topKits:    analytics.topKits(5),
    upcoming:   analytics.upcomingEvents(6),
    allSales:   salesRepo.list(),
    kits:       kitsRepo.list(),
    settings:   settingsRepo.get(),
  }));

  const revDelta      = pct(d.revenue, d.prev);
  const goalAmount    = d.settings.goalAmount ?? 0;
  const goalGrowthPct = d.settings.goalGrowthPct ?? 10;
  const metaGoal      = goalAmount > 0 ? goalAmount : d.prev > 0 ? d.prev * (1 + goalGrowthPct / 100) : 2000;
  const metaPct       = clamp(Math.round((d.revenue / metaGoal) * 100));
  const goalMode      = goalAmount > 0 ? "fixo" : "crescimento";

  const activeCount = d.allSales.filter(s => s.status !== "cancelado").length;
  const avgTicket   = activeCount > 0 ? d.revenue / activeCount : 0;
  const converted   = d.allSales.filter(s => ["confirmado","entregue","concluido"].includes(s.status)).length;
  const convRate    = activeCount > 0 ? Math.round((converted / activeCount) * 100) : 0;

  // Retornos pendentes: vendas com returnDate nos próximos 7 dias
  const now = Date.now();
  const in7 = now + 7 * 86400000;
  const pendingReturns = d.allSales.filter(s =>
    s.returnDate && s.returnDate >= now && s.returnDate <= in7 &&
    !["cancelado","concluido"].includes(s.status)
  );

  // Receita a receber: totalPrice - paidAmount de vendas ativas
  const receivable = d.allSales
    .filter(s => !["cancelado","concluido"].includes(s.status))
    .reduce((acc, s) => acc + Math.max(0, s.totalPrice - s.paidAmount), 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{greeting} 💕</p>
          <h1 className="font-display text-3xl font-bold leading-tight">Visão geral do negócio</h1>
        </div>
        <Link to="/app/sales" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto">
          <ShoppingBag className="size-4" /> Nova venda
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={<DollarSign className="size-4" />}  label="Faturamento do mês" value={brl(d.revenue)}       delta={revDelta}  color="pink"    sub={d.prev > 0 ? `${brl(d.prev)} no mês anterior` : undefined} />
        <KpiCard icon={<ShoppingBag className="size-4" />} label="Vendas no mês"      value={String(d.salesCount)} color="violet"  sub={`${d.kits.length} kits disponíveis`} />
        <KpiCard icon={<Target className="size-4" />}      label="Ticket médio"        value={brl(avgTicket)}       color="blue"    sub={`${convRate}% taxa de confirmação`} />
        <KpiCard icon={<TrendingUp className="size-4" />}  label="Lucro estimado"      value={brl(d.profit)}        color={d.profit >= 0 ? "emerald" : "red"} sub={`${brl(d.costs)} em custos`} />
      </div>

      {/* Meta do mês */}
      <MonthGoal revenue={d.revenue} goal={metaGoal} pct={metaPct} revDelta={revDelta} goalMode={goalMode} goalGrowthPct={goalGrowthPct} />

      {/* Alertas contextuais */}
      {(pendingReturns.length > 0 || receivable > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {pendingReturns.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <RotateCcw className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {pendingReturns.length} retorno{pendingReturns.length > 1 ? "s" : ""} nos próximos 7 dias
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {pendingReturns.map(s => s.customerName).join(", ")}
                </p>
              </div>
              <Link to="/app/sales" className="ml-auto text-xs text-amber-700 font-semibold hover:underline shrink-0">ver agenda</Link>
            </div>
          )}
          {receivable > 0 && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
              <DollarSign className="size-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-800">
                  {brl(receivable)} a receber
                </p>
                <p className="text-xs text-blue-700 mt-0.5">Saldo pendente de vendas ativas</p>
              </div>
              <Link to="/app/sales" className="ml-auto text-xs text-blue-700 font-semibold hover:underline shrink-0">ver vendas</Link>
            </div>
          )}
        </div>
      )}

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Próximos eventos */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="font-bold text-sm">Próximos eventos</h3>
            </div>
            <Link to="/app/sales" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              ver agenda <ChevronRight className="size-3" />
            </Link>
          </div>
          {d.upcoming.length === 0 ? (
            <EmptyState icon={<Calendar className="size-8 opacity-20" />} msg="Nenhum evento agendado." cta={{ label: "Registrar venda", to: "/app/sales" }} />
          ) : (
            <div className="divide-y divide-border">
              {d.upcoming.map(s => <EventRow key={s.id} sale={s} />)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <StockAlerts items={d.lowStock} />
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Zap className="size-4 text-primary" />
              <h3 className="font-bold text-sm">Atalhos</h3>
            </div>
            <div className="p-3 space-y-1">
              <QuickAction to="/app/sales"      icon={<ShoppingBag className="size-3.5" />} label="Registrar venda" />
              <QuickAction to="/app/kits"       icon={<Sparkles className="size-3.5" />}    label="Criar novo kit" />
              <QuickAction to="/app/components" icon={<Package className="size-3.5" />}     label="Adicionar componente" />
              <QuickAction to="/app/finance"    icon={<DollarSign className="size-3.5" />}  label="Lançar custo" />
              <QuickAction to="/app/reports"    icon={<BarChart2 className="size-3.5" />}   label="Exportar relatório" />
            </div>
          </div>
        </div>
      </div>

      {/* Kits campeões — destaque total */}
      <TopKits topKits={d.topKits} allSales={d.allSales} />

      {/* Painel de inteligência de negócio */}
      <BusinessInsights allSales={d.allSales} kits={d.kits} />

      {/* Banner growth */}
      <GrowthBanner kitsCount={d.kits.length} />

    </div>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────── */
const KPI_STYLES: Record<string, string> = {
  pink:    "bg-pink-50 border-pink-100 text-pink-700",
  violet:  "bg-violet-50 border-violet-100 text-violet-700",
  blue:    "bg-blue-50 border-blue-100 text-blue-700",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  red:     "bg-red-50 border-red-100 text-red-600",
};

function KpiCard({ icon, label, value, delta, color, sub }: {
  icon: React.ReactNode; label: string; value: string;
  delta?: number; color: string; sub?: string;
}) {
  return (
    <div className={cls("rounded-2xl border p-4 flex flex-col gap-2", KPI_STYLES[color] ?? KPI_STYLES.pink)}>
      <div className="flex items-center justify-between">
        <span className="opacity-60">{icon}</span>
        {delta !== undefined && (
          <span className={cls("text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
            delta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
            {delta >= 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
      </div>
      {sub && <p className="text-[10px] opacity-50 font-medium">{sub}</p>}
    </div>
  );
}

/* ─── Meta do mês ───────────────────────────────────────────── */
function MonthGoal({ revenue, goal, pct, revDelta, goalMode, goalGrowthPct }: {
  revenue: number; goal: number; pct: number; revDelta: number; goalMode: string; goalGrowthPct: number;
}) {
  const segments = [25, 50, 75, 100];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <h3 className="font-bold text-sm">Meta do mês</h3>
          <span className="text-[10px] bg-surface border border-border rounded-full px-2 py-0.5 text-muted-foreground font-semibold">
            {goalMode === "fixo" ? "meta personalizada" : `+${goalGrowthPct}% vs mês anterior`}
          </span>
          <Link to="/app/settings" className="text-[10px] text-primary hover:underline font-semibold ml-1">alterar meta</Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{brl(revenue)}</span> de {brl(goal)}
          </span>
          <span className={cls("font-bold text-xs px-2 py-0.5 rounded-full",
            pct >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="relative h-3 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className={cls("h-full rounded-full transition-all duration-700",
            pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-primary" : pct >= 50 ? "bg-amber-400" : "bg-blue-400")}
          style={{ width: `${clamp(pct)}%` }}
        />
        {segments.map(s => (
          <div key={s} className="absolute top-0 bottom-0 w-px bg-card" style={{ left: `${s}%` }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-medium">
        {segments.map(s => <span key={s}>{s}%</span>)}
      </div>
      {pct >= 100 && (
        <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" /> Meta atingida! Parabéns 🎉
        </p>
      )}
      {pct < 100 && revDelta < 0 && (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 font-medium flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" /> Faturamento abaixo do mês anterior. Que tal uma promoção relâmpago?
        </p>
      )}
    </div>
  );
}

/* ─── Event row ─────────────────────────────────────────────── */
const STATUS_DOT: Record<string, string> = {
  agendado: "bg-blue-400", confirmado: "bg-emerald-500",
  entregue: "bg-violet-500", concluido: "bg-gray-400", cancelado: "bg-red-400",
};

function EventRow({ sale: s }: { sale: any }) {
  const d = new Date(s.eventDate);
  const today = new Date();
  const diffDays = Math.ceil((d.getTime() - today.setHours(0,0,0,0)) / 86400000);
  const urgent = diffDays >= 0 && diffDays <= 3;
  return (
    <div className={cls("flex items-center gap-4 px-5 py-3.5 hover:bg-surface/60 transition-colors", urgent && "bg-amber-50/40")}>
      <div className="shrink-0 w-10 text-center">
        <p className="text-xs text-muted-foreground font-medium leading-none mb-0.5">
          {d.toLocaleString("pt-BR", { month: "short" }).replace(".","").toUpperCase()}
        </p>
        <p className="text-lg font-bold leading-none">{d.getDate()}</p>
      </div>
      <span className={cls("size-2 rounded-full shrink-0", STATUS_DOT[s.status] ?? "bg-gray-300")} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{s.customerName}</p>
        <p className="text-xs text-muted-foreground truncate">{s.kitNameSnapshot}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-sm font-mono">{brl(s.totalPrice)}</p>
        {urgent && diffDays >= 0 && (
          <p className="text-[10px] text-amber-600 font-bold">
            {diffDays === 0 ? "hoje!" : diffDays === 1 ? "amanhã" : `em ${diffDays}d`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Stock alerts ──────────────────────────────────────────── */
function StockAlerts({ items }: { items: any[] }) {
  const danger = items.length > 0;
  return (
    <div className={cls("rounded-2xl border bg-card overflow-hidden", danger ? "border-red-200" : "border-border")}>
      <div className={cls("flex items-center gap-2 px-5 py-4 border-b", danger ? "border-red-100 bg-red-50/50" : "border-border")}>
        <AlertTriangle className={cls("size-4", danger ? "text-red-500" : "text-muted-foreground")} />
        <h3 className="font-bold text-sm">Alertas de estoque</h3>
        {danger && <span className="ml-auto text-[10px] bg-red-100 text-red-700 font-bold rounded-full px-2 py-0.5">{items.length}</span>}
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-6 text-center">
          <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Estoque saudável</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.slice(0, 4).map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0 mr-3">
                <p className="text-xs font-semibold truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">mín: {c.minStock} {c.unit}</p>
              </div>
              <span className="text-xs font-mono font-bold text-red-600 shrink-0">{c.stock} {c.unit}</span>
            </div>
          ))}
          <div className="px-5 py-3">
            <Link to="/app/components" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline">
              gerenciar estoque <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Top kits — bloco destacado ────────────────────────────── */
function TopKits({ topKits, allSales }: { topKits: any[]; allSales: any[] }) {
  if (topKits.length === 0) return null;
  const max = topKits[0]?.count ?? 1;
  const totalRevenue = topKits.reduce((a, k) => a + k.revenue, 0);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <h3 className="font-bold text-sm">Kits campeões</h3>
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
            histórico completo
          </span>
        </div>
        <Link to="/app/kits" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
          gerenciar kits <ChevronRight className="size-3" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border">
        {topKits.slice(0, 3).map(({ kit, count, revenue }, i) => kit && (
          <div key={kit.id} className="p-5 flex gap-4 items-start">
            {/* Thumbnail */}
            <div className="relative shrink-0">
              <div className="size-14 rounded-xl overflow-hidden border border-border">
                {kit.imageUrl ? (
                  <img src={kit.imageUrl} alt={kit.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: kit.imageColor ?? "var(--primary-soft)" }} />
                )}
              </div>
              <span className={cls(
                "absolute -top-2 -left-2 size-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm",
                i === 0 ? "bg-amber-400 text-white" :
                i === 1 ? "bg-gray-300 text-gray-700" :
                          "bg-orange-200 text-orange-700"
              )}>
                {i + 1}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate mb-1">{kit.name}</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Vendas</span>
                  <span className="font-bold">{count}×</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={cls("h-full rounded-full", i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : "bg-orange-300")}
                    style={{ width: `${Math.round((count / max) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Receita</span>
                  <span className="font-bold text-primary">{brl(revenue)}</span>
                </div>
                {totalRevenue > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Participação</span>
                    <span className="font-semibold text-muted-foreground">{Math.round((revenue / totalRevenue) * 100)}% do total</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking completo (4º e 5º) */}
      {topKits.length > 3 && (
        <div className="divide-y divide-border">
          {topKits.slice(3).map(({ kit, count, revenue }, i) => kit && (
            <div key={kit.id} className="flex items-center gap-4 px-6 py-3">
              <span className="text-xs font-bold text-muted-foreground w-5">{i + 4}º</span>
              <div className="size-8 rounded-lg overflow-hidden border border-border shrink-0">
                {kit.imageUrl
                  ? <img src={kit.imageUrl} alt={kit.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: kit.imageColor ?? "var(--primary-soft)" }} />
                }
              </div>
              <p className="flex-1 text-sm font-medium truncate">{kit.name}</p>
              <span className="text-xs text-muted-foreground shrink-0">{count}×</span>
              <span className="text-xs font-bold font-mono shrink-0">{brl(revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Business insights ─────────────────────────────────────── */
function BusinessInsights({ allSales, kits }: { allSales: any[]; kits: any[] }) {
  // Kit mais lucrativo (maior margem estimada)
  const activeSales = allSales.filter(s => s.status !== "cancelado");

  // Dia da semana com mais eventos
  const dayCounts = [0,0,0,0,0,0,0];
  activeSales.forEach(s => { dayCounts[new Date(s.eventDate).getDay()]++; });
  const busyDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const DAY_NAMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

  // Taxa de cancelamento
  const total     = allSales.length;
  const cancelled = allSales.filter(s => s.status === "cancelado").length;
  const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  // Receita média por mês (últimos 3 meses)
  const now = Date.now();
  const last3months = activeSales.filter(s => s.eventDate >= now - 90 * 86400000);
  const avg3 = last3months.length > 0 ? last3months.reduce((a, s) => a + s.totalPrice, 0) / 3 : 0;

  // Clientes recorrentes
  const customerMap = new Map<string, number>();
  activeSales.forEach(s => customerMap.set(s.customerName, (customerMap.get(s.customerName) ?? 0) + 1));
  const recurring = [...customerMap.values()].filter(v => v > 1).length;

  if (total === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <Award className="size-4 text-primary" />
        <h3 className="font-bold text-sm">Inteligência do negócio</h3>
        <span className="text-[10px] text-muted-foreground bg-surface border border-border rounded-full px-2 py-0.5 font-medium">baseado em todas as suas vendas</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <InsightCard
          icon={<Calendar className="size-4 text-violet-500" />}
          label="Dia mais movimentado"
          value={dayCounts[busyDayIdx] > 0 ? DAY_NAMES[busyDayIdx] : "—"}
          sub={dayCounts[busyDayIdx] > 0 ? `${dayCounts[busyDayIdx]} eventos no histórico` : "sem dados ainda"}
          color="violet"
        />
        <InsightCard
          icon={<Percent className="size-4 text-red-400" />}
          label="Taxa de cancelamento"
          value={`${cancelRate}%`}
          sub={`${cancelled} de ${total} vendas`}
          color={cancelRate <= 10 ? "emerald" : cancelRate <= 20 ? "amber" : "red"}
        />
        <InsightCard
          icon={<BarChart2 className="size-4 text-blue-500" />}
          label="Média mensal (3 meses)"
          value={brl(avg3)}
          sub="receita média por mês"
          color="blue"
        />
        <InsightCard
          icon={<Star className="size-4 text-amber-500" />}
          label="Clientes recorrentes"
          value={String(recurring)}
          sub={`de ${customerMap.size} clientes no total`}
          color="amber"
        />
      </div>
    </div>
  );
}

function InsightCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    violet:  "text-violet-700",
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    blue:    "text-blue-700",
    red:     "text-red-600",
  };
  return (
    <div className="p-5">
      <div className="mb-3">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={cls("text-xl font-bold", colors[color] ?? "text-foreground")}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

/* ─── Growth banner ─────────────────────────────────────────── */
function GrowthBanner({ kitsCount }: { kitsCount: number }) {
  return (
    <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="size-4 opacity-70" />
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Automação WhatsApp</span>
        </div>
        <h3 className="font-display text-2xl font-bold mb-2 leading-tight">Responda orçamentos enquanto você dorme</h3>
        <p className="text-sm opacity-75 max-w-xl leading-relaxed">
          {kitsCount} kits cadastrados prontos para o bot responder automaticamente.
          Ative o plano premium e pare de perder clientes por demora na resposta.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Link to="/app/settings" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors text-center">
          Ativar automação →
        </Link>
        <Link to="/app/sales" className="text-center text-xs text-white/60 hover:text-white/90 transition-colors">
          ou simular venda primeiro
        </Link>
      </div>
    </div>
  );
}

/* ─── Quick action ──────────────────────────────────────────── */
function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface transition-colors text-sm font-medium group">
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      <span>{label}</span>
      <ChevronRight className="size-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

/* ─── Empty state ───────────────────────────────────────────── */
function EmptyState({ icon, msg, cta }: { icon: React.ReactNode; msg: string; cta?: { label: string; to: string } }) {
  return (
    <div className="py-12 text-center px-5">
      <div className="flex justify-center mb-3 text-muted-foreground">{icon}</div>
      <p className="text-sm text-muted-foreground mb-3">{msg}</p>
      {cta && (
        <Link to={cta.to} className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
          {cta.label} <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}