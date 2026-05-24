const FEATURES = [
  { tag: "🎀", color: "bg-pink-50 text-pink-600", title: "Nunca mais peça errada no kit", desc: "Cada kit tem a lista exata de componentes. Você monta sem surpresa e sem precisar voltar pro galpão." },
  { tag: "🎤", color: "bg-primary-soft text-primary", title: "Comanda por voz ou texto", desc: "Fale um comando no app — registra venda, consulta estoque, cria kit — tudo sem digitar nada." },
  { tag: "💬", color: "bg-emerald-50 text-emerald-600", title: "Orçamento respondido enquanto você dorme", desc: "O bot consulta o estoque em tempo real e responde o cliente pelo WhatsApp. Você só aparece pra fechar." },
  { tag: "💰", color: "bg-amber-50 text-amber-700", title: "Sabe o que sobra de verdade", desc: "Separa custos do negócio dos custos pessoais. Você vê o lucro real — não o que acha que ganhou." },
  { tag: "📧", color: "bg-rose-50 text-rose-600", title: "Resumo da semana toda segunda", desc: "E-mail automático com vendas realizadas, estoque baixo e eventos da próxima semana. Sem abrir o app." },
  { tag: "📅", color: "bg-violet-50 text-violet-600", title: "Fim de semana sem crise", desc: "Agenda visual com todos os eventos — bloqueia datas duplicadas antes de você confirmar uma segunda cliente." },
  { tag: "📄", color: "bg-sky-50 text-sky-600", title: "Contador feliz com 1 clique", desc: "Exporta vendas, custos e fluxo de caixa em CSV ou PDF. Chega de montar relatório na mão." },
  { tag: "🔔", color: "bg-orange-50 text-orange-600", title: "Aviso antes do problema virar crise", desc: "Alerta de estoque baixo, peças que vão faltar e eventos do dia seguinte. Você sabe antes de precisar." },
];

export function LandingFeatures() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Tudo em um só lugar</span>
        <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4">Um sistema, oito dores resolvidas</h2>
        <p className="text-muted-foreground">Cada funcionalidade foi criada a partir de uma dor real de quem decora festas — não para impressionar contador.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map(f => (
          <div key={f.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all">
            <div className={`size-12 ${f.color} rounded-xl mb-4 grid place-items-center font-bold text-lg`}>{f.tag}</div>
            <h4 className="font-bold mb-2 text-sm leading-snug">{f.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
