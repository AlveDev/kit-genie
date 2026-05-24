import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { kitsRepo, componentsRepo, type Kit, type KitItem } from "@/services/db";
import { brl, cls } from "@/lib/format";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/kits")({ component: KitsPage });

function KitsPage() {
  const kits = useDb(() => kitsRepo.list());
  const components = useDb(() => componentsRepo.list());
  const [editing, setEditing] = React.useState<Kit | null>(null);
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Kits & BOM"
        subtitle="Monte seus kits e o sistema cuida dos componentes automaticamente"
        action={
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark">
            <Plus className="size-4" /> Novo kit
          </button>
        }
      />

      {kits.length === 0 ? (
        <Card><p className="text-center text-muted-foreground py-12">Nenhum kit cadastrado ainda.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kits.map(k => {
            const av = kitsRepo.availability(k.id);
            return (
              <button key={k.id} onClick={() => setEditing(k)} className="text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-soft transition-all">
                <div className="size-14 rounded-xl mb-4" style={{ background: k.imageColor ?? "var(--primary-soft)" }} />
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{k.name}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-secondary rounded">{k.type.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{k.description}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-display text-xl text-primary">{brl(k.price)}</div>
                    <div className="text-[10px] text-muted-foreground">{k.items.length} componentes</div>
                  </div>
                  {av.available ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="size-3" /> Disponível</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-destructive"><AlertCircle className="size-3" /> Faltam peças</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <KitDialog
          kit={editing}
          components={components}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function KitDialog({ kit, components, onClose }: { kit: Kit | null; components: ReturnType<typeof componentsRepo.list>; onClose: () => void }) {
  const [name, setName] = React.useState(kit?.name ?? "");
  const [theme, setTheme] = React.useState(kit?.theme ?? "");
  const [type, setType] = React.useState<Kit["type"]>(kit?.type ?? "decoracao");
  const [description, setDescription] = React.useState(kit?.description ?? "");
  const [price, setPrice] = React.useState(kit?.price ?? 0);
  const [items, setItems] = React.useState<KitItem[]>(kit?.items ?? []);

  const addItem = (cid: string) => {
    if (items.find(i => i.componentId === cid)) return;
    setItems([...items, { componentId: cid, quantity: 1 }]);
  };
  const update = (cid: string, qty: number) => setItems(items.map(i => i.componentId === cid ? { ...i, quantity: qty } : i));
  const remove = (cid: string) => setItems(items.filter(i => i.componentId !== cid));

  const save = () => {
    if (!name) { toast.error("Dê um nome ao kit"); return; }
    const payload = { name, theme, type, description, price, items, active: true, imageColor: kit?.imageColor };
    if (kit) { kitsRepo.update(kit.id, payload); toast.success("Kit atualizado"); }
    else { kitsRepo.create(payload); toast.success("Kit criado"); }
    onClose();
  };

  const del = () => {
    if (kit && confirm("Excluir este kit?")) { kitsRepo.remove(kit.id); toast.success("Kit excluído"); onClose(); }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4 overflow-y-auto">
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-3xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl mb-6">{kit ? "Editar kit" : "Novo kit"}</h2>
        <div className="space-y-4">
          <Input label="Nome" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tema" value={theme} onChange={setTheme} />
            <div>
              <Label>Tipo</Label>
              <select value={type} onChange={e => setType(e.target.value as Kit["type"])} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
                <option value="decoracao">Decoração montada</option>
                <option value="pegue_monte">Pegue e monte</option>
                <option value="locacao">Locação</option>
              </select>
            </div>
          </div>
          <Input label="Preço (R$)" type="number" value={String(price)} onChange={v => setPrice(Number(v))} />
          <div>
            <Label>Descrição</Label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
          </div>

          <div>
            <Label>Componentes do BOM</Label>
            <div className="space-y-2 mb-3">
              {items.map(it => {
                const c = components.find(x => x.id === it.componentId);
                if (!c) return null;
                return (
                  <div key={it.componentId} className="flex items-center gap-2 bg-surface rounded-lg p-2">
                    <span className="flex-1 text-sm">{c.name}</span>
                    <input type="number" min={1} value={it.quantity} onChange={e => update(it.componentId, Number(e.target.value))} className="w-16 px-2 py-1 rounded border border-border text-sm text-right" />
                    <span className="text-xs text-muted-foreground w-8">{c.unit}</span>
                    <button onClick={() => remove(it.componentId)} className="text-destructive p-1"><Trash2 className="size-4" /></button>
                  </div>
                );
              })}
            </div>
            <select onChange={e => { if (e.target.value) { addItem(e.target.value); e.target.value = ""; } }} className="w-full px-3 py-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
              <option value="">+ adicionar componente...</option>
              {components.filter(c => !items.find(i => i.componentId === c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.stock} {c.unit} em estoque)</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {kit ? <button onClick={del} className="text-destructive text-sm font-semibold hover:underline">Excluir</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary">Cancelar</button>
            <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</span>;
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
    </div>
  );
}
