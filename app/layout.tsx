import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { accessArea, planningAreas } from "@/lib/planning-areas";

export const metadata: Metadata = {
  title: "Shivi Wedding Planning",
  description: "A private single-Wedding planning workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar" aria-label="Primary navigation">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                S
              </span>
              <span>
                <span className="brand-name">Shivi</span>
                <span className="brand-subtitle">Wedding Planning</span>
              </span>
            </Link>

            <nav className="nav-list">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <Link href={accessArea.href} className="nav-link">
                {accessArea.label}
              </Link>
              {planningAreas.map((area) => (
                <Link href={area.href} className="nav-link" key={area.href}>
                  {area.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
