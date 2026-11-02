import "./globals.css";

export const metadata = {
  title: "AntarRamayana",
  description: "An evidence-led Ramayana explorer for text, lineage, and interpretation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
