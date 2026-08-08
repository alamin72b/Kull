import { ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      <AppHeader />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>YOUR PERSONAL WORKSPACE</p>

          <h1>Small tools for a more organized day.</h1>

          <p className={styles.intro}>
            Kull starts simple. Choose a tool below and keep the things
            that matter to you in one place.
          </p>
        </section>

        <section
          aria-labelledby="tools-heading"
          className={styles.tools}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionLabel}>TOOLS</p>
              <h2 id="tools-heading">What do you want to open?</h2>
            </div>

            <span>1 available</span>
          </div>

          <Link className={styles.toolCard} href="/activities">
            <span className={styles.toolIcon} aria-hidden="true">
              <ClipboardList size={28} strokeWidth={1.8} />
            </span>

            <span className={styles.toolContent}>
              <strong>Activity</strong>
              <span>Record what you did during the day.</span>
            </span>

            <ArrowRight
              className={styles.arrow}
              size={22}
              aria-hidden="true"
            />
          </Link>
        </section>
      </main>
    </>
  );
}