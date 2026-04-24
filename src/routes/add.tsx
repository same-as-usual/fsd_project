import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { MemberForm } from "@/components/MemberForm";
import { useAuth } from "@/hooks/use-auth";
import { createMember, type MemberInput } from "@/lib/members";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add Member — Our Team" },
      { name: "description", content: "Add a new teammate to the directory." },
    ],
  }),
  component: AddMemberPage,
});

function AddMemberPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("Please sign in to add members");
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (data: MemberInput, image: File | null) => {
    await createMember(data, image);
    toast.success(`${data.name} added to the team`);
    navigate({ to: "/members" });
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link to="/members" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to members
          </Link>
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Add a team member</CardTitle>
            <CardDescription>Fill in the details below to add someone to the roster.</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberForm onSubmit={handleSubmit} submitLabel="Add member" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
