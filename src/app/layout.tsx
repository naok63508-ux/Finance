import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App de Finanças",
  description: "Gerenciamento financeiro pessoal com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.variable} min-h-full flex flex-col bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
