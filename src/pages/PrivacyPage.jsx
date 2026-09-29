import LegalPageLayout from "../components/LegalPageLayout";

const PrivacyPage = () => {
  return (
    <LegalPageLayout title="Privacy policy">
      <p className="text-[var(--text-secondary)] leading-relaxed">
        We store your account details and messages as required to operate the
        service. Media may be processed by third-party providers. We do not sell
        personal data. You can request profile updates or deletion from within
        the app.
      </p>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        Data is transmitted over the internet and cannot be guaranteed to be
        completely secure. Use QuickChat at your discretion and avoid sharing
        sensitive information.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
