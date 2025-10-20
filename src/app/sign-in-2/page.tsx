'use client'

import React from 'react'
import SignInForm from '@/components/SignInForm'
import { Card, CardContent } from '@/components/ui/card'

function SignInPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignInForm className="w-full" />
        </div>
      </div>
      <div className="relative border-t md:border-t-0 md:border-l p-8 md:p-12 flex items-center bg-gradient-to-br from-primary/15 via-primary/10 to-background">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(60%_60%_at_70%_30%,black,transparent)]" />
        <div className="relative mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Core features</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h4l2-7 4 14 2-7h6" />
                  </svg>
                </div>
                <p className="font-medium">Real-time monitoring</p>
                <p className="text-muted-foreground text-sm">Track stream health, latency, and uptime at a glance.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v14" />
                  </svg>
                </div>
                <p className="font-medium">Multi-platform distribution</p>
                <p className="text-muted-foreground text-sm">Publish simultaneously to your key destinations.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.054-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="font-medium">Alerts & incident timelines</p>
                <p className="text-muted-foreground text-sm">Get instant notifications and searchable event history.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M7 13v4m4-8v8m4-12v12" />
                  </svg>
                </div>
                <p className="font-medium">Analytics & reports</p>
                <p className="text-muted-foreground text-sm">Audience insights and exportable performance reports.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage