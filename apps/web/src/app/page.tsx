import {
  ArrowUpRight,
  BookOpenText,
  Clock3,
  Pill,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import styles from "./home.module.css";

interface Tool {
  name: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
  tone: "sage" | "violet";
}

const tools: Tool[] = [
  {
    name: "Activity",
    description:
      "Record your daily activities with their start time, end time, date, and notes.",
    href: "/activities",
    label: "Daily log",
    icon: Clock3,
    tone: "sage",
  },
  {
    name: "Debug Notes",
    description:
      "Store errors, screenshots, investigations, solutions, learnings, and searchable tags.",
    href: "/debug-notes",
    label: "Knowledge base",
    icon: BookOpenText,
    tone: "violet",
  },
  {
    name: "Medicine Tracker",
    description:
      "Store medicine purchases and compare the previous bought price for each generic medicine.",
    href: "/medicine-transactions",
    label: "Price history",
    icon: Pill,
    tone: "violet",
  },
];

const backendApiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "Not configured";

export default function HomePage() {
  return (
    <>
      <AppHeader />

      <main className={styles.main}>
        <section
          aria-labelledby="home-heading"
          className={styles.hero}
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Personal workspace</p>
            <h1 id="home-heading">
              Small tools.
              <span>One clear place.</span>
            </h1>
            <p className={styles.intro}>
              Keep everyday work organized without turning your
              workspace into another complicated system.
            </p>

            <p
              aria-label="Backend API URL"
              className={styles.backendApi}
            >
              <span>Backend API</span>
              <code>{backendApiUrl}</code>
            </p>
          </div>

          <aside
            aria-label={`${tools.length} tools available in Kull`}
            className={styles.workspacePanel}
          >
            <div className={styles.panelHeader}>
              <span>Workspace</span>
              <span className={styles.panelBadge}>Personal</span>
            </div>

            <div className={styles.panelCount}>
              <strong>{String(tools.length).padStart(2, "0")}</strong>
              <span>tools ready</span>
            </div>

            <p>
              A growing library where every tool stays focused,
              easy to find, and quick to open.
            </p>
          </aside>
        </section>

        <section
          aria-labelledby="tools-heading"
          className={styles.toolSection}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionLabel}>Tool library</p>
              <h2 id="tools-heading">Choose what you need</h2>
            </div>

            <p className={styles.sectionDescription}>
              Focused spaces for the work worth keeping.
            </p>
          </div>

          <div className={styles.toolGrid}>
            {tools.map((tool, index) => {
              const Icon = tool.icon;

              return (
                <Link
                  className={`${styles.toolCard} ${styles[tool.tone]}`}
                  href={tool.href}
                  key={tool.name}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.toolNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.toolIcon} aria-hidden="true">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                  </div>

                  <div className={styles.cardCopy}>
                    <span className={styles.toolLabel}>
                      {tool.label}
                    </span>

                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span>Open tool</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.9}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
