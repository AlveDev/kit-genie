const STEPS = [
  {
    num: "01",
    title: "Cadastra seus kits uma vez",
    desc: "Cada kit tem suas peças. Kit Mickey tem 14 componentes — você cadastra uma vez, o sistema sabe para sempre. Sem digitar de novo a cada venda.",
    icon: "📦",
  },
  {
    num: "02",
    title: "Confirma uma venda — estoque já atualizado",
    desc: "Vendeu o Kit Batman pro dia 15/10? As peças já estão reservadas. O sistema avisa se alguma for faltar — antes do evento, não depois.",
    icon: "✅",
  },
  {
    num: "03",
    title: "Fim do mês, relatório no e-mail",
    desc: "Quantos eventos, quanto entrou, quanto gastou, quanto sobrou. Tudo calculado automaticamente toda segunda-feira de manhã.",
    icon: "📊",
  },
];

export function LandingHow() {
  return (
    <section id="como-funciona" className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Simples assim</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-balance">
            Em 3 passos, seu negócio organizado
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%_-_1rem)] w-8 h-px bg-border z-10" />
              )}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-soft h-full">
                <div className="flex items-start gap-4 mb-5">
                  <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center text-2xl shrink-0">{s.icon}</div>
                  <span className="font-display text-4xl text-primary/20 font-bold leading-none pt-1">{s.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-3 leading-snug">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
