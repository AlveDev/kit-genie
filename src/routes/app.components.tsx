import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Minus } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { componentsRepo, analytics, type Component, type Unit } from "@/services/db";
import { brl, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/components")({ component: ComponentsPage });

function ComponentsPage() {
  const items = useDb(() => componentsRepo.list());
  const [editing, setEditing] = React.useState<Component | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const filtered = items.filter(i =>
    !filter || i.name.toLowerCase().includes(filter.toLowerCase()) || i.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Componentes"
        subtitle="Cada peça do seu estoque — usadas pelos kits"
        action={
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark">
            <Plus className="size-4" /> Novo componente
          </button>
        }
      />

      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..." className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border bg-card text-sm" />

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="px-4 py-3">Componente</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3 text-right">Mínimo</th>
                <th className="px-4 py-3 text-right">Custo un.</th>
                <th className="px-4 py-3">Usado em</th>
                <th className="px-4 py-3 text-right">Ajustar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => {
                const usage = analytics.componentUsage(c.id);
                const low = c.stock <= c.minStock;
                return (
                  <tr key={c.id} className="hover:bg-surface cursor-pointer" onClick={() => setEditing(c)}>
                    <td className="px-4 py-3 font-semibold">
                      {c.name}
                      {!c.reusable && <span className="ml-2 text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Consumível</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                    <td className={cls("px-4 py-3 text-right font-mono font-bold", low && "text-destructive")}>{c.stock} {c.unit}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{c.minStock}</td>
                    <td className="px-4 py-3 text-right">{brl(c.unitCost)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{usage.kits.length} kit{usage.kits.length !== 1 && "s"}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => componentsRepo.adjustStock(c.id, -1)} className="p-1 hover:bg-secondary rounded"><Minus className="size-3" /></button>
                      <button onClick={() => componentsRepo.adjustStock(c.id, 1)} className="p-1 hover:bg-secondary rounded ml-1"><Plus className="size-3" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {(creating || editing) && <CompDialog comp={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
    </div>
  );
}

function CompDialog({ comp, onClose }: { comp: Component | null; onClose: () => void }) {
  const [form, setForm] = React.useState({
    name: comp?.name ?? "", category: comp?.category ?? "",
    unit: (comp?.unit ?? "un") as Unit, stock: comp?.stock ?? 0,
    minStock: comp?.minStock ?? 1, unitCost: comp?.unitCost ?? 0,
    reusable: comp?.reusable ?? true, notes: comp?.notes ?? "",
  });

  const save = () => {
    if (!form.name) { toast.error("Nome obrigatório"); return; }
    if (comp) componentsRepo.update(comp.id, form);
    else componentsRepo.create(form);
    toast.success(comp ? "Atualizado" : "Componente criado");
    onClose();
  };
  const del = () => {
    if (comp && confirm("Excluir? Será removido também dos kits.")) {
      componentsRepo.remove(comp.id); toast.success("Excluído"); onClose();
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl mb-6">{comp ? "Editar componente" : "Novo componente"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <F label="Nome" col2><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="inp" /></F>
          <F label="Categoria"><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="inp" placeholder="ex: Balão" /></F>
          <F label="Unidade">
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as Unit })} className="inp">
              {["un", "m", "kg", "rolo", "pct", "par"].map(u => <option key={u}>{u}</option>)}
            </select>
          </F>
          <F label="Estoque atual"><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="inp" /></F>
          <F label="Estoque mínimo"><input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} className="inp" /></F>
          <F label="Custo unitário (R$)" col2><input type="number" step="0.01" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })} className="inp" /></F>
          <label className="col-span-2 flex items-center gap-2 mt-2">
            <input type="checkbox" checked={form.reusable} onChange={e => setForm({ ...form, reusable: e.target.checked })} />
            <span className="text-sm">Reutilizável (locação) — não debita do estoque ao vender</span>
          </label>
        </div>
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {comp ? <button onClick={del} className="text-destructive text-sm font-semibold hover:underline">Excluir</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary">Cancelar</button>
            <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark">Salvar</button>
          </div>
        </div>
        <style>{`.inp{width:100%;padding:0.5rem 0.75rem;border-radius:0.625rem;border:1px solid var(--border);background:var(--card);font-size:0.875rem}`}</style>
      </div>
    </div>
  );
}

function F({ label, children, col2 }: { label: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={col2 ? "col-span-2" : ""}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>
      {children}
    </div>
  );
}
