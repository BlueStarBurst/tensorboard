import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { NextUIProvider } from "@nextui-org/react";

const inter = Inter({ subsets: ["latin"] });
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

export const metadata: Metadata = {
  title: "Tensorboard",
  description: "Drag and Drop python notebook editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={inter.className + " min-h-dvh dark"}>
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </body>

    </html>
  );
}
