import NavLinks from "./NavLinks";

/**
 * Barra de navegação fixa no rodapé — só no celular, onde o polegar alcança.
 * Fica fora do <header> de propósito: o backdrop-blur de lá cria um bloco de
 * contenção e prenderia qualquer filho `fixed` dentro do cabeçalho.
 */
export default function BottomNav() {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-bg/85 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
      <NavLinks />
    </div>
  );
}
