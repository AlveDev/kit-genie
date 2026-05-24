import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { salesRepo, kitsRepo, type SaleStatus } from "@/services/db";
import { brl, fmtDate, fmtDateInput, parseDateInput, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sales")({ component: SalesPage });

function SalesPage() {
  const sales = useDb(() => salesRepo.list());
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Vendas & Agenda"
        subtitle="Registre vendas e o estoque é debitado automaticamente"
        action={
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark">
            <Plus className="size-4" /> Nova venda
          </button>
        }
      />

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Kit</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map(s => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-semibold">{s.customerName}<div className="text-[10px] text-muted-foreground">{s.customerPhone}</div></td>
                  <td className="px-4 py-3">{s.kitNameSnapshot}</td>
                  <td className="px-4 py-3">{fmtDate(s.eventDate)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{brl(s.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <select value={s.status} onChange={e => { salesRepo.updateStatus(s.id, e.target.value as SaleStatus); toast.success("Status atualizado"); }} className="text-xs border border-border rounded px-2 py-1 bg-card">
                      <option value="agendado">agendado</option>
                      <option value="confirmado">confirmado</option>
                      <option value="entregue">entregue</option>
                      <option value="concluido">concluído</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{s.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && <SaleDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function SaleDialog({ onClose }: { onClose: () => void }) {
  const kits = useDb(() => kitsRepo.list());
  const [form, setForm] = React.useState({
    customerName: "", customerPhone: "", kitId: kits[0]?.id ?? "",
    eventDate: fmtDateInput(Date.now() + 7 * 86400000),
    paidAmount: 0, status: "agendado" as SaleStatus, source: "manual" as const, notes: "",
  });

  const selectedKit = kits.find(k => k.id === form.kitId);
  const availability = form.kitId ? kitsRepo.availability(form.kitId) : { available: true, missing: [] };
  const totalPrice = selectedKit?.price ?? 0;

  const save = () => {
    if (!form.customerName || !form.kitId) { toast.error("Preencha cliente e kit"); return; }
    salesRepo.create({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      kitId: form.kitId,
      eventDate: parseDateInput(form.eventDate),
      totalPrice,
      paidAmount: form.paidAmount,
      status: form.status,
      source: form.source,
      notes: form.notes,
    });
    toast.success("Venda registrada · estoque atualizado");
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-3xl max-w-lg w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl mb-6">Nova venda</h2>
        <div className="space-y-3">
          <Field label="Cliente"><input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="inp" /></Field>
          <Field label="WhatsApp"><input value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="inp" placeholder="(11) 99999-9999" /></Field>
          <Field label="Kit">
            <select value={form.kitId} onChange={e => setForm({ ...form, kitId: e.target.value })} className="inp">
              {kits.map(k => <option key={k.id} value={k.id}>{k.name} — {brl(k.price)}</option>)}
            </select>
          </Field>

          {form.kitId && (
            <div className={cls("rounded-xl p-3 text-sm flex gap-2 items-start",
              availability.available ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive")}>
              {availability.available ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <AlertCircle className="size-4 mt-0.5 shrink-0" />}
              <div>
                {availability.available
                  ? <span><strong>Disponível!</strong> Todos os componentes em estoque.</span>
                  : <div>
                      <strong>Atenção:</strong> faltam componentes
                      <ul className="text-xs mt-1 space-y-0.5">
                        {availability.missing.map(m => <li key={m.componentId}>• {m.name} (precisa {m.need}, tem {m.have})</li>)}
                      </ul>
                    </div>
                }
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data do evento"><input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="inp" /></Field>
            <Field label="Valor pago"><input type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) })} className="inp" /></Field>
          </div>
          <div className="text-sm bg-primary-soft text-primary-dark rounded-xl p-3 flex justify-between"><span>Total</span><strong>{brl(totalPrice)}</strong></div>
        </div>
        <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary">Cancelar</button>
          <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark">Registrar venda</button>
        </div>
        <style>{`.inp{width:100%;padding:0.5rem 0.75rem;border-radius:0.625rem;border:1px solid var(--border);background:var(--card);font-size:0.875rem}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>{children}</div>;
}
