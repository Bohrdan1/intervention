"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateClientFromDetail(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return;

  const nom = (formData.get("nom") as string)?.trim();
  if (!nom) return;

  await supabase
    .from("clients")
    .update({
      nom,
      denomination_legale: (formData.get("denomination_legale") as string)?.trim() || null,
      type_client: (formData.get("type_client") as string) || "professionnel",
      ridet: (formData.get("ridet") as string)?.trim() || null,
      adresse_facturation: (formData.get("adresse_facturation") as string)?.trim() || null,
      telephone: (formData.get("telephone") as string)?.trim() || null,
      telephone_secondaire: (formData.get("telephone_secondaire") as string)?.trim() || null,
      mail: (formData.get("mail") as string)?.trim() || null,
      mail_comptabilite: (formData.get("mail_comptabilite") as string)?.trim() || null,
      prenom: (formData.get("prenom") as string)?.trim() || null,
      fonction: (formData.get("fonction") as string)?.trim() || null,
      site_web: (formData.get("site_web") as string)?.trim() || null,
      notes_internes: (formData.get("notes_internes") as string)?.trim() || null,
    })
    .eq("id", id);

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}
