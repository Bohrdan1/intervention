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

export async function updateSiteFromDetail(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  if (!id || !clientId) return;

  const nom = (formData.get("nom") as string)?.trim();
  if (!nom) return;

  const periodicite_raw = formData.get("periodicite_maintenance") as string | null;
  const periodiciteVal = periodicite_raw ? parseInt(periodicite_raw, 10) : NaN;

  await supabase
    .from("sites")
    .update({
      nom,
      adresse: (formData.get("adresse") as string)?.trim() || null,
      periodicite_maintenance: !isNaN(periodiciteVal) && periodiciteVal > 0 ? periodiciteVal : null,
      contact_nom: (formData.get("contact_nom") as string)?.trim() || null,
      contact_fonction: (formData.get("contact_fonction") as string)?.trim() || null,
      contact_telephone: (formData.get("contact_telephone") as string)?.trim() || null,
      contact_mail: (formData.get("contact_mail") as string)?.trim() || null,
      horaires: (formData.get("horaires") as string)?.trim() || null,
      code_acces: (formData.get("code_acces") as string)?.trim() || null,
      notes_site: (formData.get("notes_site") as string)?.trim() || null,
      memo_prive: (formData.get("memo_prive") as string)?.trim() || null,
    })
    .eq("id", id);

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}
