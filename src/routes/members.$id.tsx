import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Pencil, Trash2, ArrowLeft, UserCircle2, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getMember, deleteMember, getImageUrl, type Member } from "@/lib/members";
import { toast } from "sonner";

export const Route = createFileRoute("/members/$id")({
  component: MemberDetailsPage,
});

function MemberDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMember(id)
      .then((m) => { if (!cancelled) setMember(m); })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load member";
        toast.error(msg);
        if (!cancelled) setMember(null);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!member) return;
    setDeleting(true);
    try {
      await deleteMember(member.id, member.image_path);
      toast.success(`${member.name} removed`);
      navigate({ to: "/members" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(msg);
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/members">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to members
            </Link>
          </Button>
        </div>

        {member === undefined ? (
          <Card><CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardContent></Card>
        ) : member === null ? (
          <Card><CardContent className="p-12 text-center">
            <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-semibold">Member not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This member may have been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to="/members">Browse members</Link>
            </Button>
          </CardContent></Card>
        ) : (
          <Card className="overflow-hidden shadow-md">
            <div className="h-32" style={{ background: "var(--gradient-hero)" }} />
            <CardContent className="-mt-16 pb-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                  {member.image_path && (
                    <AvatarImage src={getImageUrl(member.image_path) ?? undefined} alt={member.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                    {member.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:pb-2 sm:text-left">
                  <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
                  <Badge variant="secondary" className="mt-2">{member.role}</Badge>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                  <a href={`mailto:${member.email}`} className="text-primary hover:underline break-all">
                    {member.email}
                  </a>
                </DetailRow>
                <DetailRow icon={<UserCircle2 className="h-4 w-4" />} label="Role">
                  {member.role}
                </DetailRow>
                <DetailRow icon={<Calendar className="h-4 w-4" />} label="Added">
                  {new Date(member.created_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </DetailRow>
              </div>

              {isAuthenticated && (
                <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                  <Button asChild variant="outline">
                    <Link to="/members/$id/edit" params={{ id: member.id }}>
                      <Pencil className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the member and their profile image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

function DetailRow({
  icon, label, children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}
