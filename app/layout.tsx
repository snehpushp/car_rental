import type { Metadata } from "next";
import { Inter, Roboto, Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarGopher - Premium Car Rental Platform",
  description: "Discover and rent premium cars from verified owners. CarGopher connects car enthusiasts with quality vehicles for every occasion.",
  keywords: ["car rental", "premium cars", "rent a car", "vehicle sharing", "CarGopher"],
  authors: [{ name: "CarGopher Team" }],
  creator: "CarGopher",
  metadataBase: new URL("https://cargopher.com"),
  openGraph: {
    title: "CarGopher - Premium Car Rental Platform",
    description: "Discover and rent premium cars from verified owners",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarGopher - Premium Car Rental Platform",
    description: "Discover and rent premium cars from verified owners",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${montserrat.variable} ${poppins.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
