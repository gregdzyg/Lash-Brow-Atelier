import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import PublicAvailabilityCalendar from "../components/public/PublicAvailabilityCalendar";
import { usePrivacyPreferences } from "../privacy/usePrivacyPreferences";

const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.2928733624517!2d22.90202597675496!3d51.63579887184077!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x4721bc15ce7fdd8d%3A0x1a9d3eec4b4634c!2sKo%C5%9Bcielna%2026%2C%2021-200%20Parczew!5e0!3m2!1spl!2spl!4v1726500000000!5m2!1spl!2spl";
const GOOGLE_MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=Ko%C5%9Bcielna%2026%2C%2021-200%20Parczew";

const socialLinks = [
  {
    href: "https://www.instagram.com/paulina_tarnowska_?igsh=MWNreGprdDRzN3mbA==",
    label: "Instagram",
    icon: <FaInstagram aria-hidden="true" size={16} />,
  },
  {
    href: "https://facebook.com/share/1CXJKitwvD/",
    label: "Facebook",
    icon: <FaFacebookF aria-hidden="true" size={16} />,
  },
  {
    href: "https://www.tiktok.com/@lashbrowatelierpaula",
    label: "TikTok",
    icon: <FaTiktok aria-hidden="true" size={16} />,
  },
];

const contactLinkClassName = `
  group flex items-start gap-4 rounded-2xl border border-[var(--gold)]/15
  bg-white/[0.025] p-4 text-white/70 transition duration-300
  hover:border-[var(--gold)]/40 hover:bg-white/[0.055] hover:text-white
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
`;

const Contact = () => {
  const {
    isExternalContentAllowed,
    acceptExternalContent,
  } = usePrivacyPreferences();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mb-12 flex items-center justify-center gap-3 sm:mb-16">
        <span className="h-px w-10 bg-[var(--gold)]/70" />
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Kontakt
        </h1>
        <span className="h-px w-10 bg-[var(--gold)]/70" />
      </div>

      <div className="grid overflow-hidden rounded-[2rem] border border-[var(--gold)]/25 bg-white/[0.025] md:grid-cols-2">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <h2 className="mb-7 text-2xl font-semibold text-[var(--gold)] sm:text-3xl">
            Dane kontaktowe
          </h2>

          <div className="space-y-3">
            <div className={contactLinkClassName}>
              <MapPin aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-[var(--gold)]" />
              <span className="text-sm leading-6 sm:text-base">
                ul. Kościelna 26 – 1 piętro, 21-200 Parczew
              </span>
            </div>
            <a href="tel:+48534345432" className={contactLinkClassName}>
              <Phone aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-[var(--gold)]" />
              <span className="text-sm leading-6 sm:text-base">+48 534 345 432</span>
            </a>
            <a href="mailto:kontakt@atelierbypaula.pl" className={contactLinkClassName}>
              <Mail aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-[var(--gold)]" />
              <span className="break-all text-sm leading-6 sm:text-base">
                kontakt@atelierbypaula.pl
              </span>
            </a>
          </div>

          <div className="mt-8 border-t border-[var(--gold)]/15 pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Social media
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-[var(--gold)]/25 px-4 py-2.5 text-sm text-white/65 transition duration-300 hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-80 overflow-hidden border-t border-[var(--gold)]/20 md:border-l md:border-t-0">
          {isExternalContentAllowed ? (
            <iframe
              title="Lokalizacja Lash&Brow Atelier"
              src={GOOGLE_MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ minHeight: "420px", border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-br from-white/[0.055] to-black/20 p-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--gold)]/30 bg-black/20 text-[var(--gold)]">
                <MapPin aria-hidden="true" size={27} />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-white">
                Mapa Google jest wyłączona
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">
                Możesz wczytać interaktywną mapę po zaakceptowaniu treści
                zewnętrznych albo otworzyć lokalizację bezpośrednio w Google Maps.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={acceptExternalContent}
                  className="cursor-pointer rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                >
                  Wczytaj mapę Google
                </button>
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Otwórz w Google Maps
                  <ExternalLink aria-hidden="true" size={15} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <PublicAvailabilityCalendar />
    </section>
  );
};

export default Contact;
