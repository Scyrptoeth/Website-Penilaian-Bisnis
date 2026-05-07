import { MessageCircle } from "lucide-react";

const supportPhoneLabel = "0822-9411-6001 (Goradok Pande Raja Sinabutar)";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Informasi situs">
      <p className="site-footer-brand">Penilaian Bisnis II: Workbench Digital Valuasi Bisnis AAM, EEM, dan DCF Indonesia</p>
      <p>Dibangun untuk perhitungan yang terlacak, asumsi yang bisa diaudit, dan laporan yang siap direviu.</p>
      <nav className="site-footer-links" aria-label="Tautan pendukung">
        <a href="https://persiapantubel.com/" target="_blank" rel="noreferrer">
          <GithubLogo />
          <span>GitHub</span>
        </a>
        <a href="https://wa.me/6282294116001" target="_blank" rel="noreferrer">
          <MessageCircle className="site-footer-whatsapp-icon" size={14} aria-hidden="true" />
          <span>Saran & Kendala: {supportPhoneLabel}</span>
        </a>
      </nav>
      <p className="site-footer-copyright">&copy; 2026 Penilaian Bisnis II</p>
    </footer>
  );
}

function GithubLogo() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18A11.01 11.01 0 0 1 12 6.2c.98 0 1.95.13 2.87.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.13v3.03c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
