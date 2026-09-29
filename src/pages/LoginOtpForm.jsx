import { Link } from "react-router-dom";
import assets from "../assets/assets";

const OTP_FIELD_IDS = ["otp-0", "otp-1", "otp-2", "otp-3", "otp-4", "otp-5"];

const LoginOtpForm = ({
  effectiveEmail,
  otpInputs,
  isVerifying,
  onSubmit,
  onChange,
  onKeyDown,
  onBack,
  isResending,
  resendCooldown,
  onResend,
  pendingVerificationInfo,
  emailDelivered,
  providerLabel,
  showFallbackPanel,
  effectiveOtp,
  effectiveVerifyUrl,
  onAutoFill,
}) => {
  const otpComplete = otpInputs.every((digit) => digit !== "");

  return (
    <form
      onSubmit={onSubmit}
      className="relative z-10 w-[min(95vw,420px)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 flex flex-col gap-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Verify your email
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-colors"
          aria-label="Go back"
        >
          <img src={assets.arrow_icon} alt="" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--text-secondary)]">
          We sent a 6-digit verification code to:
        </p>
        <p className="text-sm font-medium text-[var(--text-primary)] break-all">
          {effectiveEmail}
        </p>
      </div>

      <div className="flex justify-between gap-2 sm:gap-3 mt-1">
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
            onChange={(event) => onChange(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            className="w-full aspect-square text-center text-xl font-semibold rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            required
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={!otpComplete || isVerifying}
        className="mt-1 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isVerifying ? "Verifying..." : "Verify & sign in"}
      </button>

      <div className="flex flex-col gap-3 items-center text-sm">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span>Didn't get the code?</span>
          <button
            type="button"
            onClick={onResend}
            disabled={isResending || resendCooldown > 0}
            className="font-medium text-[var(--accent)] hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
          </button>
        </div>

        {pendingVerificationInfo?.userFacingMailError && (
          <p className="text-xs text-amber-300/90 text-center leading-relaxed">
            {pendingVerificationInfo.userFacingMailError}
          </p>
        )}
        {!pendingVerificationInfo?.userFacingMailError &&
          pendingVerificationInfo?.mailError &&
          !emailDelivered && (
            <p className="text-xs text-amber-400/90 text-center">
              {pendingVerificationInfo.mailError}
            </p>
          )}

        {showFallbackPanel && (
          <div
            className={`w-full rounded-[var(--radius-md)] border bg-[var(--bg-input)]/60 p-3 text-xs text-[var(--text-secondary)] space-y-3 ${
              emailDelivered
                ? "border-dashed border-[var(--border-default)]"
                : "border-amber-500/40 bg-amber-500/5"
            }`}
          >
            <p
              className={`font-medium ${
                emailDelivered ? "text-[var(--text-primary)]" : "text-amber-300"
              }`}
            >
              {emailDelivered
                ? providerLabel
                  ? `Email sent via ${providerLabel}`
                  : "Email sent (check Spam folder)"
                : "Email not delivered; use direct verification below"}
            </p>
            {effectiveOtp && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--text-secondary)]">
                  Your 6-digit code:{" "}
                  <span className="font-mono text-[var(--accent)] text-sm font-semibold tracking-widest">
                    {effectiveOtp}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onAutoFill}
                  className="px-2.5 py-1 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                >
                  Auto-fill
                </button>
              </div>
            )}
            {effectiveVerifyUrl && (
              <div className="pt-1 border-t border-[var(--border-subtle)]">
                <p className="mb-1">Or click this link to verify directly:</p>
                <Link
                  to={effectiveVerifyUrl}
                  className="block text-[var(--accent)] hover:underline break-all text-[0.7rem] leading-tight"
                >
                  {effectiveVerifyUrl}
                </Link>
                <a
                  href={effectiveVerifyUrl}
                  className="mt-2 block w-full text-center py-2 rounded-[var(--radius-md)] bg-[var(--accent)]/90 hover:bg-[var(--accent)] text-white text-[0.75rem] font-medium transition-colors"
                >
                  Open verify page
                </a>
              </div>
            )}
            {pendingVerificationInfo?.mailError &&
              !pendingVerificationInfo?.userFacingMailError && (
                <p className="pt-2 border-t border-[var(--border-subtle)] text-[0.7rem] text-[var(--text-secondary)]">
                  Debug: {pendingVerificationInfo.mailError}
                </p>
              )}
          </div>
        )}
        {!showFallbackPanel && !emailDelivered && providerLabel && (
          <p className="text-xs text-[var(--text-secondary)]">
            Tried sending via {providerLabel}. If nothing arrives in 2 minutes,
            click Resend.
          </p>
        )}
      </div>

      {emailDelivered && (
        <p className="text-xs text-[var(--text-secondary)] text-center -mt-1">
          Check your Spam / Promotions folder and mark the message as Not Spam.
        </p>
      )}
    </form>
  );
};

export default LoginOtpForm;
