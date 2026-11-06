import { createClient } from "@/lib/supabase/server";

export function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function mediaRatings(ids: string[]): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();
  if (ids.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_entries")
    .select("media_id, rating")
    .in("media_id", ids);
  const grouped = new Map<string, (number | null)[]>();
  (data ?? []).forEach((e) => {
    grouped.set(e.media_id, [...(grouped.get(e.media_id) ?? []), e.rating]);
  });
  ids.forEach((id) => map.set(id, average(grouped.get(id) ?? [])));
  return map;
}

export async function campaignRatings(ids: string[]): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();
  if (ids.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_reviews")
    .select("campaign_id, rating")
    .in("campaign_id", ids);
  const grouped = new Map<string, number[]>();
  (data ?? []).forEach((r) => {
    grouped.set(r.campaign_id, [...(grouped.get(r.campaign_id) ?? []), Number(r.rating)]);
  });
  ids.forEach((id) => map.set(id, average(grouped.get(id) ?? [])));
  return map;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" ? user : null;
}
