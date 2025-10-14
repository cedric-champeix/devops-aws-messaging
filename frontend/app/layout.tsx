"use client"

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from "react-oidc-context";

import './globals.css'
import { oidcConfig } from '@/lib/oidcConfig';

import type { ReactNode } from "react"

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider {...oidcConfig}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
