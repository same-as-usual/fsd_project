# Student Team Members Management App — Plan

## Stack adaptation (read this first)

The original spec asks for **Express + MongoDB + Multer + local /uploads folder**. Lovable's runtime is **TanStack Start (React + server functions on Cloudflare Workers) with Lovable Cloud (Postgres + Storage)**. Express/MongoDB/local filesystem don't run here.

I'll build the **same app, same routes, same UX, same CRUD**, just on the supported stack:

| Original spec | What you'll get |
|---|---|
| Express `/api/members` routes | TanStack server functions (same purpose, type-safe RPC) |
| MongoDB + Mongoose | Postgres `members` table via Lovable Cloud |
| Multer + `/uploads` folder | Lovable Cloud Storage bucket (`member-images`) |
| Axios calls | Direct server-function calls (no HTTP layer needed) |
| React Router | TanStack Router (file-based) |

If you also need raw Express/MongoDB source files for a college submission deliverable, say so after approval and I'll generate them as reference files alongside the live app.

## Scope (confirmed)

- Auth: email/password + Google sign-in (logged-in users only can add/edit/delete)
- Full CRUD + search/filter on members list
- Fields: Name, Role, Email, Profile Image
- Team name and theme: neutral placeholder ("Our Team"), easy to rename later
- Toast notifications for all actions

## Pages (routes)

- `/` — Home: team header, welcome blurb, two big CTAs ("Add Member", "View Members")
- `/auth` — Email/password + Google login/signup (public)
- `/members` — Members grid with search bar, image+name+role cards, "View Details" button, plus Edit/Delete for signed-in users
- `/members/$id` — Full details: image, name, role, email, edit/delete buttons
- `/add` — Add Member form (protected, requires login)
- `/members/$id/edit` — Edit form (protected)

Header on every page shows team name + nav links + login/logout button.

## Database

`members` table:
- `id` (uuid, pk)
- `name` (text)
- `role` (text)
- `email` (text)
- `image_path` (text, nullable — storage path)
- `created_by` (uuid → auth.users)
- `created_at` (timestamptz)

RLS:
- SELECT: public (anyone can view)
- INSERT/UPDATE/DELETE: authenticated users only

Storage bucket `member-images` (public read) for profile photos.

## Server functions

- `listMembers({ search? })` — public, returns members + signed image URLs
- `getMember({ id })` — public
- `createMember({ name, role, email, imageBase64? })` — auth required, uploads to storage
- `updateMember({ id, ... })` — auth required
- `deleteMember({ id })` — auth required

All inputs validated with Zod (name 1–100, role 1–100, email format, image ≤ 5MB).

## UI / styling

- shadcn components: Card, Button, Input, Form, Dialog (delete confirm), Avatar, Badge
- Tailwind, responsive grid (1 col mobile → 3 col desktop)
- sonner toasts for success/error on every mutation
- Loading skeletons on lists
- Empty state when no members yet

## Out of scope for this build

- Roles/permissions beyond "logged in vs not" (any signed-in user can edit any member — typical for a class team-project demo)
- Pagination (search is enough for a class team size)

After approval I'll implement everything in one pass.
