import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

const S = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" } as const,
  card: { background: "#141414", border: "1px solid #252525", borderRadius: 12, padding: 40, width: 420 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  sub: { color: "#888", fontSize: 14, marginBottom: 28 },
  gymBox: {
    background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: 8,
    padding: "16px 20px", marginBottom: 24,
  },
  gymName: { fontSize: 20, fontWeight: 700, color: "#fff" },
  gymLabel: { fontSize: 13, color: "#666", marginTop: 4 },
  btn: {
    width: "100%", padding: "12px 0", borderRadius: 8, fontWeight: 600, fontSize: 14,
    cursor: "pointer", border: "none", background: "#1BBFBF", color: "#000",
  },
  error: { color: "#ff453a", fontSize: 13, marginTop: 12 },
  loading: { color: "#666", fontSize: 14, textAlign: "center" as const },
  noInvite: { color: "#888", fontSize: 14, lineHeight: 1.6 },
};

export default function AcceptInvite() {
  const navigate = useNavigate();
  const invite = useQuery(api.invites.getMyAdminInvite);
  const acceptAdminInvite = useMutation(api.invites.acceptAdminInvite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      await acceptAdminInvite({});
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  if (invite === undefined) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={S.loading}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h1 style={S.h1}>No invite found</h1>
          <p style={S.noInvite}>
            We couldn't find a pending invite for your email address. Make sure
            you're signed in with the same email the invite was sent to, or
            contact NorthernGlow to resend it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h1}>You've been invited!</h1>
        <p style={S.sub}>You've been set up as the admin for this gym.</p>

        <div style={S.gymBox}>
          <div style={S.gymName}>{invite.gymName}</div>
          <div style={S.gymLabel}>
            Invited {new Date(invite._creationTime).toLocaleDateString()} · Expires {new Date(invite.expiresAt).toLocaleDateString()}
          </div>
        </div>

        <button style={S.btn} onClick={handleAccept} disabled={loading}>
          {loading ? "Accepting…" : "Accept & go to dashboard"}
        </button>
        {error && <p style={S.error}>{error}</p>}
      </div>
    </div>
  );
}
