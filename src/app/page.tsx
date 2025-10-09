import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Broadcast Bridge
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          Create, manage, and publish your podcast episodes. Generate an RSS feed
          your listeners and platforms can subscribe to.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/sign-in">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/app/episodes">
            <Button size="lg" variant="secondary">
              Go to app
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
