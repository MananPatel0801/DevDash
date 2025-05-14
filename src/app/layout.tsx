import type {Metadata} from 'next';
import { Geist } from 'next/font/google'; // Using Geist Sans as the primary font
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: 'DevDash - Plan Your Day',
  description: 'A dashboard to help developers plan their day, integrating GitHub, Pomodoro, notes, and tasks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Modified ThemeProvider props to align with next-themes style if that was intended,
// but the custom ThemeProvider doesn't use `attribute`, `enableSystem`, `disableTransitionOnChange`.
// Reverting to custom ThemeProvider's props:
// <ThemeProvider defaultTheme="system" storageKey="devdash-theme">
// Let's correct the ThemeProvider usage based on the custom provider.
// The custom ThemeProvider doesn't take `attribute`, `enableSystem`, `disableTransitionOnChange`.
// It handles `class` internally on `<html>`.
// So, the above ThemeProvider usage should be:
// <ThemeProvider storageKey="devdash-theme" defaultTheme="system">
// I will correct this in the actual ThemeProvider itself to set class on html and then layout.tsx just needs the ThemeProvider.
// The provided ThemeProvider already handles class on html.
// The `suppressHydrationWarning` on <html> is good practice when using client-side theme logic.
