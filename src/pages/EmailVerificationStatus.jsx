const EmailVerificationStatus = ({ success, onContinue }) => (
  <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] via-[#0d1318] to-[#0a1628]" />
    <div
      className={`relative z-10 w-[min(95vw,460px)] rounded-[var(--radius-2xl)] border ${success ? "border-emerald-500/30" : "border-[var(--border-subtle)]"} bg-[var(--bg-panel)]/95 backdrop-blur-xl p-7 sm:p-8 shadow-[var(--shadow-card)] text-center`}
    >
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${success ? "bg-emerald-500/15 text-emerald-400 text-2xl" : "bg-[var(--accent)]/15 text-[var(--accent)] text-2xl animate-pulse"}`}
      >
        {success ? "✓" : "···"}
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        {success ? "Email verified" : "Verifying your email..."}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {success
          ? "Your email has been verified successfully. You are now signed in."
          : "Please wait a moment while we verify your email address."}
      </p>
      {success && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full py-3 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
        >
          Go to chat
        </button>
      )}
    </div>
  </div>
);

export default EmailVerificationStatus;
