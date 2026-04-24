import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Team — Home" },
      {
        name: "description",
        content:
          "Welcome to our team directory. Browse members or add new teammates to the roster.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <section className="text-center">
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Student team directory
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Meet{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Our Team
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            A clean, simple directory to showcase teammates, their roles, and how to reach
            them. Add new members, browse the roster, and keep everyone connected.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full text-base shadow-lg sm:w-auto"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Link to="/add">
                <UserPlus className="mr-2 h-5 w-5" />
                Add Member
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full text-base sm:w-auto">
              <Link to="/members">
                <Users className="mr-2 h-5 w-5" />
                View Members
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Add teammates",
              body: "Capture name, role, contact, and a profile photo in seconds.",
            },
            {
              title: "Browse roster",
              body: "Search and filter every member from one clean dashboard.",
            },
            {
              title: "Stay in sync",
              body: "Edit details or remove members anytime — changes save instantly.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
