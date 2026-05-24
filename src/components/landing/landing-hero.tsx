import { Link } from "@tanstack/react-router";

export function LandingHero() {
  return (
    <header className="relative overflow-hidden bg-card border-b border-pink-100/60 bg-soft-grain">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary-soft border border-primary/15 px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Lançamento vitalício</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-balance">
            Seu estoque <span className="text-primary italic">inteligente</span>,<br className="hidden md:inline" /> seu tempo de volta.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
            Substitua planilhas complexas por um parceiro digital que entende seus kits,
            reserva peças automaticamente e responde clientes no WhatsApp como uma assistente dedicada.
            Pensado para decoradoras, pegue-e-monte e locação de brinquedos.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="#oferta"
              className="bg-foreground text-background px-7 py-4 rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-soft"
            >
              Quero garantir minha vaga
            </a>
            <Link
              to="/app"
              className="px-5 py-4 rounded-2xl font-semibold text-base text-primary-dark hover:bg-primary-soft transition-colors"
            >
              Testar o sistema →
            </Link>
            <div className="flex flex-col justify-center pl-3 border-l border-border">
              <span className="text-sm font-bold">+30 mil decoradoras</span>
              <span className="text-xs text-muted-foreground">confiam na metodologia Pink Love</span>
            </div>
          </div>
        </div>

        {/* Dashboard mockup — fiel ao protótipo, sem precisar de imagem */}
        <div className="relative">
          <div className="absolute -inset-8 bg-primary/15 blur-3xl rounded-full -z-10" />
          <div className="relative rounded-3xl bg-card border border-pink-100 shadow-glow overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-surface">
              <span className="size-2.5 rounded-full bg-rose-300" />
              <span className="size-2.5 rounded-full bg-amber-300" />
              <span className="size-2.5 rounded-full bg-emerald-300" />
              <span className="ml-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Painel · Pink Love</span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-2xl bg-primary-dark text-primary-foreground p-5">
                <div className="text-xs uppercase tracking-widest opacity-70 mb-1">Faturamento do mês</div>
                <div className="font-display text-3xl italic">R$ 14.850,00</div>
                <div className="mt-3 flex gap-6 text-[11px]">
                  <span className="text-emerald-300 font-semibold">↑ 22% vs mês anterior</span>
                  <span className="opacity-70">12 eventos</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Kits ativos</div>
                <div className="font-display text-2xl mt-1">28</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-2">fim de semana cheio</div>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="text-[10px] font-bold uppercase text-destructive tracking-wider">Estoque crítico</div>
                <div className="font-display text-2xl mt-1">3 itens</div>
                <div className="text-[11px] text-muted-foreground mt-2">balão rosa em 4 kits</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-border p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold">Próximas montagens</span>
                  <span className="text-[10px] text-primary font-semibold">ver agenda</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { t: "Jardim Encantado", d: "Sáb · 14:00", s: "Separar peças", c: "bg-amber-100 text-amber-700" },
                    { t: "Pegue e Monte Batman", d: "Dom · 10:00", s: "Pronto", c: "bg-emerald-100 text-emerald-700" },
                  ].map(r => (
                    <div key={r.t} className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary-soft" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{r.t}</div>
                        <div className="text-[10px] text-muted-foreground">{r.d}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${r.c}`}>{r.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
