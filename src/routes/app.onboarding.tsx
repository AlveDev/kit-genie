import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { profileRepo } from "@/services/db";
import { cls } from "@/lib/format";
import { useAuth } from "@/services/auth/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/app/onboarding")({
  component: Onboarding,
});

const THEMES = ["Mickey", "Minnie", "Batman", "Princesas", "Safari", "Jardim", "Astronauta", "Dinossauros", "Frozen", "Unicórnio", "Bailarina", "Carrinhos", "Personalizado"];
const WORK_TYPES = [
  { v: "decoracao", label: "Decoração montada", desc: "Você monta no local do evento" },
  { v: "pegue_monte", label: "Pegue e monte", desc: "Cliente retira o kit pronto" },
  { v: "locacao", label: "Locação de itens", desc: "Aluga peças e brinquedos" },
] as const;

function Onboarding() {
  const nav = useNavigate();
  const { user, signUp } = useAuth();
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [password, setPassword] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState(user?.name ?? "");
  const [phone, setPhone] = React.useState("");
  const [themes, setThemes] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<Array<"decoracao" | "pegue_monte" | "locacao">>([]);

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const steps = ["Conta", "Negócio", "Temas", "Como você trabalha", "Pronto!"];

  const finish = () => {
    profileRepo.upsert({
      businessName: businessName || "Meu Ateliê",
      ownerName: ownerName || user?.name || "Decoradora",
      phone, email: user?.email,
      themes, workTypes,
      onboardingCompleted: true,
    });
    toast.success("Tudo pronto! Bem-vinda ao Pink Love 💕");
    nav({ to: "/app" });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex items-center justify-center p-6 bg-soft-grain">
      <div className="w-full max-w-2xl">
        {/* progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={cls("h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Passo {step + 1} de {steps.length}</span>
          </div>

          {step === 0 && (
            <Step title="Vamos criar sua conta" subtitle="É rapidinho — só precisamos do básico.">
              <Field label="Seu nome">
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="input" placeholder="Como você se chama?" />
              </Field>
              <Field label="E-mail">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="seu@email.com" />
              </Field>
              <Field label="Senha">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="mínimo 6 caracteres" />
              </Field>
              <Actions>
                <button
                  disabled={!email || !password || !ownerName}
                  onClick={async () => { await signUp(email, password, ownerName); setStep(1); }}
                  className="btn-primary"
                >Continuar</button>
              </Actions>
            </Step>
          )}

          {step === 1 && (
            <Step title={`Olá, ${ownerName || "querida"} 💕`} subtitle="Conta um pouco sobre o seu ateliê.">
              <Field label="Nome do seu negócio">
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input" placeholder="ex: Festa & Cia Decorações" />
              </Field>
              <Field label="WhatsApp (opcional)">
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="(11) 99999-9999" />
              </Field>
              <Actions onBack={() => setStep(0)}>
                <button disabled={!businessName} onClick={() => setStep(2)} className="btn-primary">Continuar</button>
              </Actions>
            </Step>
          )}

          {step === 2 && (
            <Step title="Com quais temas você trabalha?" subtitle="Selecione todos que se aplicam — pode adicionar mais depois.">
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-1">
                {THEMES.map(t => (
                  <button key={t} type="button" onClick={() => setThemes(prev => toggle(prev, t))}
                    className={cls("px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                      themes.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50")}>
                    {t}
                  </button>
                ))}
              </div>
              <Actions onBack={() => setStep(1)}>
                <button onClick={() => setStep(3)} className="btn-primary">Continuar</button>
              </Actions>
            </Step>
          )}

          {step === 3 && (
            <Step title="Como você trabalha?" subtitle="Marque tudo que faz parte do seu serviço.">
              <div className="space-y-3">
                {WORK_TYPES.map(wt => {
                  const active = workTypes.includes(wt.v);
                  return (
                    <button key={wt.v} type="button" onClick={() => setWorkTypes(prev => toggle(prev, wt.v))}
                      className={cls("w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3",
                        active ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40")}>
                      <div className={cls("size-5 rounded-md grid place-items-center shrink-0 mt-0.5",
                        active ? "bg-primary text-primary-foreground" : "border border-border")}>
                        {active && <Check className="size-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold">{wt.label}</div>
                        <div className="text-xs text-muted-foreground">{wt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Actions onBack={() => setStep(2)}>
                <button disabled={workTypes.length === 0} onClick={() => setStep(4)} className="btn-primary">Continuar</button>
              </Actions>
            </Step>
          )}

          {step === 4 && (
            <Step title="Tudo pronto! 🎉" subtitle="Seu sistema já vem com alguns kits de exemplo para você explorar antes de cadastrar os seus.">
              <ul className="space-y-2 text-sm">
                {[
                  "4 kits de exemplo cadastrados (Mickey, Batman, Jardim, Locação)",
                  "10 componentes pré-cadastrados com estoque inicial",
                  "Vendas de exemplo para ver o dashboard em ação",
                  "Você pode resetar tudo nas Configurações quando quiser",
                ].map(t => (
                  <li key={t} className="flex gap-2"><Check className="size-4 text-emerald-500 shrink-0 mt-0.5" /> {t}</li>
                ))}
              </ul>
              <Actions onBack={() => setStep(3)}>
                <button onClick={finish} className="btn-primary">Entrar no sistema →</button>
              </Actions>
            </Step>
          )}
        </div>
      </div>

      <style>{`
        .input { width: 100%; padding: 0.625rem 0.875rem; border-radius: 0.75rem; border: 1px solid var(--border); background: var(--card); font-size: 0.875rem; transition: border-color 0.15s; }
        .input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent); }
        .btn-primary { padding: 0.625rem 1.25rem; border-radius: 0.75rem; background: var(--primary); color: var(--primary-foreground); font-weight: 600; font-size: 0.875rem; transition: background 0.15s; }
        .btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { padding: 0.625rem 1rem; border-radius: 0.75rem; color: var(--muted-foreground); font-weight: 600; font-size: 0.875rem; }
        .btn-ghost:hover { background: var(--secondary); }
      `}</style>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Actions({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="flex justify-between items-center pt-4">
      {onBack ? <button onClick={onBack} className="btn-ghost">← Voltar</button> : <span />}
      {children}
    </div>
  );
}
