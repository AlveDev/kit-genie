export function LandingWhatsapp() {
  return (
    <section className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Catálogo vivo</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6 text-balance">
            Seu WhatsApp vira o <span className="italic text-primary">front da operação</span>.
          </h2>
          <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
            Você (ou seu SDR digital, com upgrade R$ 9,90/mês) conversa naturalmente com a cliente.
            O sistema sabe exatamente o estoque, calcula o orçamento e bloqueia as peças
            para a data do evento — tudo em segundos. Você foca em criatividade, ele cuida da operação.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Cliente pede tema Mickey → sistema responde com disponibilidade real",
              "Confirmou? Estoque já bloqueado nas datas do evento",
              "Faltou peça? Alerta no seu painel antes do problema",
              "Atendeu manualmente? Basta registrar a venda — o resto é automático",
            ].map(t => (
              <li key={t} className="flex gap-3 items-start">
                <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WhatsApp mockup */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full -z-10" />
          <div className="bg-card rounded-[2.5rem] border border-border shadow-glow overflow-hidden">
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-500 grid place-items-center font-bold">PL</div>
              <div>
                <div className="font-semibold text-sm">Pink Love Decorações</div>
                <div className="text-[10px] opacity-80">online · respondendo</div>
              </div>
            </div>
            <div className="p-5 space-y-3 bg-[#efeae2] min-h-[420px]">
              <Msg side="left">Oi! Você tem Kit Mickey disponível pro dia 22/10?</Msg>
              <Msg side="right">Oi querida! 💕 Verifiquei aqui no sistema e SIM, temos 1 Kit Mickey Premium livre nessa data.</Msg>
              <Msg side="right">O investimento é R$ 850 (decoração montada). Posso já reservar pra você?</Msg>
              <Msg side="left">Pode sim! Já confirmo o pix.</Msg>
              <Msg side="right" small>✓ Venda registrada · estoque atualizado · evento agendado</Msg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Msg({ children, side, small }: { children: React.ReactNode; side: "left" | "right"; small?: boolean }) {
  const isRight = side === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className={`${small ? "text-[10px] italic opacity-80" : "text-xs"} max-w-[80%] px-3 py-2 rounded-2xl ${isRight ? "bg-[#dcf8c6] rounded-tr-sm" : "bg-white rounded-tl-sm"} shadow-sm`}>
        {children}
      </div>
    </div>
  );
}
