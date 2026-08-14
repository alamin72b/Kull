import Link from "next/link";
import styles from "./home.module.css";

const tools = [
  {
    name: "Activity",
    description:
      "Record your daily activities with their start time, end time, date, and notes.",
    href: "/activities",
    label: "Daily log",
  },
  {
    name: "Debug Notes",
    description:
      "Store errors, screenshots, investigations, solutions, learnings, and searchable tags.",
    href: "/debug-notes",
    label: "Knowledge base",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Personal workspace</p>
        <h1>Kull</h1>
        <p>
          A growing collection of small, focused tools for recording
          your work and building your personal knowledge base.
        </p>
      </header>

      <section className={styles.toolSection}>
        <div className={styles.sectionHeading}>
          <h2>Tools</h2>
          <span>{tools.length} available</span>
        </div>

        <div className={styles.toolGrid}>
          {tools.map((tool, index) => (
            <Link
              className={styles.toolCard}
              href={tool.href}
              key={tool.name}
            >
              <div className={styles.toolNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>

              <span className={styles.toolLabel}>
                {tool.label}
              </span>

              <h3>{tool.name}</h3>
              <p>{tool.description}</p>

              <span className={styles.openTool}>
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
