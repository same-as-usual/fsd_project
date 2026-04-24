import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Plus, Mail, Pencil, Trash2, UserCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  listMembers, deleteMember, getImageUrl, type Member,
} from "@/lib/members";
import { toast } from "sonner";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — Our Team" },
      { name: "description", content: "Browse all team members in the directory." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const { isAuthenticated } = useAuth();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = async (q?: string) => {
    try {
      const data = await listMembers(q);
      setMembers(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load members";
      toast.error(msg);
      setMembers([]);
    }
  };

  useEffect(() => {
    setMembers(null);
    refresh(debounced);
  }, [debounced]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteMember(toDelete.id, toDelete.image_path);
      toast.success(`${toDelete.name} removed`);
      setToDelete(null);
      refresh(debounced);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {members === null ? "Loading…" : `${members.length} member${members.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild style={{ background: "var(--gradient-hero)" }}>
              <Link to="/add">
                <Plus className="mr-1 h-4 w-4" /> Add member
              </Link>
            </Button>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or email…"
            className="pl-9"
          />
        </div>

        {members === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-9 w-full" />
              </CardContent></Card>
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState isAuthenticated={isAuthenticated} hasSearch={!!debounced} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                canEdit={isAuthenticated}
                onDelete={() => setToDelete(m)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the member and their profile image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MemberCard({
  member, canEdit, onDelete,
}: { member: Member; canEdit: boolean; onDelete: () => void }) {
  const img = getImageUrl(member.image_path);
  const initials = member.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Card className="group overflow-hidden transition hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-border">
            {img && <AvatarImage src={img} alt={member.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials || <UserCircle2 className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{member.name}</p>
            <p className="truncate text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/members/$id" params={{ id: member.id }}>View details</Link>
          </Button>
          {canEdit && (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/members/$id/edit" params={{ id: member.id }}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ isAuthenticated, hasSearch }: { isAuthenticated: boolean; hasSearch: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 font-semibold">
        {hasSearch ? "No matches" : "No members yet"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasSearch
          ? "Try a different search term."
          : isAuthenticated
            ? "Add your first teammate to get started."
            : "Sign in to add the first teammate."}
      </p>
      {!hasSearch && (
        <Button asChild className="mt-6" style={{ background: "var(--gradient-hero)" }}>
          <Link to={isAuthenticated ? "/add" : "/auth"}>
            <Plus className="mr-1 h-4 w-4" />
            {isAuthenticated ? "Add member" : "Sign in"}
          </Link>
        </Button>
      )}
    </div>
  );
}
