/** Chave do localStorage com a escolha explícita do usuário ("light" | "dark"). */
export const THEME_KEY = "lume-theme";

/** Cor da barra do navegador no celular, por tema (casa com --bg). */
export const THEME_META_COLOR = {
  light: "#f1f7f5",
  dark: "#0b1614",
} as const;

/**
 * Roda de forma síncrona enquanto o HTML é lido, antes da primeira pintura:
 * assim quem escolheu o tema escuro nunca vê o claro piscar. Precisa ser
 * inline — um <script src> chegaria tarde demais.
 *
 * O padrão é sempre o claro, independente do tema do sistema: só o escuro
 * salvo aqui muda o atributo que o layout já renderizou como "light".
 */
const SCRIPT = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
