import LegalPageLayout from "../components/LegalPageLayout";

const TermsPage = () => {
  return (
    <LegalPageLayout title="Terms of use">
      <p className="text-[var(--text-secondary)] leading-relaxed">
        By creating an account or using QuickChat, you agree not to misuse the
        service, impersonate others, or share unlawful content. You must be at
        least 13 years old, and you are responsible for the content you send. We
        may suspend accounts that violate these terms.
      </p>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        QuickChat is provided on an “as is” basis. We do not guarantee uptime or
        uninterrupted service. We may update these terms from time to time.
        Continued use of QuickChat constitutes acceptance of any changes.
      </p>
    </LegalPageLayout>
  );
};

export default TermsPage;
