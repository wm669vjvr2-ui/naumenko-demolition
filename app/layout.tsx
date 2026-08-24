import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "cyrillic"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://wm669vjvr2-ui.github.io/naumenko-demolition/"),
  title: "Демонтаж под ключ в Москве и области",
  description: "Демонтаж квартир, стен, стяжки, сантехкабин, ванных комнат и коммерческих помещений. Расчёт стоимости по фото.",
  keywords: ["демонтаж Москва", "демонтаж квартиры", "демонтаж стен", "демонтаж под ключ", "вывоз строительного мусора"],
  icons: {
    icon: "https://wm669vjvr2-ui.github.io/naumenko-demolition/logo.jpg",
    apple: "https://wm669vjvr2-ui.github.io/naumenko-demolition/logo.jpg",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "Демонтаж под ключ в Москве и МО",
    description: "Квартиры, коммерческие помещения и отдельные конструкции. Расчёт по фото в Telegram, WhatsApp или MAX.",
    images: [{
      url: "https://wm669vjvr2-ui.github.io/naumenko-demolition/og.png",
      width: 1200,
      height: 630,
      alt: "Демонтаж в Москве и Московской области",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Демонтаж под ключ в Москве и МО",
    description: "Расчёт стоимости демонтажа по фото в удобном мессенджере.",
    images: ["https://wm669vjvr2-ui.github.io/naumenko-demolition/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
