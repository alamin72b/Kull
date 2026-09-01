import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Kull",
  description: "Terms governing use of the Kull application.",
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.content}>
        <Link className={styles.backLink} href="/">
          ← Back to Kull
        </Link>

        <p className={styles.eyebrow}>Kull legal</p>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: September 1, 2026</p>
        <p className={styles.intro}>
          These Terms of Service govern your use of Kull. By using Kull, you
          agree to these Terms and to the Privacy Policy.
        </p>

        <article className={styles.document}>
          <h2>1. About Kull</h2>
          <p>
            Kull is a personal workspace operated by Md Al Amin Bhuiyan. It
            provides tools for organizing activities, notes, medicine records,
            and user-requested Google Drive uploads.
          </p>

          <h2>2. Eligibility and account security</h2>
          <p>
            You must be legally able to use the service in your location. You
            are responsible for keeping access to your Google account and Kull
            session secure and for all activity performed through your account.
            Notify us promptly if you believe your account has been used
            without permission.
          </p>

          <h2>3. Google Drive uploads</h2>
          <p>
            When you connect Google Drive, you authorize Kull to perform the
            limited Drive actions shown in Google&apos;s consent screen. You are
            responsible for selecting the correct account, folder path, and
            file before confirming an upload.
          </p>
          <p>
            Kull may create missing folders in the confirmed My Drive path and
            upload the selected file. You must have the right to upload the
            file and use the destination folder. Google Drive remains a
            separate service governed by Google&apos;s terms.
          </p>

          <h2>4. Acceptable use</h2>
          <p>You must not use Kull to:</p>
          <ul>
            <li>break the law or violate another person&apos;s rights;</li>
            <li>upload content that you do not have permission to use;</li>
            <li>introduce malware, malicious code, or harmful content;</li>
            <li>attempt to bypass authentication, security, or usage limits; or</li>
            <li>interfere with the availability or operation of the service.</li>
          </ul>

          <h2>5. Your content</h2>
          <p>
            You retain ownership of the content you submit to Kull. You grant
            Kull the limited permission needed to store, process, display, and
            transmit that content to provide the feature you request. You are
            responsible for the accuracy, legality, and backup of your content.
          </p>

          <h2>6. Third-party services</h2>
          <p>
            Kull may depend on services such as Google, hosting providers, and
            database providers. Those services may have their own terms,
            privacy policies, availability limits, and security practices. Kull
            is not responsible for independent third-party services.
          </p>

          <h2>7. Availability and changes</h2>
          <p>
            We may modify, suspend, or discontinue parts of Kull when needed
            for maintenance, security, legal compliance, or product changes.
            We do not guarantee that Kull will always be uninterrupted,
            error-free, or available in every location.
          </p>

          <h2>8. Disclaimer</h2>
          <p>
            Kull is provided on an “as available” and “as is” basis to the
            extent permitted by law. Kull is an organizational tool and is not
            medical, legal, financial, or professional advice. You are
            responsible for decisions made using information stored in Kull.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Md Al Amin
            Bhuiyan will not be liable for indirect, incidental, special,
            consequential, or loss-of-data damages arising from your use of or
            inability to use Kull. Nothing in these Terms excludes liability
            that cannot legally be excluded.
          </p>

          <h2>10. Suspension and termination</h2>
          <p>
            We may suspend or terminate access when reasonably necessary to
            protect Kull, its users, third parties, or comply with law. You may
            stop using Kull at any time and may request deletion under the
            Privacy Policy.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These Terms are governed by the laws of Bangladesh, without regard
            to conflict-of-law principles. Subject to applicable law, disputes
            will be handled by the courts with appropriate jurisdiction in
            Bangladesh.
          </p>

          <h2>12. Changes to these Terms</h2>
          <p>
            We may update these Terms as Kull changes. The updated date at the
            top of this page identifies the current version. Continued use of
            Kull after an update means you accept the revised Terms.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions about these Terms can be sent to
            <a href="mailto:alamin72b@gmail.com"> alamin72b@gmail.com</a>.
          </p>
        </article>
      </main>

      <footer className={styles.footer}>
        <span>© Md Al Amin Bhuiyan · Kull</span>
        <nav className={styles.footerLinks} aria-label="Legal links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </div>
  );
}
