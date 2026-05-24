import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { costsRepo, analytics, type CostKind, type CostFrequency } from "@/services/db";
import { brl, fmtDate, fmtDateInput, parseDateInput, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/finance")({ component: FinancePage });

function FinancePage() {
  const costs = useDb(() => costsRepo.list());
  const data = useDb(() => ({
    revenue: analytics.monthRevenue(),
    profCosts: analytics.monthCosts(),
    persCosts: analytics.monthPersonalCosts(),
    profit: analytics.monthProfit(),
  }));
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Finanças"
        subtitle="Custos pessoais + profissionais e seu lucro real"
        action={
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark">
            <Plus className="size-4" /> Novo custo
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Receita do mês" value={brl(data.revenue)} tone="good" />
        <Kpi label="Custos profissionais" value={brl(data.profCosts)} />
        <Kpi label="Custos pessoais" value={brl(data.persCosts)} tone="muted" />
        <Kpi label="Lucro líquido" value={brl(data.profit)} tone={data.profit >= 0 ? "good" : "bad"} />
      </div>

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
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {costs.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.description}</td>
                  <td className="px-4 py-3"><span className={cls("text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                    c.kind === "profissional" ? "bg-primary-soft text-primary-dark" : "bg-secondary text-secondary-foreground")}>{c.kind}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{c.frequency}</td>
                  <td className="px-4 py-3">{fmtDate(c.date)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-destructive">- {brl(c.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm("Excluir?")) { costsRepo.remove(c.id); toast.success("Excluído"); } }} className="p-1 hover:bg-secondary rounded"><Trash2 className="size-3.5 text-muted-foreground" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && <CostDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function CostDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = React.useState({
    description: "", kind: "profissional" as CostKind, category: "",
    amount: 0, frequency: "unico" as CostFrequency,
    date: fmtDateInput(Date.now()),
  });
  const save = () => {
    if (!form.description) { toast.error("Descreva o custo"); return; }
    costsRepo.create({ ...form, date: parseDateInput(form.date) });
    toast.success("Custo lançado"); onClose();
  };
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-3xl max-w-md w-full p-8">
        <h2 className="font-display text-2xl mb-6">Novo custo</h2>
        <div className="space-y-3">
          <F label="Descrição"><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="inp" /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Tipo">
              <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as CostKind })} className="inp">
                <option value="profissional">Profissional</option>
                <option value="pessoal">Pessoal</option>
              </select>
            </F>
            <F label="Categoria"><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="inp" placeholder="ex: Aluguel" /></F>
            <F label="Valor (R$)"><input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="inp" /></F>
            <F label="Frequência">
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as CostFrequency })} className="inp">
                <option value="unico">Único</option><option value="mensal">Mensal</option><option value="anual">Anual</option>
              </select>
            </F>
            <F label="Data" col2><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="inp" /></F>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary">Cancelar</button>
          <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark">Salvar</button>
        </div>
        <style>{`.inp{width:100%;padding:0.5rem 0.75rem;border-radius:0.625rem;border:1px solid var(--border);background:var(--card);font-size:0.875rem}`}</style>
      </div>
    </div>
  );
}
function F({ label, children, col2 }: { label: string; children: React.ReactNode; col2?: boolean }) {
  return <div className={col2 ? "col-span-2" : ""}><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>{children}</div>;
}
function Kpi({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "muted" }) {
  return (
    <div className={cls("rounded-2xl p-5 border bg-card",
      tone === "good" && "border-emerald-200 bg-emerald-50/50",
      tone === "bad" && "border-destructive/20 bg-destructive/5",
      !tone && "border-border")}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl md:text-3xl mt-1">{value}</div>
    </div>
  );
}
