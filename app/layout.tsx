import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/lib/constants";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${BRAND_NAME} | Premium Graphic T-Shirts`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[family-name:var(--font-body)] text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
