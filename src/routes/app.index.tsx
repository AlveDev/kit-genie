import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp, TrendingDown, AlertTriangle, Calendar,
  Package, Sparkles, ArrowRight,
} from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { analytics, kitsRepo } from "@/services/db";
import { brl, fmtDateLong, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const data = useDb(() => ({
    revenue: analytics.monthRevenue(),
    prev: analytics.prevMonthRevenue(),
    salesCount: analytics.monthSalesCount(),
    costs: analytics.monthCosts(),
    profit: analytics.monthProfit(),
    lowStock: analytics.lowStock(),
    topKits: analytics.topKits(4),
    upcoming: analytics.upcomingEvents(5),
  }));

  const delta = data.prev > 0 ? ((data.revenue - data.prev) / data.prev) * 100 : 0;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Bem-vinda de volta 💕"
        subtitle="Visão geral do seu ateliê hoje"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Faturamento do mês" value={brl(data.revenue)} delta={delta} />
        <Kpi label="Eventos no mês" value={`${data.salesCount}`} hint="vendas confirmadas" />
        <Kpi label="Custos do mês" value={brl(data.costs)} hint="apenas profissionais" tone="muted" />
        <Kpi label="Lucro estimado" value={brl(data.profit)} tone={data.profit >= 0 ? "good" : "bad"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximos eventos */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="font-bold">Próximos eventos</h3>
            </div>
            <Link to="/app/sales" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              ver agenda <ArrowRight className="size-3" />
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <Empty msg="Nenhum evento agendado. Aproveite para criar novos kits!" />
          ) : (
            <div className="divide-y divide-border">
              {data.upcoming.map(s => (
                <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary-soft grid place-items-center text-primary font-display font-bold">
                    {new Date(s.eventDate).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.kitNameSnapshot}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.customerName} · {fmtDateLong(s.eventDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{brl(s.totalPrice)}</div>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alertas de estoque */}
        <Card className={cls(data.lowStock.length > 0 && "border-destructive/30 bg-destructive/5")}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className={cls("size-4", data.lowStock.length > 0 ? "text-destructive" : "text-muted-foreground")} />
            <h3 className="font-bold">Alertas de estoque</h3>
          </div>
          {data.lowStock.length === 0 ? (
            <Empty msg="Estoque saudável 💚" />
          ) : (
            <div className="space-y-3">
              {data.lowStock.slice(0, 6).map(c => {
                const usage = analytics.componentUsage(c.id);
                return (
                  <div key={c.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="font-mono font-bold text-destructive">{c.stock} {c.unit}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      mín: {c.minStock} · usado em {usage.kits.length} kit{usage.kits.length !== 1 && "s"}
                    </div>
                  </div>
                );
              })}
              <Link to="/app/components" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline pt-2">
                gerenciar estoque <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </Card>

        {/* Top kits */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="font-bold">Kits campeões do mês</h3>
            </div>
            <Link to="/app/kits" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
              ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          {data.topKits.length === 0 ? (
            <Empty msg="Sem vendas suficientes ainda" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.topKits.map(({ kit, count, revenue }) => kit && (
                <div key={kit.id} className="border border-border rounded-xl p-4 flex gap-4 items-center">
                  <div className="size-12 rounded-xl shrink-0" style={{ background: kit.imageColor ?? "var(--primary-soft)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{kit.name}</div>
                    <div className="text-xs text-muted-foreground">{count}× · {brl(revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Package className="size-4 text-primary" />
            <h3 className="font-bold">Atalhos rápidos</h3>
          </div>
          <div className="space-y-2">
            <QuickAction to="/app/sales" label="Registrar venda" />
            <QuickAction to="/app/kits" label="Criar novo kit" />
            <QuickAction to="/app/components" label="Adicionar componente" />
            <QuickAction to="/app/finance" label="Lançar custo" />
            <QuickAction to="/app/reports" label="Exportar relatório" />
          </div>
        </Card>
      </div>

      <CheckAvailabilityCard />
    </div>
  );
}

function Kpi({ label, value, delta, hint, tone }: {
  label: string; value: string; delta?: number; hint?: string; tone?: "good" | "bad" | "muted";
}) {
  const trend = delta !== undefined && (
    <div className={cls("flex items-center gap-1 text-xs font-semibold mt-2",
      delta >= 0 ? "text-emerald-600" : "text-destructive")}>
      {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {delta >= 0 ? "+" : ""}{delta.toFixed(0)}% vs mês anterior
    </div>
  );
  return (
    <div className={cls(
      "rounded-2xl p-5 border",
      tone === "good" && "border-emerald-200 bg-emerald-50/50",
      tone === "bad" && "border-destructive/20 bg-destructive/5",
      tone === "muted" && "border-border bg-card",
      !tone && "border-border bg-card",
    )}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl md:text-3xl mt-1">{value}</div>
      {trend}
      {hint && !delta && <div className="text-[11px] text-muted-foreground mt-2">{hint}</div>}
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-soft/40 transition-all text-sm font-medium">
      <span>{label}</span>
      <ArrowRight className="size-3.5 text-muted-foreground" />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado: "bg-blue-100 text-blue-700",
    confirmado: "bg-emerald-100 text-emerald-700",
    entregue: "bg-violet-100 text-violet-700",
    concluido: "bg-secondary text-secondary-foreground",
    cancelado: "bg-destructive/15 text-destructive",
  };
  return <span className={cls("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block", map[status])}>{status}</span>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground text-center py-8 italic">{msg}</div>;
}

function CheckAvailabilityCard() {
  const kits = useDb(() => kitsRepo.list());
  return (
    <div className="mt-6 rounded-2xl bg-primary-dark text-primary-foreground p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center shadow-soft">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Inteligência em ação</div>
        <h3 className="font-display text-2xl mb-2">Sistema pronto para responder pela sua cliente</h3>
        <p className="text-sm opacity-80 max-w-xl">
          {kits.length} kits cadastrados. Quando uma cliente perguntar disponibilidade,
          consulte aqui e o sistema valida automaticamente os componentes do BOM.
        </p>
      </div>
      <Link
        to="/app/sales"
        className="bg-card text-foreground px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap hover:bg-primary-soft transition-colors"
      >
        Simular venda →
      </Link>
    </div>
  );
}
