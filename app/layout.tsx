import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const canonicalUrl = new URL("https://byjim.dev/");
const title = "¿Hola amigo? — byJim.dev";
const description = "Un pequeño espacio en la red";
const socialImageAlt =
  "¿Hola amigo? — byJim.dev sobre un fondo de lluvia digital verde";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || requestHeaders.get("host");
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const defaultProtocol =
    host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : defaultProtocol;

  let metadataBase = canonicalUrl;

  if (host) {
    try {
      metadataBase = new URL(`${protocol}://${host}`);
    } catch {
      metadataBase = canonicalUrl;
    }
  }

  const socialImageUrl = new URL("/og.png", metadataBase);

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        {
          url: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          url: "/favicon.svg",
          type: "image/svg+xml",
        },
      ],
      apple: [
        {
          url: "/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "byJim.dev",
      locale: "es_GT",
      type: "website",
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: socialImageAlt,
        },
      ],
    },
  };
}

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
