import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext";

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
};

const ForgotPasswordPage = () => {
  const { axios } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState("info");
  const [emailSent, setEmailSent] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [mailProvider, setMailProvider] = useState("");
  const [recipientHint, setRecipientHint] = useState("");
  const [mailError, setMailError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResetUrl("");
    setResponseMessage("");
    setResponseType("info");
    setEmailSent(false);
    setUsedFallback(false);
    setMailProvider("");
    setRecipientHint("");
    setMailError("");
    setCopied(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearResult();
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      if (data?.success) {
        toast.success(data.message);
        setResponseType("success");
        setResponseMessage(data.message);
        setEmailSent(Boolean(data.emailSent));
        setUsedFallback(Boolean(data.usedFallback));
        setMailProvider(data.mailProvider || "");
        setRecipientHint(data.recipientHint || "");
        setMailError(data.mailError || "");
        if (data.resetUrl) setResetUrl(data.resetUrl);
      } else {
        const message = data?.message || "Something went wrong";
        toast.error(message);
        setResponseType("error");
        setResponseMessage(message);
        setEmailSent(false);
        setMailProvider(data.mailProvider || "");
        setMailError(data.mailError || "");
        if (data.resetUrl) setResetUrl(data.resetUrl);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(message);
      setResponseType("error");
      setResponseMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resetUrl) return;
    const ok = await copyToClipboard(resetUrl);
    if (ok) {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy link");
    }
  };

  const bannerClass =
    responseType === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-200"
      : usedFallback
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div className="relative z-10 w-[min(95vw,460px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Forgot password
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter your email and we’ll send you a reset link.
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

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {responseMessage && (
          <div
            className={`mt-4 rounded-[var(--radius-md)] border p-3 text-sm ${bannerClass}`}
          >
            <p>{responseMessage}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] opacity-80">
              {emailSent && recipientHint && <span>{recipientHint}</span>}
              {emailSent && mailProvider && (
                <span>Provider: {mailProvider}</span>
              )}
              {!emailSent && mailProvider && mailProvider !== "none" && (
                <span>
                  Status: {usedFallback ? "Used fallback link" : "Not sent"}
                  {mailProvider ? ` (${mailProvider})` : ""}
                </span>
              )}
              {usedFallback && mailError && (
                <span className="text-amber-300/90 block w-full">
                  Reason: {mailError}
                </span>
              )}
              {responseType === "error" && mailError && (
                <span className="text-red-300/90 block w-full">
                  Detail: {mailError}
                </span>
              )}
            </div>
            {emailSent && (
              <p className="mt-2 text-[0.8rem] opacity-80">
                💡 If the email doesn't arrive within 2–3 minutes, please check
                your <strong>Spam / Junk / Promotions</strong> folder and mark
                messages from the sender as <em>Not spam</em>. You can also add
                the sender address to your contacts to ensure delivery.
              </p>
            )}
          </div>
        )}

        {resetUrl && (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3 space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              {usedFallback
                ? "Direct reset link (email delivery was skipped or failed):"
                : "Reset link preview:"}
            </p>
            <div className="flex gap-2">
              <a
                className="flex-1 text-sm text-[var(--accent)] hover:underline break-all truncate"
                href={resetUrl}
                target="_blank"
                rel="noreferrer"
              >
                {resetUrl}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <a
              href={resetUrl}
              className="block w-full text-center mt-2 py-2 rounded-[var(--radius-md)] bg-[var(--accent)]/90 hover:bg-[var(--accent)] text-white text-sm font-medium transition-colors"
            >
              Open reset page
            </a>
          </div>
        )}

        {mailProvider && emailSent && mailProvider === "smtp" && (
          <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-1 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)]/40">
            <p className="font-medium text-[var(--text-primary)]">
              📬 Using Gmail SMTP?
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Emails sometimes go to Spam on the first send.</li>
              <li>
                For reliable delivery, consider using{" "}
                <a
                  className="text-[var(--accent)] hover:underline"
                  href="https://resend.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Resend
                </a>
                , SendGrid, Mailgun, or a verified domain + SMTP.
              </li>
            </ul>
          </div>
        )}

        <div className="mt-6 text-sm text-[var(--text-secondary)]">
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
