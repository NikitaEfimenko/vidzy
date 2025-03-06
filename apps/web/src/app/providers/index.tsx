'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (<ThemeProvider
    attribute="class"
    defaultTheme="light"
    // enableSystem
  >
    <SessionProvider>
      {children}
    </SessionProvider>
  </ThemeProvider>
  )
}