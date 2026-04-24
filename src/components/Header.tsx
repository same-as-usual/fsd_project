import { Link, useNavigate } from "@tanstack/react-router";
import { Users, LogOut, LogIn, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Header() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Users className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Our Team</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/members" activeProps={{ className: "text-primary font-semibold" }}>
              Members
            </Link>
          </Button>

          {isAuthenticated && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/add">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Link>
            </Button>
          )}

          {loading ? null : isAuthenticated ? (
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">
                <LogIn className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
