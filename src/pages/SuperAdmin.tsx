import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const S = {
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  sub: { color: "#888", fontSize: 14, marginBottom: 32 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" } as const,
  card: { background: "#141414", border: "1px solid #252525", borderRadius: 10, padding: 24, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20 },
  group: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, color: "#aaa", marginBottom: 6 },
  input: {
    width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: 8,
    padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const,
  },
  btn: {
    width: "100%", padding: "11px 0", borderRadius: 8, fontWeight: 600, fontSize: 14,
    cursor: "pointer", border: "none", background: "#1BBFBF", color: "#000", marginTop: 4,
  },
  btnSmall: {
    padding: "5px 12px", borderRadius: 6, fontWeight: 600, fontSize: 12,
    cursor: "pointer", border: "none", background: "#1BBFBF22", color: "#1BBFBF",
  },
  success: { color: "#34C759", fontSize: 13, marginTop: 12 },
  error: { color: "#ff453a", fontSize: 13, marginTop: 12 },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { textAlign: "left" as const, padding: "8px 12px", fontSize: 12, color: "#666", borderBottom: "1px solid #252525" },
  td: { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid #1a1a1a", verticalAlign: "middle" as const },
  dot: (color: string) => ({
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, marginRight: 6,
  }),
  expiredBadge: {
    display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 11,
    background: "#FF9F0A22", color: "#FF9F0A", marginLeft: 6,
  },
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
  "Australia/Melbourne",
];

function PendingInvites() {
  const invites = useQuery(api.invites.listPendingAdminInvites);
  const resend = useMutation(api.invites.superAdminResendInvite);
  const [resending, setResending] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleResend = async (gymId: Id<"gyms">, email: string, inviteId: string) => {
    setResending(inviteId);
    setResendSuccess(null);
    try {
      await resend({ gymId, adminEmail: email });
      setResendSuccess(inviteId);
      setTimeout(() => setResendSuccess(null), 3000);
    } finally {
      setResending(null);
    }
  };

  if (invites === undefined) return <p style={{ color: "#666", fontSize: 13 }}>Loading…</p>;
  if (invites.length === 0) return <p style={{ color: "#666", fontSize: 13 }}>No pending admin invites.</p>;

  const now = Date.now();

  return (
    <table style={S.table}>
      <thead>
        <tr>
          <th style={S.th}>Gym</th>
          <th style={S.th}>Email</th>
          <th style={S.th}>Expires</th>
          <th style={S.th}></th>
        </tr>
      </thead>
      <tbody>
        {invites.map((inv) => {
          const expired = inv.expiresAt < now;
          return (
            <tr key={inv._id}>
              <td style={S.td}>{inv.gymName}</td>
              <td style={S.td}>{inv.email}</td>
              <td style={S.td}>
                {new Date(inv.expiresAt).toLocaleDateString()}
                {expired && <span style={S.expiredBadge}>expired</span>}
              </td>
              <td style={S.td}>
                {resendSuccess === inv._id ? (
                  <span style={{ color: "#34C759", fontSize: 12 }}>Sent!</span>
                ) : (
                  <button
                    style={S.btnSmall}
                    disabled={resending === inv._id}
                    onClick={() => handleResend(inv.gymId, inv.email, inv._id)}
                  >
                    {resending === inv._id ? "Sending…" : "Resend"}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function SuperAdmin() {
  const gyms = useQuery(api.gyms.list);
  const superAdminCreateGym = useMutation(api.invites.superAdminCreateGym);

  const [form, setForm] = useState({
    gymName: "",
    tagline: "Powered by NorthernGlow",
    primaryColor: "#1BBFBF",
    timezone: "America/New_York",
    adminEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await superAdminCreateGym({
        gymName: form.gymName,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
        timezone: form.timezone,
        adminEmail: form.adminEmail,
      });
      setSuccess(`Gym "${form.gymName}" created. Invite sent to ${form.adminEmail}.`);
      setForm({ gymName: "", tagline: "Powered by NorthernGlow", primaryColor: "#1BBFBF", timezone: "America/New_York", adminEmail: "" });
    } catch (err: any) {
      setError(err.message ?? "Failed to create gym");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={S.h1}>Super Admin</h1>
      <p style={S.sub}>Create and manage all gyms on the NorthernGlow platform.</p>

      <div style={S.grid}>
        {/* Left column */}
        <div>
          {/* Create gym form */}
          <div style={S.card}>
            <div style={S.cardTitle}>Create gym for a client</div>
            <form onSubmit={handleSubmit}>
              <div style={S.group}>
                <label style={S.label}>Gym name</label>
                <input style={S.input} value={form.gymName} onChange={set("gymName")} placeholder="CrossFit Springfield" required />
              </div>
              <div style={S.group}>
                <label style={S.label}>Tagline</label>
                <input style={S.input} value={form.tagline} onChange={set("tagline")} placeholder="Powered by NorthernGlow" />
              </div>
              <div style={S.group}>
                <label style={S.label}>Primary colour</label>
                <input style={S.input} value={form.primaryColor} onChange={set("primaryColor")} placeholder="#1BBFBF" />
              </div>
              <div style={S.group}>
                <label style={S.label}>Timezone</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.timezone} onChange={set("timezone")}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div style={S.group}>
                <label style={S.label}>Gym admin email (they'll receive an invite)</label>
                <input style={S.input} type="email" value={form.adminEmail} onChange={set("adminEmail")} placeholder="owner@theirgym.com" required />
              </div>
              <button style={S.btn} type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create gym & send invite"}
              </button>
              {success && <p style={S.success}>{success}</p>}
              {error && <p style={S.error}>{error}</p>}
            </form>
          </div>

          {/* Pending invites */}
          <div style={S.card}>
            <div style={S.cardTitle}>Pending admin invites</div>
            <PendingInvites />
          </div>
        </div>

        {/* Right column — gyms list */}
        <div style={S.card}>
          <div style={S.cardTitle}>All gyms ({gyms?.length ?? "…"})</div>
          {gyms === undefined ? (
            <p style={{ color: "#666", fontSize: 13 }}>Loading…</p>
          ) : gyms.length === 0 ? (
            <p style={{ color: "#666", fontSize: 13 }}>No gyms yet.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Timezone</th>
                  <th style={S.th}>Colour</th>
                </tr>
              </thead>
              <tbody>
                {gyms.map((gym) => (
                  <tr key={gym._id}>
                    <td style={S.td}>{gym.name}</td>
                    <td style={S.td}>{gym.timezone}</td>
                    <td style={S.td}>
                      <span style={S.dot(gym.primaryColor)} />
                      {gym.primaryColor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
