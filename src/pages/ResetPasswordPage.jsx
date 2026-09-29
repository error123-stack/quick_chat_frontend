import { useContext, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext";

const ResetPasswordPage = () => {
  const { axios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = params.get("email") || "";
  const initialToken = params.get("token") || "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!email || !token) return false;
    if (!password || password.length < 6) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [email, token, password, confirmPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        email,
        token,
        password,
      });
      if (data?.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div className="relative z-10 w-[min(95vw,420px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Set a new password for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            name="email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            className="input-field"
          />
          <input
            name="resetToken"
            aria-label="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="text"
            required
            placeholder="Reset token"
            className="input-field"
          />
          <input
            name="newPassword"
            aria-label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="New password (min 6 chars)"
            className="input-field"
          />
          <input
            name="confirmPassword"
            aria-label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            className="input-field"
          />

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[var(--text-secondary)] flex gap-3">
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Back to login
          </Link>
          <span className="opacity-60">•</span>
          <Link
            to="/forgot-password"
            className="text-[var(--accent)] hover:underline"
          >
            Resend link
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
