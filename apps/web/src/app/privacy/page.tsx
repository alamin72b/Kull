import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Kull",
  description: "How Kull collects, uses, stores, and protects user information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.content}>
        <Link className={styles.backLink} href="/">
          ← Back to Kull
        </Link>

        <p className={styles.eyebrow}>Kull legal</p>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: September 1, 2026</p>
        <p className={styles.intro}>
          This Privacy Policy explains how Md Al Amin Bhuiyan (&quot;Kull&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) handles information when you use the Kull
          application and its Google Drive upload feature.
        </p>

        <article className={styles.document}>
          <h2>1. Information we collect</h2>
          <p>
            We collect only the information needed to provide and protect Kull.
            Depending on the features you use, this may include:
          </p>
          <ul>
            <li>
              Google account information such as your Google account ID, email
              address, name, and profile picture when you sign in with Google.
            </li>
            <li>
              Google Drive authorization information, including the refresh
              token required to perform Drive actions you request. Kull does
              not ask for or store your Google password.
            </li>
            <li>
              File information required for an upload, such as the file name,
              MIME type, size, destination folder path, and the file content
              while the upload is processed.
            </li>
            <li>
              Information you enter into Kull tools, including activities,
              debug notes, medicine records, and related notes or metadata.
            </li>
            <li>
              Technical information needed to operate the service, such as
              session cookies, request information, and basic error logs.
            </li>
          </ul>

          <h2>2. How we use information</h2>
          <p>We use information to:</p>
          <ul>
            <li>authenticate you and maintain your Kull session;</li>
            <li>save and display the information you choose to store;</li>
            <li>verify Google Drive folder paths and upload files you request;</li>
            <li>protect the service, investigate errors, and prevent abuse; and</li>
            <li>respond to support and deletion requests.</li>
          </ul>

          <h2>3. Google user data and Drive access</h2>
          <p>
            Kull requests limited Google permissions to provide sign-in and
            the Drive upload feature. Kull uses the Google data only for the
            user-requested functionality described in the consent screen and
            does not sell Google user data or use it for advertising.
          </p>
          <p>
            Kull does not request full Google Drive access. You can revoke
            Kull&apos;s Google access at any time from your Google Account
            security settings or by contacting us.
          </p>

          <h2>4. Sharing and service providers</h2>
          <p>
            We do not sell your personal information. We may share information
            only when necessary to operate Kull, comply with law, protect the
            service, or respond to a valid legal request. Hosting, database,
            and infrastructure providers may process information on our behalf
            under their applicable terms and security controls.
          </p>

          <h2>5. Storage and retention</h2>
          <p>
            We retain account and feature data while your account is active or
            as needed to provide Kull, maintain security, resolve disputes, and
            comply with legal obligations. Uploaded files are sent to the
            Google Drive destination you confirm. Kull does not keep an
            additional permanent copy of an uploaded file beyond what is
            required to process the upload and operate the service.
          </p>

          <h2>6. Security</h2>
          <p>
            We use reasonable technical and organizational safeguards,
            including authenticated sessions, signed HTTP-only cookies, OAuth
            state validation, and restricted access to stored credentials. No
            online service can guarantee absolute security.
          </p>

          <h2>7. Your choices and deletion requests</h2>
          <p>
            You may stop using Kull, revoke Google access, or request deletion
            of your Kull account and associated data by emailing
            <a href="mailto:alamin72b@gmail.com"> alamin72b@gmail.com</a>.
            Please send the request from the email associated with your Kull
            account when possible. We may need to verify your identity before
            completing the request.
          </p>

          <h2>8. Children</h2>
          <p>
            Kull is not directed to children under 13, and we do not knowingly
            collect personal information from children under 13.
          </p>

          <h2>9. International users and changes</h2>
          <p>
            Kull may be used internationally. Information may be processed in
            countries where Kull or its service providers operate. We may
            update this policy when the service or legal requirements change.
            The updated date at the top of this page shows when the latest
            version took effect.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions, privacy concerns, and deletion requests can be sent to
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
