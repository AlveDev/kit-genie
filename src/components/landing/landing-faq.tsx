import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const QA = [
  { q: "Preciso saber mexer em tecnologia?", a: "Não. O sistema foi feito justamente para decoradoras que cansaram de planilhas. O onboarding te conduz passo a passo no cadastro dos primeiros kits e componentes." },
  { q: "Funciona offline no meu galpão?", a: "Sim! Você pode cadastrar componentes, kits e vendas mesmo sem internet. Quando voltar a conectar, tudo sincroniza automaticamente." },
  { q: "E se eu trabalho com vários temas (Mickey, Batman, princesas...)?", a: "Esse é o ponto forte. Cadastre cada componente UMA vez (ex: cilindro branco) e use ele em quantos kits quiser. O sistema entende a reutilização." },
  { q: "Como funciona o orçamento automático no WhatsApp?", a: "O controle de estoque + finanças é vitalício. A automação completa do atendimento via WhatsApp é um upgrade opcional de R$ 9,90/mês, contratado à parte — assim você só paga pelo que precisar. Cancele quando quiser." },
  { q: "Posso exportar meus dados pro contador?", a: "Sim. Exportação em CSV e PDF de vendas, fluxo de caixa, estoque e custos a qualquer momento." },
  { q: "É realmente vitalício, sem mensalidade?", a: "Sim. Pagamento único na Hotmart, acesso para sempre, com todas as atualizações futuras inclusas." },
  { q: "Tem garantia?", a: "7 dias de garantia incondicional. Se não amar, devolvemos 100% do valor — sem perguntas." },
];

export function LandingFaq() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Tira-dúvidas</span>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Perguntas frequentes</h2>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {QA.map((item, i) => (
          <AccordionItem key={item.q} value={`q-${i}`} className="border border-border rounded-2xl px-5 bg-card">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
