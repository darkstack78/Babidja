import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import AuthDrawer from "@/components/auth/AuthDrawer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Babydja - Le meilleur, à la manière ivoirienne",
  description: "Plateforme de réservation d'hôtels et de location de voitures en Côte d'Ivoire.",
  // Pas d'override manifest ici : src/app/manifest.ts (natif App Router) est
  // servi automatiquement sur /manifest.webmanifest. L'ancien public/manifest.json
  // statique (valeurs différentes, ex. theme_color) a été supprimé pour éviter
  // que les deux coexistent de façon incohérente.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-[#f6f6f4]">
        <QueryProvider>
          {children}
          {/* Monté une seule fois ici : openDrawer() est appelé depuis des pages sous
              plusieurs layouts différents (public, reservation...) ; AuthDrawer
              n'était auparavant jamais rendu nulle part dans l'arbre, ce qui rendait
              tout le flux de connexion invisible malgré un state Zustand correct. */}
          <AuthDrawer />
        </QueryProvider>
      </body>
    </html>
  );
}
