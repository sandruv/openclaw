import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from 'next/script';
import "./globals.css";
import { ToastProvider } from '@/components/ui/toast-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { PermissionsProvider } from '@/contexts/PermissionsContext'
import { LoaderProvider } from '@/contexts/LoaderContext';
import { RouteLoaderDialog } from '@/components/ui/route-loader-dialog';
import { RouteLoaderWrapper } from '@/components/route-loader-wrapper';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeScript } from '@/components/theme-script';
import { UndoToastProvider } from '@/components/global/UndoToast/UndoToastProvider';
import { ToastInitializer } from '@/components/providers/ToastInitializer';

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Yanceyworks Portal",
  description: "Yanceyworks Helpdesk Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apply fonts as separate variables to avoid hydration mismatch
  const fontClasses = `${geistSans.variable} ${geistMono.variable}`;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load Google Maps script with key (if available) */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="beforeInteractive"
          />
        )}
        <ThemeScript />
      </head>
      <body
        className={`${fontClasses} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LoaderProvider>
          <AuthProvider>
            <PermissionsProvider>
              <ThemeProvider>
                <RouteLoaderWrapper>
                  <ToastProvider>
                    <ToastInitializer />
                    <RouteLoaderDialog />
                    {children}
                    <UndoToastProvider />
                  </ToastProvider>
                </RouteLoaderWrapper>
              </ThemeProvider>
            </PermissionsProvider>
          </AuthProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}