"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CAMPAIGN_STATUSES } from "@/lib/constants";
import type { CampaignStatus } from "@/types";

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/campanhas/nova");

  const status = String(formData.get("status") ?? "recruiting");
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      author_id: user.id,
      title: String(formData.get("title") ?? "").trim(),
      synopsis: String(formData.get("synopsis") ?? "").trim(),
      system: String(formData.get("system") ?? "").trim(),
      rules: String(formData.get("rules") ?? "").trim() || null,
      status: (status in CAMPAIGN_STATUSES ? status : "recruiting") as CampaignStatus,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/campanhas");
  redirect(`/campanhas/${data.id}`);
}

export async function submitCampaignReview(campaignId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/campanhas/${campaignId}`);

  const rating = Math.min(5, Math.max(0, Number(formData.get("rating") ?? 0)));
  const { error } = await supabase.from("campaign_reviews").upsert(
    {
      campaign_id: campaignId,
      user_id: user.id,
      rating,
      comment: String(formData.get("comment") ?? "").trim() || null,
    },
    { onConflict: "campaign_id,user_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/campanhas/${campaignId}`);
}
