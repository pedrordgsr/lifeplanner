import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import { requireUser } from "@/lib/auth";

export default async function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader username={user.username} />
      {/* No celular não há cabeçalho: o conteúdo começa no topo e reserva
          espaço embaixo para a pílula de navegação flutuante. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-10">
        {children}
      </main>
      <BottomNav username={user.username} />
    </div>
  );
}
