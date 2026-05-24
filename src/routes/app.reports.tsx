import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { salesRepo, componentsRepo, costsRepo, kitsRepo, analytics } from "@/services/db";
import { brl, fmtDate, downloadCsv } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

function ReportsPage() {
  const data = useDb(() => ({
    revenue: analytics.monthRevenue(),
    profit: analytics.monthProfit(),
    salesCount: analytics.monthSalesCount(),
    lowStock: analytics.lowStock(),
    topKits: analytics.topKits(10),
  }));

  const exportSales = () => {
    const rows = salesRepo.list().map(s => ({
      Cliente: s.customerName, WhatsApp: s.customerPhone ?? "",
      Kit: s.kitNameSnapshot, Evento: fmtDate(s.eventDate),
      Valor: s.totalPrice, Pago: s.paidAmount, Status: s.status, Origem: s.source,
    }));
    downloadCsv("vendas.csv", rows);
    toast.success("Relatório de vendas exportado");
  };
  const exportStock = () => {
    const rows = componentsRepo.list().map(c => ({
      Componente: c.name, Categoria: c.category, Estoque: c.stock, Unidade: c.unit,
      "Estoque mínimo": c.minStock, "Custo unitário": c.unitCost,
      Reutilizável: c.reusable ? "Sim" : "Não",
    }));
    downloadCsv("estoque.csv", rows);
    toast.success("Relatório de estoque exportado");
  };
  const exportFinance = () => {
    const rows = costsRepo.list().map(c => ({
      Descrição: c.description, Tipo: c.kind, Categoria: c.category,
      Valor: c.amount, Frequência: c.frequency, Data: fmtDate(c.date),
    }));
    downloadCsv("financeiro.csv", rows);
    toast.success("Relatório financeiro exportado");
  };
  const exportKits = () => {
    const rows = kitsRepo.list().flatMap(k => k.items.map(it => {
      const c = componentsRepo.get(it.componentId);
      return { Kit: k.name, Tema: k.theme, Tipo: k.type, "Preço kit": k.price,
        Componente: c?.name ?? "?", Quantidade: it.quantity, Unidade: c?.unit ?? "" };
    }));
    downloadCsv("kits-bom.csv", rows);
    toast.success("BOM dos kits exportado");
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader title="Relatórios" subtitle="Exportações e resumo do mês para você ou seu contador" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Receita mês", v: brl(data.revenue) },
          { l: "Lucro mês", v: brl(data.profit) },
          { l: "Eventos mês", v: String(data.salesCount) },
          { l: "Alertas estoque", v: String(data.lowStock.length) },
        ].map(k => (
          <div key={k.l} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.l}</div>
            <div className="font-display text-2xl mt-1">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <ExportRow icon="📦" title="Estoque completo" desc="Todos os componentes, estoque atual e mínimo" onClick={exportStock} />
        <ExportRow icon="🎀" title="Kits e BOM" desc="Lista de kits com seus componentes" onClick={exportKits} />
        <ExportRow icon="💰" title="Vendas e agenda" desc="Todas as vendas registradas" onClick={exportSales} />
        <ExportRow icon="📊" title="Fluxo financeiro" desc="Custos pessoais e profissionais" onClick={exportFinance} />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <FileBarChart className="size-4 text-primary" />
          <h3 className="font-bold">Top kits do período</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border">
              <th className="py-2">Kit</th><th className="py-2 text-right">Vendas</th><th className="py-2 text-right">Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.topKits.map(({ kit, count, revenue }) => kit && (
              <tr key={kit.id}>
                <td className="py-3 font-semibold">{kit.name}</td>
                <td className="py-3 text-right font-mono">{count}×</td>
                <td className="py-3 text-right font-mono font-bold">{brl(revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ExportRow({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-soft transition-all flex items-center gap-4 group">
      <div className="size-12 rounded-xl bg-primary-soft grid place-items-center text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Download className="size-4 text-muted-foreground group-hover:text-primary" />
    </button>
  );
}
