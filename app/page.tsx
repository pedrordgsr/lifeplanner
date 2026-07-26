import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Details from "@/components/landing/Details";
import CallToAction from "@/components/landing/CallToAction";
import LandingFooter from "@/components/landing/LandingFooter";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lume Life Planner · hábitos, dias e metas em um lugar calmo",
  description:
    "Planner interativo em três páginas: mapa do mês com a roda de hábitos, planner diário e mapa do ano. Salva sozinho e cabe no celular.",
};

/**
 * Porta de entrada do Lume. É pública: quem não tem conta conhece o planner
 * antes de ver a tela de login (o proxy libera "/"). Quem já está logado vê os
 * mesmos textos, mas com os botões apontando direto para o planner.
 */
export default async function LandingPage() {
  const loggedIn = (await getSession()) !== null;

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader loggedIn={loggedIn} />
      <main className="flex-1">
        <Hero loggedIn={loggedIn} />
        <Features />
        <Details />
        <CallToAction loggedIn={loggedIn} />
      </main>
      <LandingFooter loggedIn={loggedIn} />
    </div>
  );
}
