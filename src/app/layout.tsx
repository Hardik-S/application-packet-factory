import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Application Packet Factory",
  description: "Synthetic career packet QA with explicit truth boundaries."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
