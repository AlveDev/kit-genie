import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { salesRepo, kitsRepo, type Sale, type SaleStatus } from "@/services/db";
import { brl, fmtDate, fmtDateInput, parseDateInput, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sales")({ component: SalesPage });

const STATUS_COLOR: Record<SaleStatus, string> = {
  agendado: "bg-blue-100 text-blue-700",
  confirmado: "bg-emerald-100 text-emerald-700",
  entregue: "bg-violet-100 text-violet-700",
  concluido: "bg-gray-100 text-gray-600",
  cancelado: "bg-red-100 text-red-600",
};

const DOT_COLOR: Record<SaleStatus, string> = {
  agendado: "bg-blue-400",
  confirmado: "bg-emerald-500",
  entregue: "bg-violet-500",
  concluido: "bg-gray-400",
  cancelado: "bg-red-400",
};

function SalesPage() {
  const sales = useDb(() => salesRepo.list());
  const [creating, setCreating] = React.useState(false);
  const [view, setView] = React.useState<"tabela" | "calendario">("tabela");

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Vendas & Agenda"
        subtitle="Registre vendas e o estoque é debitado automaticamente"
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setView("tabela")}
                className={cls("px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  view === "tabela" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-surface")}
              >
                <List className="size-3.5" /> Tabela
              </button>
              <button
                onClick={() => setView("calendario")}
                className={cls("px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  view === "calendario" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-surface")}
              >
                <CalendarIcon className="size-3.5" /> Calendário
              </button>
            </div>
            <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark">
              <Plus className="size-4" /> Nova venda
            </button>
          </div>
        }
      />

      {view === "tabela" ? (
        <SalesTable sales={sales} />
      ) : (
        <SalesCalendar sales={sales} />
      )}

      {creating && <SaleDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function SalesTable({ sales }: { sales: Sale[] }) {
  return (
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
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold">{s.customerName}<div className="text-[10px] text-muted-foreground">{s.customerPhone}</div></td>
                <td className="px-4 py-3">{s.kitNameSnapshot}</td>
                <td className="px-4 py-3">{fmtDate(s.eventDate)}</td>
                <td className="px-4 py-3 text-right font-mono font-bold">{brl(s.totalPrice)}</td>
                <td className="px-4 py-3">
                  <select
                    value={s.status}
                    onChange={e => { salesRepo.updateStatus(s.id, e.target.value as SaleStatus); toast.success("Status atualizado"); }}
                    className="text-xs border border-border rounded px-2 py-1 bg-card"
                  >
                    <option value="agendado">agendado</option>
                    <option value="confirmado">confirmado</option>
                    <option value="entregue">entregue</option>
                    <option value="concluido">concluído</option>
                    <option value="cancelado">cancelado</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{s.source}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { if (confirm(`Excluir venda de ${s.customerName}?`)) { salesRepo.remove(s.id); toast.success("Venda excluída · estoque restaurado"); } }}
                    className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Nenhuma venda registrada ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SalesCalendar({ sales }: { sales: Sale[] }) {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const salesByDay = React.useMemo(() => {
    const map = new Map<number, Sale[]>();
    sales.forEach(s => {
      const d = new Date(s.eventDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const arr = map.get(day) ?? [];
        arr.push(s);
        map.set(day, arr);
      }
    });
    return map;
  }, [sales, year, month]);

  const selectedSales = selectedDay ? (salesByDay.get(selectedDay) ?? []) : [];

  const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      <Card>
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-surface"><ChevronLeft className="size-4" /></button>
          <h3 className="font-display text-lg">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-surface"><ChevronRight className="size-4" /></button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const daySales = salesByDay.get(day) ?? [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cls(
                  "rounded-xl p-1.5 text-center min-h-[52px] flex flex-col items-center transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-surface",
                  isToday && !isSelected ? "ring-2 ring-primary ring-inset" : "",
                )}
              >
                <span className="text-xs font-semibold mb-1">{day}</span>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {daySales.slice(0, 4).map(s => (
                    <span key={s.id} className={cls("size-1.5 rounded-full", isSelected ? "bg-white/80" : DOT_COLOR[s.status])} />
                  ))}
                  {daySales.length > 4 && <span className={cls("text-[8px] font-bold leading-none", isSelected ? "text-white/80" : "text-muted-foreground")}>+{daySales.length - 4}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
          {(Object.keys(STATUS_COLOR) as SaleStatus[]).map(s => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cls("size-2 rounded-full", DOT_COLOR[s])} />
              <span className="capitalize">{s}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Eventos do dia selecionado */}
      {selectedDay && (
        <Card>
          <h4 className="font-semibold mb-3 text-sm">
            Eventos em {selectedDay}/{(month + 1).toString().padStart(2, "0")}/{year}
            {selectedSales.length === 0 && <span className="text-muted-foreground font-normal ml-2">— nenhum evento</span>}
          </h4>
          <div className="space-y-3">
            {selectedSales.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                <div>
                  <div className="font-semibold text-sm">{s.customerName}</div>
                  <div className="text-xs text-muted-foreground">{s.kitNameSnapshot} · {brl(s.totalPrice)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cls("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", STATUS_COLOR[s.status])}>{s.status}</span>
                  <select
                    value={s.status}
                    onChange={e => { salesRepo.updateStatus(s.id, e.target.value as SaleStatus); toast.success("Status atualizado"); }}
                    className="text-xs border border-border rounded px-2 py-1 bg-card"
                  >
                    <option value="agendado">agendado</option>
                    <option value="confirmado">confirmado</option>
                    <option value="entregue">entregue</option>
                    <option value="concluido">concluído</option>
                    <option value="cancelado">cancelado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
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
  const eventDateTs = form.eventDate ? parseDateInput(form.eventDate) : undefined;
  const availability = form.kitId
    ? kitsRepo.availability(form.kitId, eventDateTs)
    : { available: true, missing: [] };
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data do evento">
              <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="inp" />
            </Field>
            <Field label="Kit">
              <select value={form.kitId} onChange={e => setForm({ ...form, kitId: e.target.value })} className="inp">
                {kits.map(k => <option key={k.id} value={k.id}>{k.name} — {brl(k.price)}</option>)}
              </select>
            </Field>
          </div>

          {form.kitId && (
            <div className={cls("rounded-xl p-3 text-sm flex gap-2 items-start",
              availability.available ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive")}>
              {availability.available ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <AlertCircle className="size-4 mt-0.5 shrink-0" />}
              <div>
                {availability.available
                  ? <span><strong>Disponível!</strong> Todos os componentes em estoque para esta data.</span>
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

          <Field label="Valor pago (R$)">
            <input type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) })} className="inp" />
          </Field>
          <div className="text-sm bg-primary-soft text-primary-dark rounded-xl p-3 flex justify-between"><span>Total do kit</span><strong>{brl(totalPrice)}</strong></div>
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
