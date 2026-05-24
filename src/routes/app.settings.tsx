import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDb } from "@/hooks/use-db";
import { profileRepo, settingsRepo, dbReset } from "@/services/db";
import { PageHeader, Card } from "@/components/app/app-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const profile = useDb(() => profileRepo.get());
  const settings = useDb(() => settingsRepo.get());

  const [businessName, setBusinessName] = React.useState(profile?.businessName ?? "");
  const [ownerName, setOwnerName] = React.useState(profile?.ownerName ?? "");
  const [phone, setPhone] = React.useState(profile?.phone ?? "");
  const [email, setEmail] = React.useState(profile?.email ?? "");

  React.useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName); setOwnerName(profile.ownerName);
      setPhone(profile.phone ?? ""); setEmail(profile.email ?? "");
    }
  }, [profile]);

  const saveProfile = () => {
    if (!profile) return;
    profileRepo.upsert({ ...profile, businessName, ownerName, phone, email });
    toast.success("Perfil atualizado");
  };

  const reset = () => {
    if (confirm("Tem certeza? Isso apaga TODOS os seus dados e restaura o exemplo inicial.")) {
      dbReset(); toast.success("Dados resetados"); window.location.reload();
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <PageHeader title="Configurações" subtitle="Ajuste seu perfil, notificações e preferências" />

      <Card>
        <h3 className="font-bold mb-5">Perfil do negócio</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Nome do negócio"><input value={businessName} onChange={e => setBusinessName(e.target.value)} className="inp" /></F>
          <F label="Seu nome"><input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="inp" /></F>
          <F label="WhatsApp"><input value={phone} onChange={e => setPhone(e.target.value)} className="inp" /></F>
          <F label="E-mail"><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="inp" /></F>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={saveProfile} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark">Salvar perfil</button>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-5">Notificações</h3>
        <div className="space-y-3">
          <Toggle
            label="Alertar quando estoque ficar baixo"
            desc="Notificação no painel quando peças atingirem o mínimo"
            checked={settings.notifyLowStock}
            onChange={v => settingsRepo.update({ notifyLowStock: v })}
          />
          <Toggle
            label="Resumo semanal por e-mail"
            desc="Toda segunda você recebe vendas, estoque e projeção da semana"
            checked={settings.notifyWeeklyReport}
            onChange={v => settingsRepo.update({ notifyWeeklyReport: v })}
          />
          <F label="E-mail para o resumo semanal">
            <input value={settings.weeklyReportEmail ?? ""} onChange={e => settingsRepo.update({ weeklyReportEmail: e.target.value })} className="inp" placeholder="seu@email.com" />
          </F>
          <F label="Multiplicador do alerta de estoque mínimo">
            <input type="number" step="0.1" min={1} value={settings.lowStockMultiplier} onChange={e => settingsRepo.update({ lowStockMultiplier: Number(e.target.value) })} className="inp" />
            <span className="text-[11px] text-muted-foreground mt-1 block">Ex: 1.5 alerta antes de chegar no mínimo</span>
          </F>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-3">Sobre o app</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pink Love Gestão · versão 1.0 · seus dados ficam no seu navegador (modo offline).
          A migração para nuvem (Firebase) está prevista nas próximas atualizações.
        </p>
        <button onClick={reset} className="text-sm text-destructive font-semibold hover:underline">
          Resetar todos os dados (cuidado!)
        </button>
      </Card>

      <style>{`.inp{width:100%;padding:0.5rem 0.75rem;border-radius:0.625rem;border:1px solid var(--border);background:var(--card);font-size:0.875rem}`}</style>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>{children}</div>;
}
function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </label>
  );
}
