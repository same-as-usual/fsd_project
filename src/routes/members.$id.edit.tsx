import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MemberForm } from "@/components/MemberForm";
import { useAuth } from "@/hooks/use-auth";
import { getMember, updateMember, type Member, type MemberInput } from "@/lib/members";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/members/$id/edit")({
  component: EditMemberPage,
});

function EditMemberPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [member, setMember] = useState<Member | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("Please sign in to edit members");
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    let cancelled = false;
    getMember(id)
      .then((m) => { if (!cancelled) setMember(m); })
      .catch(() => { if (!cancelled) setMember(null); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (data: MemberInput, image: File | null) => {
    if (!member) return;
    await updateMember(member.id, data, image, member.image_path);
    toast.success("Changes saved");
    navigate({ to: "/members/$id", params: { id: member.id } });
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link to="/members/$id" params={{ id }} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to details
          </Link>
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Edit member</CardTitle>
            <CardDescription>Update the details below.</CardDescription>
          </CardHeader>
          <CardContent>
            {member === undefined ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : member === null ? (
              <p className="text-sm text-muted-foreground">Member not found.</p>
            ) : (
              <MemberForm
                initial={{
                  name: member.name,
                  role: member.role,
                  email: member.email,
                  image_path: member.image_path,
                }}
                onSubmit={handleSubmit}
                submitLabel="Save changes"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
