// app/layout.js
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "InstantB2C - Multi-Tenant Marketplace",
  description: "A premium, isolated marketplace for modern sweet and savory confections.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* The navbar is no longer here, so it won't show on the homepage */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
