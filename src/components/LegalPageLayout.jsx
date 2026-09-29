import { Link } from "react-router-dom";

const LegalPageLayout = ({ title, children }) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-app)] text-[var(--text-primary)]">
    <div className="max-w-2xl w-full space-y-6 rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Link
          to="/login"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Back to login
        </Link>
      </div>
      {children}
    </div>
  </div>
);

export default LegalPageLayout;
