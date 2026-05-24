export function LandingBom() {
  return (
    <section id="bom" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">A inteligência</span>
        <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6 text-balance">
          O segredo está no <span className="italic text-primary">Kit Explosivo</span>
        </h2>
        <p className="text-muted-foreground text-pretty">
          Diferente de planilhas, nosso sistema entende que uma venda de "Kit Mickey" debita
          automaticamente o cilindro, o painel e os balões do seu estoque. E te avisa quando algo está acabando.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-soft">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Gestão de Kits (BOM)</h3>
              <p className="text-sm text-muted-foreground">Peças vinculadas automaticamente</p>
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
                <p className="text-xs text-muted-foreground italic">Contém 14 componentes</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Disponível</span>
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-[10px] font-bold uppercase italic">12 aluguéis</span>
              </div>
            </div>

            <div className="ml-8 border-l-2 border-primary/20 pl-6 space-y-3">
              {[
                { n: "Mesa Cavalete (Branca)", u: "01 un.", e: "Est: 04", crit: false },
                { n: "Painel Redondo Estrutural", u: "01 un.", e: "Est: 02", crit: false },
                { n: "Boleira Cerâmica (Rosa M)", u: "02 un.", e: "Crítico: 01", crit: true },
              ].map(r => (
                <div key={r.n} className={`flex justify-between items-center text-sm ${r.crit ? "text-destructive" : "text-foreground/80"}`}>
                  <span>{r.n}</span>
                  <span className={`font-mono font-bold ${r.crit ? "underline" : ""}`}>{r.u} <span className="text-muted-foreground">|</span> {r.e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-primary-dark rounded-3xl p-8 text-primary-foreground">
            <h3 className="text-base font-medium opacity-80 mb-2">Faturamento Mensal</h3>
            <div className="text-4xl font-display italic mb-6">R$ 14.850,00</div>
            <div className="flex gap-6">
              <div className="flex-1">
                <span className="block text-[10px] uppercase opacity-60 mb-1">Ganhos</span>
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
              <div className="size-9 bg-emerald-500 rounded-xl grid place-items-center">
                <div className="size-4 bg-card rounded-full" />
              </div>
              <span className="font-bold">Assistente SDR Digital</span>
            </div>
            <div className="space-y-3">
              <div className="bg-secondary p-3 rounded-2xl rounded-tl-none">
                <p className="text-xs italic text-foreground/70">"Oi! Gostaria do tema Batman para o dia 15/10. Vocês têm disponível?"</p>
              </div>
              <div className="bg-primary-soft p-3 rounded-2xl rounded-tr-none ml-4">
                <p className="text-xs font-medium text-primary-dark">"Olá! Verifiquei e temos 2 Kits Batman para esta data. Quer que eu envie o orçamento?"</p>
              </div>
              <div className="pt-3">
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary w-3/4 h-full" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 block">Upgrade R$ 9,90/mês: automação ativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
