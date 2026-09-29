import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import EmailVerificationStatus from "./EmailVerificationStatus";

const OTP_FIELD_IDS = [
  "mv-otp-0",
  "mv-otp-1",
  "mv-otp-2",
  "mv-otp-3",
  "mv-otp-4",
  "mv-otp-5",
];

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authUser, verifyEmail, resendVerificationEmail } =
    useContext(AuthContext);

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [useOtp, setUseOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = useCallback(
    async (payload) => {
      setStatus("verifying");
      setErrorMessage("");
      const result = await verifyEmail(payload);
      if (result?.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          result?.message || "Verification failed. Please try again.",
        );
        setShowManualForm(true);
      }
    },
    [verifyEmail],
  );

  useEffect(() => {
    if (authUser) {
      navigate("/", { replace: true });
      return;
    }
    if (token && emailFromUrl) {
      handleVerify({ email: emailFromUrl, token });
    } else {
      setShowManualForm(true);
    }
  }, [token, emailFromUrl, authUser, handleVerify, navigate]);

  const handleResend = async () => {
    const targetEmail = manualEmail || emailFromUrl;
    if (!targetEmail) return;
    setIsResending(true);
    setResendMessage("");
    try {
      const result = await resendVerificationEmail(targetEmail);
      if (result?.success) {
        setResendMessage(
          "If an account exists for that email, a new verification email was sent.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (useOtp) {
      const otp = otpInputs.join("");
      if (otp.length !== 6 || !manualEmail) return;
      setIsSubmitting(true);
      try {
        await handleVerify({ email: manualEmail, otp });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!manualEmail || !manualToken) return;
      setIsSubmitting(true);
      try {
        await handleVerify({ email: manualEmail, token: manualToken });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otpInputs];
    next[index] = value;
    setOtpInputs(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`mv-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`mv-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  if (status === "success") {
    return (
      <EmailVerificationStatus
        success
        onContinue={() => navigate("/", { replace: true })}
      />
    );
  }

  if (status === "verifying" && !showManualForm) {
    return <EmailVerificationStatus success={false} />;
  }

  const otpComplete = otpInputs.every((d) => d !== "");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
      <div className="relative z-10 w-[min(95vw,460px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {showManualForm
            ? "Enter your email and verification code or token to confirm your account."
            : "We couldn't verify your link automatically. You can verify manually below."}
        </p>

        {status === "error" && errorMessage && (
          <div className="mt-4 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleManualSubmit}
          className="mt-6 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="verification-email"
              className="block text-sm mb-1.5 text-[var(--text-secondary)]"
            >
              Email address
            </label>
            <input
              id="verification-email"
              name="email"
              value={manualEmail || emailFromUrl || ""}
              onChange={(e) => setManualEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setUseOtp(false);
                setOtpInputs(["", "", "", "", "", ""]);
              }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                !useOtp
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Use link token
            </button>
            <button
              type="button"
              onClick={() => {
                setUseOtp(true);
                setManualToken("");
              }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                useOtp
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Use 6-digit code
            </button>
          </div>

          {!useOtp ? (
            <div>
              <label
                htmlFor="verification-token"
                className="block text-sm mb-1.5 text-[var(--text-secondary)]"
              >
                Verification token (from the URL in your email)
              </label>
              <input
                id="verification-token"
                name="verificationToken"
                value={manualToken || token || ""}
                onChange={(e) => setManualToken(e.target.value)}
                type="text"
                required
                placeholder="Paste the long token here..."
                className="input-field font-mono text-xs"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor={OTP_FIELD_IDS[0]}
                className="block text-sm mb-2 text-[var(--text-secondary)]"
              >
                6-digit verification code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3">
                {OTP_FIELD_IDS.map((id, index) => (
                  <input
                    key={id}
                    id={id}
                    aria-label={`Verification code digit ${index + 1}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={otpInputs[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-full aspect-square text-center text-xl font-semibold rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !manualEmail ||
              (!useOtp ? !manualToken : !otpComplete)
            }
            className="mt-1 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !(manualEmail || emailFromUrl)}
            className="text-sm text-[var(--accent)] hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending ? "Sending new code..." : "Resend verification email"}
          </button>
          {resendMessage && (
            <p className="text-xs text-emerald-400/90">{resendMessage}</p>
          )}
          <Link
            to="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
