"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Podcast setup</h1>
        <p className="text-sm text-muted-foreground">Choose how you&apos;d like to get started.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-2 text-lg font-medium">Create new</h2>
          <p className="mb-3 text-sm text-muted-foreground">Start a brand-new podcast and configure details.</p>
          <Button onClick={() => router.push("/app/onboarding/new")}>New</Button>
        </div>
        <div className="rounded border p-4">
          <h2 className="mb-2 text-lg font-medium">Import existing</h2>
          <p className="mb-3 text-sm text-muted-foreground">Import episodes from an existing RSS feed.</p>
          <Button variant="secondary" onClick={() => router.push("/app/onboarding/import")}>Import</Button>
        </div>
      </div>
    </div>
  );
}