import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
