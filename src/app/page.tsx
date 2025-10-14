import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">


      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Build, publish, and grow your podcast
          </div>
          <h1 className="mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-6xl">
            The simple bridge between recording and every podcast app
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
            Create episodes, manage show notes and artwork, and publish to an auto‑generated RSS feed that listeners and platforms can subscribe to.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/app/episodes">
              <Button size="lg" variant="secondary">Go to app</Button>
            </Link>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-background p-6">
              <div className="text-2xl">🎙️</div>
              <h3 className="mt-3 font-semibold">Episode management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Draft, schedule, and publish episodes with titles, descriptions, and chapter notes.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <div className="text-2xl">🧩</div>
              <h3 className="mt-3 font-semibold">Assets & show notes</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Attach audio files, cover art, and rich show notes that look great everywhere.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <div className="text-2xl">📡</div>
              <h3 className="mt-3 font-semibold">Instant RSS feed</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A standards‑compliant RSS feed ready for Apple Podcasts, Spotify, and more.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <div className="text-2xl">📈</div>
              <h3 className="mt-3 font-semibold">Built to scale</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fast, modern UI with a publisher‑first workflow. No bloat.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">How it works</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border p-6">
              <div className="text-sm text-muted-foreground">Step 1</div>
              <h3 className="mt-2 font-medium">Create your show</h3>
              <p className="mt-2 text-sm text-muted-foreground">Add your show details and branding once.</p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="text-sm text-muted-foreground">Step 2</div>
              <h3 className="mt-2 font-medium">Add episodes</h3>
              <p className="mt-2 text-sm text-muted-foreground">Upload audio, write notes, and set a publish time.</p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="text-sm text-muted-foreground">Step 3</div>
              <h3 className="mt-2 font-medium">Publish everywhere</h3>
              <p className="mt-2 text-sm text-muted-foreground">Share the RSS feed to reach every podcast app.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">Simple pricing</h2>
            <div className="mx-auto mt-8 max-w-md rounded-lg border p-6 text-center">
              <div className="text-4xl font-bold">Free</div>
              <p className="mt-2 text-sm text-muted-foreground">Everything you need to publish your podcast.</p>
              <div className="mt-6">
                <Link href="/sign-in">
                  <Button size="lg">Start for free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Ready to publish your next episode?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Join creators who use Broadcast Bridge to ship faster and reach more listeners.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/sign-in">
                <Button size="lg">Get started</Button>
              </Link>
              <Link href="/app/episodes">
                <Button size="lg" variant="secondary">Go to app</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Broadcast Bridge</div>
          <div className="flex items-center gap-4">
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#pricing">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

