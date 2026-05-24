export function LandingBom() {
  return (
    <section id="bom" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Estoque inteligente</span>
        <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6 text-balance">
          Uma peça, mil kits — <span className="italic text-primary">o estoque que se organiza sozinho</span>
        </h2>
        <p className="text-muted-foreground text-pretty">
          Você cadastra a "Mesa Cavalete Branca" uma vez. Ela aparece no Kit Mickey, no Kit Jardim e no Kit Locação.
          Quando uma venda sai, todas as peças daquele kit baixam do estoque automaticamente — sem planilha,
          sem anotação, sem esquecimento.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-soft">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Kits com lista de peças</h3>
              <p className="text-sm text-muted-foreground">Baixa automática a cada venda confirmada</p>
            </div>
            <button className="text-primary font-bold text-sm">+ Novo Kit</button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface border border-border">
              <div className="size-16 rounded-xl bg-primary-soft grid place-items-center">
                <span className="text-[10px] uppercase font-bold text-primary italic">Mickey</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold">Kit Premium Mickey Mouse</h4>
                <p className="text-xs text-muted-foreground italic">14 componentes vinculados</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Disponível</span>
              </div>
            </div>

            <div className="ml-8 border-l-2 border-primary/20 pl-6 space-y-3">
              {[
                { n: "Mesa Cavalete (Branca)", u: "01 un.", e: "Est: 04", crit: false },
                { n: "Painel Redondo Estrutural", u: "01 un.", e: "Est: 02", crit: false },
                { n: "Balão Rosa Metalizado", u: "20 un.", e: "Crítico: 08", crit: true },
              ].map(r => (
                <div key={r.n} className={`flex justify-between items-center text-sm ${r.crit ? "text-destructive" : "text-foreground/80"}`}>
                  <span>{r.n}</span>
                  <span className={`font-mono font-bold ${r.crit ? "underline" : ""}`}>{r.u} <span className="text-muted-foreground">|</span> {r.e}</span>
                </div>
              ))}
            </div>

            {/* Alerta crítico */}
            <div className="mt-4 flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <span className="text-destructive text-lg">⚠️</span>
              <p className="text-xs text-destructive font-medium">
                Balão Rosa vai faltar no Kit Mickey do dia 18/10 — você tem 8, o kit precisa de 20.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-primary-dark rounded-3xl p-8 text-primary-foreground">
            <h3 className="text-base font-medium opacity-80 mb-2">Faturamento Mensal</h3>
            <div className="text-4xl font-display italic mb-6">R$ 14.850,00</div>
            <div className="flex gap-6">
              <div className="flex-1">
                <span className="block text-[10px] uppercase opacity-60 mb-1">Lucro</span>
                <span className="text-emerald-300 font-bold">+ 22%</span>
              </div>
              <div className="flex-1">
                <span className="block text-[10px] uppercase opacity-60 mb-1">Custos</span>
                <span className="text-pink-200 font-bold">R$ 2.400</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-7 border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 bg-primary rounded-xl grid place-items-center">
                <span className="text-primary-foreground text-sm">✨</span>
              </div>
              <span className="font-bold">Assistente por voz</span>
            </div>
            <div className="space-y-3">
              <div className="bg-secondary p-3 rounded-2xl rounded-tl-none">
                <p className="text-xs italic text-foreground/70">🎤 "Comprei 50 balões rosa, adiciona no estoque"</p>
              </div>
              <div className="bg-primary-soft p-3 rounded-2xl rounded-tr-none ml-4">
                <p className="text-xs font-medium text-primary-dark">✅ Balão Rosa: 8 → 58 unidades</p>
              </div>
              <div className="bg-secondary p-3 rounded-2xl rounded-tl-none">
                <p className="text-xs italic text-foreground/70">🎤 "Qual meu faturamento esse mês?"</p>
              </div>
              <div className="bg-primary-soft p-3 rounded-2xl rounded-tr-none ml-4">
                <p className="text-xs font-medium text-primary-dark">📊 12 eventos · R$ 14.850 · Incluso no app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
