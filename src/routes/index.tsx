import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingBom } from "@/components/landing/landing-bom";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingWhatsapp } from "@/components/landing/landing-whatsapp";
import { LandingOffer } from "@/components/landing/landing-offer";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pink Love Gestão — Estoque inteligente para decoradoras" },
      { name: "description", content: "Sistema vitalício de controle financeiro + estoque inteligente para decorações, pegue e monte e locação de brinquedos. Substitua seu SDR." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <LandingNav />
      <LandingHero />
      <main>
        <LandingBom />
        <LandingFeatures />
        <LandingWhatsapp />
        <LandingOffer />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
