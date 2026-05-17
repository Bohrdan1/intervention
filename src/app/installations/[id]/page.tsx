import { redirect } from "next/navigation";

// Redirige les anciennes URLs /installations/[id] vers /equipements/[id]
export default async function OldInstallationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/equipements/${id}`);
}
