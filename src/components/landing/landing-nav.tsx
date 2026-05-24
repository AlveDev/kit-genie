import { Link } from "@tanstack/react-router";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-pink-100/60 bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-soft">P</div>
          <span className="text-xl font-bold tracking-tight text-primary-dark">PinkLove <span className="font-light text-foreground/70">Gestão</span></span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-foreground/65">
          <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
          <a href="#bom" className="hover:text-primary transition-colors">Como funciona</a>
          <a href="#oferta" className="hover:text-primary transition-colors">Preço único</a>
          <a href="#faq" className="hover:text-primary transition-colors">Dúvidas</a>
        </div>
        <Link
          to="/app"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors shadow-soft"
        >
          Acessar sistema
        </Link>
      </div>
    </nav>
  );
}
