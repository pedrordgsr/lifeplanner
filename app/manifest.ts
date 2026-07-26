import type { MetadataRoute } from "next";

/**
 * Metadados usados pelo navegador ao instalar o Lume na tela inicial.
 * Os PNGs existem em dois tamanhos para cobrir Android/Chrome e o ícone
 * `apple-icon` em `app/` atende ao Safari no iPhone e iPad.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lume Life Planner",
    short_name: "Lume",
    description:
      "Planner interativo e tranquilo para hábitos, dias e metas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f1f7f5",
    theme_color: "#2e7d6b",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
