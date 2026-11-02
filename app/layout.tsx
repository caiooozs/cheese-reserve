import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Grand_Hotel } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { PRODUTO } from "@/lib/produto";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const grandHotel = Grand_Hotel({
  variable: "--font-grand-hotel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PRODUTO.nome,
  description: PRODUTO.descricao,
  openGraph: {
    title: PRODUTO.nome,
    description: PRODUTO.descricao,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14532d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${grandHotel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
