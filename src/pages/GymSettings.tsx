import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
];

const S = {
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 28 },
  form: { maxWidth: 560 },
  group: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, color: "#aaa", marginBottom: 6 },
  input: {
    width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: 8,
    padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none",
  },
  select: {
    width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: 8,
    padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none",
  },
  colorRow: { display: "flex", alignItems: "center", gap: 12 },
  colorSwatch: (color: string) => ({
    width: 36, height: 36, borderRadius: 6, background: color, border: "2px solid #333", flexShrink: 0,
  }),
  btn: {
    padding: "11px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14,
    cursor: "pointer", border: "none", background: "#1BBFBF", color: "#000",
  },
  saved: { color: "#34C759", fontSize: 13, marginLeft: 12 },
  section: { marginTop: 40, paddingTop: 32, borderTop: "1px solid #252525" },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
  sectionSub: { fontSize: 13, color: "#666", marginBottom: 20 },
};

export default function GymSettings() {
  const gym = useQuery(api.gyms.getMyGym);
  const updateSettings = useMutation(api.gyms.updateSettings);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    primaryColor: "#1BBFBF",
    timezone: "America/New_York",
    stripeUnlimitedMonthlyPriceId: "",
    stripeUnlimitedAnnualPriceId: "",
    stripeTwiceWeeklyMonthlyPriceId: "",
    stripeTwiceWeeklyAnnualPriceId: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name,
        tagline: gym.tagline,
        primaryColor: gym.primaryColor,
        timezone: gym.timezone,
        stripeUnlimitedMonthlyPriceId: gym.stripeUnlimitedMonthlyPriceId ?? "",
        stripeUnlimitedAnnualPriceId: gym.stripeUnlimitedAnnualPriceId ?? "",
        stripeTwiceWeeklyMonthlyPriceId: gym.stripeTwiceWeeklyMonthlyPriceId ?? "",
        stripeTwiceWeeklyAnnualPriceId: gym.stripeTwiceWeeklyAnnualPriceId ?? "",
      });
    }
  }, [gym]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        name: form.name,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
        timezone: form.timezone,
        stripeUnlimitedMonthlyPriceId: form.stripeUnlimitedMonthlyPriceId || undefined,
        stripeUnlimitedAnnualPriceId: form.stripeUnlimitedAnnualPriceId || undefined,
        stripeTwiceWeeklyMonthlyPriceId: form.stripeTwiceWeeklyMonthlyPriceId || undefined,
        stripeTwiceWeeklyAnnualPriceId: form.stripeTwiceWeeklyAnnualPriceId || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  if (!gym) return null;

  return (
    <div>
      <h1 style={S.h1}>Gym Settings</h1>
      <form style={S.form} onSubmit={handleSubmit}>
        {/* Branding */}
        <div style={S.group}>
          <label style={S.label}>Gym name</label>
          <input style={S.input} value={form.name} onChange={set("name")} required />
        </div>
        <div style={S.group}>
          <label style={S.label}>Tagline</label>
          <input style={S.input} value={form.tagline} onChange={set("tagline")} placeholder="Powered by NorthernGlow" />
        </div>
        <div style={S.group}>
          <label style={S.label}>Primary colour</label>
          <div style={S.colorRow}>
            <div style={S.colorSwatch(form.primaryColor)} />
            <input style={S.input} value={form.primaryColor} onChange={set("primaryColor")} placeholder="#1BBFBF" />
          </div>
        </div>
        <div style={S.group}>
          <label style={S.label}>Timezone</label>
          <select style={S.select} value={form.timezone} onChange={set("timezone")}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Stripe */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Stripe price IDs</div>
          <div style={S.sectionSub}>
            Leave blank to use the platform defaults. Create products in your Stripe dashboard and paste the price IDs here.
          </div>
          {[
            ["stripeUnlimitedMonthlyPriceId", "Unlimited — Monthly"],
            ["stripeUnlimitedAnnualPriceId", "Unlimited — Annual"],
            ["stripeTwiceWeeklyMonthlyPriceId", "Twice Weekly — Monthly"],
            ["stripeTwiceWeeklyAnnualPriceId", "Twice Weekly — Annual"],
          ].map(([field, label]) => (
            <div key={field} style={S.group}>
              <label style={S.label}>{label}</label>
              <input
                style={S.input}
                value={form[field as keyof typeof form]}
                onChange={set(field as keyof typeof form)}
                placeholder="price_..."
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <button style={S.btn} type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span style={S.saved}>Saved!</span>}
        </div>
      </form>
    </div>
  );
}
