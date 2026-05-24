const TESTIMONIALS = [
  {
    initial: "M",
    name: "Mariana S.",
    location: "São Paulo, SP",
    type: "Pegue e Monte",
    quote: "Confirmei dois clientes numa semana e quase perdi os dois. Agora o sistema me avisa antes de eu confirmar. Nunca mais.",
    stars: 5,
  },
  {
    initial: "F",
    name: "Fernanda C.",
    location: "Belo Horizonte, MG",
    type: "Locação de itens",
    quote: "Eu achava que estava ganhando bem. Quando vi os custos separados percebi que precisava ajustar meus preços. Hoje sei exatamente o que sobra.",
    stars: 5,
  },
  {
    initial: "P",
    name: "Patrícia M.",
    location: "Curitiba, PR",
    type: "Decoração montada",
    quote: "Minha maior insegurança era chegar no evento e ter esquecido alguma peça. O sistema me dá a lista completa do kit. Nunca mais fui incompleta.",
    stars: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Quem já usa</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3">
            Decoradoras que trocaram a planilha
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-card rounded-3xl p-8 border border-border shadow-soft flex flex-col">
              {/* Stars */}
              <div className="flex gap-0.5 text-amber-400 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-foreground/80 leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary-soft grid place-items-center font-bold text-primary text-sm shrink-0">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.location} · {t.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
