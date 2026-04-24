import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { memberSchema, type MemberInput, getImageUrl } from "@/lib/members";
import { toast } from "sonner";

interface Props {
  initial?: Partial<MemberInput> & { image_path?: string | null };
  onSubmit: (data: MemberInput, image: File | null) => Promise<void>;
  submitLabel: string;
}

export function MemberForm({ initial, onSubmit, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.image_path ? getImageUrl(initial.image_path) : null,
  );
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(initial?.image_path ? getImageUrl(initial.image_path) : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = memberSchema.safeParse({ name, role, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(parsed.data, imageFile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 ring-2 ring-border">
          {preview && <AvatarImage src={preview} alt="Preview" />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" />
            {preview ? "Change image" : "Upload image"}
          </Button>
          {imageFile && (
            <Button type="button" variant="ghost" size="sm" onClick={clearImage} className="text-muted-foreground">
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required maxLength={100} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend Developer" required maxLength={100} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email / contact</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required maxLength={255} />
      </div>

      <Button type="submit" className="w-full" disabled={busy} style={{ background: "var(--gradient-hero)" }}>
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
