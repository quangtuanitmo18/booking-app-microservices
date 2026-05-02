import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookingApp - Flight Booking",
  description: "Search, book, and manage your flights with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
