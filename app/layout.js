import "./globals.css";

export const metadata = {
  title: "FrostyUp",
  description:
    "Aplikasi resmi FrostyUp — top up game & voucher tercepat, langsung dari website asli.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FrostyUp",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1929",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://www.frostyup.id" />
        <link rel="dns-prefetch" href="https://www.frostyup.id" />
      </head>
      <body>{children}</body>
    </html>
  );
}
