import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    // Les photos d'hôtels/véhicules sont des URLs saisies librement par les
    // pros dans le formulaire catalogue (pas de domaine connu à l'avance).
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default withPWA(withNextIntl(nextConfig));
