import { Link } from "@tanstack/react-router";
import { ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBasket className="h-6 w-6" />
            <span className="font-display text-xl font-bold">Listify</span>
          </Link>
          <span className="ml-auto hidden text-sm opacity-80 sm:block">Suas listas de compras</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
