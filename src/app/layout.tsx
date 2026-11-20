import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AntarRamayana",
  description: "An evidence-led Ramayana explorer: a source-backed graph, deterministic retrieval, and models that may only explain what was retrieved.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <Nav />
        </div>
        {children}
      </body>
    </html>
  );
}
