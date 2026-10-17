import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: {
    default: "Mulaba — considered goods for everyday living",
    template: "%s | Mulaba",
  },
  description:
    "Explore considered furniture, lighting and everyday essentials.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="demo-banner">
              Demo catalog · sample products · payments disabled
            </div>
          )}
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
