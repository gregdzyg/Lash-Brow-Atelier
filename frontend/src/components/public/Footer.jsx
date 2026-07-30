import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";
import { usePrivacyPreferences } from "../../privacy/usePrivacyPreferences";
import PublicWorkingHoursSummary from "./PublicWorkingHoursSummary";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { openPrivacySettings } = usePrivacyPreferences();

  return (
    <footer className="relative z-10 mt-10 border-t border-[var(--gold)]/15 px-5 py-12 text-sm text-white sm:px-8 lg:mt-16 lg:px-12 lg:py-16">
      {/* Główna siatka */}
      <div className="mx-auto grid max-w-2xl gap-10 text-center sm:grid-cols-2 sm:gap-12">
        {/* Kontakt */}
        <div className="space-y-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">Kontakt</p>
          <p className="text-sm text-white/65">📍 ul. Kościelna 26, 21-200 Parczew</p>
          <p className="text-sm text-white/65">📞 +48 534 345 432</p>
          <p className="text-sm text-white/65">📧 kontakt@atelierbypaula.pl</p>
        </div>
        {/* Dodatkowe linki */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">Informacje</p>
          <ul className="space-y-2 text-white/65">
            <li>
              <Link to="/offer" className="text-sm transition-colors hover:text-[var(--gold)]">
                Oferta
              </Link>
            </li>
            <PublicWorkingHoursSummary />
            <li>
              <Link to="/regulamin" className="text-sm transition-colors hover:text-[var(--gold)]">
                Regulamin
              </Link>
            </li>
            <li>
              <Link to="/polityka-prywatnosci" className="text-sm transition-colors hover:text-[var(--gold)]">
                Polityka prywatności
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openPrivacySettings}
                className="cursor-pointer text-sm transition-colors hover:text-[var(--gold)]"
              >
                Ustawienia prywatności
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-auto my-8 h-px max-w-4xl bg-gradient-to-r from-transparent via-[var(--gold)]/35 to-transparent" />

      {/* Ikony social media */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-white/60">
        <a href="https://www.instagram.com/paulina_tarnowska_?igsh=MWNreGprdDRzN3mbA==" aria-label="Instagram" className="flex items-center gap-2 transition-colors hover:text-[var(--gold)]">
          <FaInstagram size={18} />
          <span className="text-xs">Instagram</span>
        </a>
        <a href="https://facebook.com/share/1CXJKitwvD/" aria-label="Facebook" className="flex items-center gap-2 transition-colors hover:text-[var(--gold)]">
          <FaFacebookF size={18} />
          <span className="text-xs">Facebook</span>
        </a>
        <a href="https://www.tiktok.com/@lashbrowatelierpaula" aria-label="TikTok" className="flex items-center gap-2 transition-colors hover:text-[var(--gold)]">
          <FaTiktok size={18} />
          <span className="text-xs">TikTok</span>
        </a>
      </div>
      {/* Branding */}
      <div className="mt-6 text-center text-white/40">
        <Link
          to="/admin"
          aria-label="Przejdź do panelu administracyjnego"
          className="group inline-flex items-baseline rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <span className="font-semibold tracking-wide text-[var(--rose)] transition-colors group-hover:text-[var(--gold)]">
            Lash&amp;Brow Atelier&nbsp;
          </span>
          <span className="text-xs italic text-[var(--rose)]/80 transition-colors group-hover:text-[var(--gold)]/80">
            by Paulina Tarnowska
          </span>
        </Link>
        <span className="ml-1 text-xs">© {currentYear}</span>
      </div>
    </footer>
  );
};

export default Footer;
