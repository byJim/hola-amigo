import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¿Hola amigo? — byJim.dev",
  description: "Un pequeño espacio en la red",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#020705",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
