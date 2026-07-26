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
      {/* Espaço extra embaixo no celular para a barra de navegação fixa. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
