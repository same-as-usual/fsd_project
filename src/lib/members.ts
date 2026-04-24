import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const memberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Max 100 chars"),
  role: z.string().trim().min(1, "Role is required").max(100, "Max 100 chars"),
  email: z.string().trim().email("Invalid email").max(255),
});

export type MemberInput = z.infer<typeof memberSchema>;

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  image_path: string | null;
  created_at: string;
}

const BUCKET = "member-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMemberImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be smaller than 5MB");
  }
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteMemberImage(path: string | null) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function listMembers(search?: string): Promise<Member[]> {
  let q = supabase
    .from("members")
    .select("id, name, role, email, image_path, created_at")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    q = q.or(`name.ilike.${s},role.ilike.${s},email.ilike.${s}`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data as Member[];
}

export async function getMember(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("id, name, role, email, image_path, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Member | null;
}

export async function createMember(input: MemberInput, image?: File | null) {
  const parsed = memberSchema.parse(input);
  let image_path: string | null = null;
  if (image) image_path = await uploadMemberImage(image);

  const { data: userData } = await supabase.auth.getUser();
  const created_by = userData.user?.id ?? null;

  const { data, error } = await supabase
    .from("members")
    .insert({ ...parsed, image_path, created_by })
    .select()
    .single();
  if (error) {
    if (image_path) await deleteMemberImage(image_path);
    throw error;
  }
  return data;
}

export async function updateMember(
  id: string,
  input: MemberInput,
  newImage?: File | null,
  oldImagePath?: string | null,
) {
  const parsed = memberSchema.parse(input);
  const patch: Partial<Member> = { ...parsed };

  if (newImage) {
    patch.image_path = await uploadMemberImage(newImage);
  }

  const { data, error } = await supabase
    .from("members")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (newImage && patch.image_path) await deleteMemberImage(patch.image_path);
    throw error;
  }

  if (newImage && oldImagePath) await deleteMemberImage(oldImagePath);
  return data;
}

export async function deleteMember(id: string, imagePath?: string | null) {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw error;
  if (imagePath) await deleteMemberImage(imagePath);
}
