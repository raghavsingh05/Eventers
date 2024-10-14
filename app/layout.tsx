import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from 'next/font/google'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const poppins = Poppins({
  subsets:['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "Eventers",
  description: "A seamless event planning and management platform.",
  icons:{
    icon:''
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={poppins.variable}
      >
        {children}
      </body>
    </html>
  );
}
