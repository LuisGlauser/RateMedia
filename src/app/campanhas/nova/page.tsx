import { CAMPAIGN_STATUSES } from "@/lib/constants";
import { createCampaign } from "../actions";

export default function NewCampaignPage() {
  return (
    <form action={createCampaign} className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Nova campanha de RPG</h1>
      <input name="title" required placeholder="Título" className="input" />
      <input name="system" required placeholder="Sistema (ex: D&D 5e, Tormenta20)" className="input" />
      <textarea name="synopsis" required rows={4} placeholder="Sinopse" className="input" />
      <textarea name="rules" rows={4} placeholder="Regras da casa (opcional)" className="input" />
      <select name="status" className="input" defaultValue="recruiting">
        {Object.entries(CAMPAIGN_STATUSES).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <button className="btn-primary">Publicar campanha</button>
    </form>
  );
}
