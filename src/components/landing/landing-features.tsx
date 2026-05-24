const FEATURES = [
  { tag: "OFF", color: "bg-indigo-50 text-indigo-600", title: "Modo Offline", desc: "Cadastre kits, componentes e vendas mesmo sem internet no galpão. Sincroniza depois." },
  { tag: "BOM", color: "bg-pink-50 text-pink-600", title: "Kits Inteligentes", desc: "Cadastre cada peça uma vez e use em 50 kits diferentes. Baixa automática no estoque." },
  { tag: "SDR", color: "bg-emerald-50 text-emerald-600", title: "Orçamento Automático", desc: "Consulta o estoque em tempo real e responde o cliente na hora pelo WhatsApp." },
  { tag: "$$", color: "bg-amber-50 text-amber-700", title: "Custos Inteligentes", desc: "Separação clara entre custos pessoais e da empresa para enxergar o lucro real." },
  { tag: "📊", color: "bg-rose-50 text-rose-600", title: "Relatórios Semanais", desc: "Receba por e-mail o resumo de vendas, estoque baixo e projeção do próximo fim de semana." },
  { tag: "📅", color: "bg-violet-50 text-violet-600", title: "Agenda de Eventos", desc: "Bloqueio automático de peças nas datas reservadas — sem mais overbooking." },
  { tag: "↧", color: "bg-sky-50 text-sky-600", title: "Exportação CSV/PDF", desc: "Exporte vendas, estoque e fluxo de caixa para o contador ou para suas próprias planilhas." },
  { tag: "🔔", color: "bg-orange-50 text-orange-600", title: "Alertas Críticos", desc: "Notificações de baixo estoque, contas a pagar e eventos do dia seguinte." },
];

export function LandingFeatures() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Tudo em um só lugar</span>
        <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4">Um sistema, oito superpoderes</h2>
        <p className="text-muted-foreground">Cada funcionalidade foi pensada para o dia a dia real de quem decora festas — não para encantar contador.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map(f => (
          <div key={f.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all">
            <div className={`size-12 ${f.color} rounded-xl mb-4 grid place-items-center font-bold italic text-sm`}>{f.tag}</div>
            <h4 className="font-bold mb-2">{f.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
