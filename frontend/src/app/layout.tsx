import type React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { UserRoleProvider } from "@/components/layout/providers";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={geistSans.className}>
        <QueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserRoleProvider>
              <MobileNav />
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 relative  overflow-auto pt-0 lg:pt-0">
                  {children}
                </main>
              </div>
            </UserRoleProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
