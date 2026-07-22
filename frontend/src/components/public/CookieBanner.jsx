import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "atelier_cookie_consent_v1";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (saved) return;

    // delay — bardziej premium
    const t = window.setTimeout(() => setVisible(true), 1100);
    return () => window.clearTimeout(t);
  }, []);

  const closeWithAnim = () => {
    setClosing(true);
    window.setTimeout(() => setVisible(false), 520);
  };

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    closeWithAnim();
  };

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-x-0 bottom-0 z-[9999] flex justify-center p-4 sm:justify-end sm:p-6",
        closing ? "cookie-slide-down-slow" : "cookie-slide-up-slow",
      ].join(" ")}
      role="dialog"
      aria-live="polite"
      aria-label="Informacja o plikach cookies"
    >
      {/* ✅ WĄSKI, PIONOWY TOAST */}
      <div
        className="
          w-full max-w-[360px] rounded-3xl border border-[var(--gold)]/35
          bg-[#111111]/95 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl
        "
      >
        <div className="p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
            Pliki cookies
          </p>

          {/* ✅ DŁUŻSZY TEKST (jak wcześniej) */}
          <p className="mt-3 text-xs leading-relaxed text-white/65 sm:text-sm">
            Używamy plików cookies, aby zapewnić prawidłowe działanie strony oraz
            wyświetlanie treści zewnętrznych, takich jak mapa Google.
            Kontynuując, akceptujesz ich użycie.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
            <Link
              to="/polityka-prywatnosci"
              className="text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-[var(--gold)]"
            >
              Polityka prywatności
            </Link>
            <span className="text-white/25">•</span>
            <Link
              to="/regulamin"
              className="text-white/55 underline decoration-white/25 underline-offset-4 transition-colors hover:text-[var(--gold)]"
            >
              Regulamin
            </Link>
          </div>

          {/* ✅ PRZYCISKI KOMPAKTOWE (nie full width) */}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              onClick={accept}
              className="
                cursor-pointer rounded-full border border-[var(--gold)] bg-[var(--gold)]
                px-4 py-2 text-xs font-semibold text-black transition-colors
                hover:bg-transparent hover:text-[var(--gold)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
              "
            >
              Akceptuję
            </button>

            <button
              onClick={closeWithAnim}
              className="
                cursor-pointer rounded-full border border-white/15
                px-4 py-2 text-xs text-white/60 transition-colors
                hover:border-white/30 hover:text-white
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
              "
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
