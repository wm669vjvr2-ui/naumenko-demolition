import Link from "next/link";
import styles from "./legal.module.css";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
};

export default function LegalShell({ eyebrow, title, updated = "17 августа 2026 года", children }: LegalShellProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">Демонтаж</Link>
        <nav aria-label="Юридические документы">
          <Link href="/legal">Реквизиты</Link>
          <Link href="/privacy">Политика</Link>
          <Link href="/consent">Согласие</Link>
          <Link href="/terms">Условия</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
      </header>
      <article className={styles.document}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.updated}>Редакция от {updated}</p>
        <div className={styles.content}>{children}</div>
      </article>
      <footer className={styles.footer}>
        <Link href="/">Вернуться на сайт</Link>
        <a href="tel:+79853584978">+7 985 358-49-78</a>
      </footer>
    </main>
  );
}
