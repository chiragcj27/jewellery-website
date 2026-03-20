import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import WhatsAppButton from "../components/whatsapp-button";
import { AuthProvider } from "@/context/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Swarnorra by Soni Ramniklal Jewellers | Fine Gold & Diamond Jewellery",
  description: "TheSwarnorra by Soni Ramniklal Jewellers — over 90 years of jewellery craftsmanship. Shop fine gold and diamond jewellery crafted with heritage artistry and modern elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <style> 
  @import url(&quot;https://fonts.googleapis.com/css2?family=Belleza&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap&quot;);
      </style>
    </head>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AuthProvider>
        <Navbar />
        <Toaster position="bottom-right" />
        {children}
        <Footer />
        <WhatsAppButton />
      </AuthProvider>
    </body>
  </html>
);

}