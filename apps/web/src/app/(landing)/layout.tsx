
import { auth } from "@/app/config/auth";
import "@/app/globals.css";
import { AutoAuth } from "@/features/auto-auth/ui";
import { ThemeChoise } from "@/features/theme-switcher";
import { Guard } from "@/shared/lib/sdk";
import { Button } from "@/shared/ui/button";
import { Toaster } from "@/shared/ui/sonner";
import UserAvatar from "@/widgets/user-profile/ui";
import { ProfileDrowpdownMenu } from "@/widgets/user-profile/ui/dropdown";
import { LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { Providers } from "../providers";
import { Threads } from "./_components/squares";
import Script from "next/script";


const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Procat - Find and Develop services",
  description: "Register your SaaS, connect sdk",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <Script
          id="yandex-metrika"
          strategy="afterInteractive" // Загружается после первой отрисовки страницы
          dangerouslySetInnerHTML={{
            __html: `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(100558579, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
          });
      `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <Providers>
          <AutoAuth
            loader={<LoaderCircle size={64} className="animate-spin" />}
          />
          <header className="container mx-auto flex items-center justify-between py-4">

            {session?.user ? <ProfileDrowpdownMenu profileSlot={<UserAvatar />} /> :
              <Link href="/">
                <div className="flex items-center gap-2">
                  <span className="text-3xl text-primary font-bold leading-relaxed">
                    Vidzy
                  </span>
                </div>
              </Link>
            }
            <Guard level="Базовая подписка Vidzy"
              expiredFallback={<></>}
              noAccessFallback={<></>}
            >
              <Link href="/visual-renderer">
                <Button size="sm" variant="default">
                  Dashboard<MdDashboard />
                </Button>
              </Link>
            </Guard>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#pricing">
                Pricing
              </Link>
              <div className="flex justify-end">
                <div className="w-fit">
                  <ThemeChoise />
                </div>
              </div>
            </nav>
          </header>
          <main className='container min-h-screen flex flex-col items-center text-start'>
            <Threads />
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
