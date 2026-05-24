import { Link } from "@tanstack/react-router";

// Substitua pelas URLs reais ao criar os produtos na Hotmart
const HOTMART_BASE = import.meta.env.VITE_HOTMART_URL_BASE ?? "https://hotmart.com/produto/pink-love-gestao-base";
const HOTMART_PREMIUM = import.meta.env.VITE_HOTMART_URL_PREMIUM ?? "https://hotmart.com/produto/pink-love-gestao-premium";

const INCLUSO = [
  "Acesso vitalício ao sistema (sem mensalidade)",
  "Controle ilimitado de kits e componentes",
  "Dashboard financeiro + fluxo de caixa",
  "Relatórios semanais por e-mail",
  "Modo offline (galpão sem internet)",
  "Exportação CSV / PDF para contador",
  "Suporte VIP na comunidade Pink Love",
  "Todas as atualizações futuras inclusas",
];

const UPGRADE_INCLUSO = [
  "Resposta automática de orçamentos",
  "Bloqueio de estoque em tempo real",
  "Atendimento 24h no WhatsApp",
];

export function LandingOffer() {
  return (
    <section id="oferta" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Oferta de fundação</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-5 text-balance">
            Organização impecável por um <span className="italic text-primary">valor único</span>.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Esqueça mensalidades infinitas. Entre na primeira turma da comunidade Pink Love
            e tenha o sistema completo — pra sempre.
          </p>
        </div>

        <div className="mb-10 rounded-[2rem] bg-gradient-to-br from-primary-soft via-card to-card border border-primary/15 p-8 shadow-glow">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">O que está incluso no plano base</p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {INCLUSO.map(t => (
              <li key={t} className="flex gap-3 items-start text-sm">
                <span className="mt-0.5 size-5 rounded-full bg-emerald-100 grid place-items-center shrink-0">
                  <span className="size-2 rounded-full bg-emerald-600" />
                </span>
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Base */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-soft text-center flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pagamento único</p>
            <div className="mb-1">
              <span className="text-sm text-muted-foreground line-through font-medium">De R$ 97,00</span>
            </div>
            <div className="font-display text-6xl text-primary mb-1 leading-none">
              <span className="text-2xl align-top mr-1">R$</span>47
            </div>
            <p className="text-xs text-muted-foreground mb-6 font-medium">acesso vitalício · pagamento único</p>
            <div className="mt-auto space-y-3">
              <a
                href={HOTMART_BASE}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-2xl bg-primary text-primary-foreground py-4 font-bold text-base hover:bg-primary-dark transition-colors"
              >
                Comprar agora na Hotmart
              </a>
              <Link to="/app" className="block text-xs text-primary font-semibold hover:underline">
                ou explore o sistema antes →
              </Link>
              <p className="text-[10px] text-muted-foreground tracking-wide">
                Pagamento seguro Hotmart · 7 dias de garantia incondicional
              </p>
            </div>
          </div>

          {/* Card Upgrade */}
          <div className="bg-card rounded-3xl p-8 border border-emerald-200 shadow-soft text-center flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Upgrade opcional</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">+ Automação WhatsApp</p>
            <div className="font-display text-6xl text-emerald-600 mb-1 leading-none">
              <span className="text-2xl align-top mr-1">R$</span>9<span className="text-3xl">,90</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 font-medium">por mês · cancele quando quiser</p>
            <ul className="space-y-2 mb-6 text-left">
              {UPGRADE_INCLUSO.map(t => (
                <li key={t} className="flex gap-3 items-start text-sm">
                  <span className="mt-0.5 size-5 rounded-full bg-emerald-100 grid place-items-center shrink-0">
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-foreground/85">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-3">
              <a
                href={HOTMART_PREMIUM}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-2xl bg-emerald-600 text-white py-4 font-bold text-base hover:bg-emerald-700 transition-colors"
              >
                Adicionar automação
              </a>
              <p className="text-[10px] text-muted-foreground tracking-wide">
                Disponível após ativar o plano base
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
