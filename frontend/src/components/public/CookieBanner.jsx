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
        "fixed inset-x-0 bottom-0 z-[9999] p-4 flex justify-center",
        closing ? "cookie-slide-down-slow" : "cookie-slide-up-slow",
      ].join(" ")}
      role="dialog"
      aria-live="polite"
      aria-label="Informacja o plikach cookies"
    >
      {/* ✅ WĄSKI, PIONOWY TOAST */}
      <div
        className="
          w-[320px] sm:w-[340px]
          rounded-3xl border border-[var(--gold)]/45
          bg-black/90 backdrop-blur-md shadow-2xl
        "
      >
        <div className="p-5">
          <p className="text-[var(--gold)] text-sm font-semibold tracking-wide">
            Pliki cookies
          </p>

          {/* ✅ DŁUŻSZY TEKST (jak wcześniej) */}
          <p className="mt-2 text-white/75 text-xs sm:text-sm leading-relaxed">
            Używamy plików cookies, aby zapewnić prawidłowe działanie strony oraz
            obsłużyć rezerwacje i wyświetlanie treści zewnętrznych (np. Booksy, mapa).
            Kontynuując, akceptujesz ich użycie.
          </p>

          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
            <Link
              to="/polityka-prywatnosci"
              className="text-white/65 hover:text-white underline underline-offset-4"
            >
              Polityka prywatności
            </Link>
            <span className="text-white/25">•</span>
            <Link
              to="/regulamin"
              className="text-white/65 hover:text-white underline underline-offset-4"
            >
              Regulamin
            </Link>
          </div>

          {/* ✅ PRZYCISKI KOMPAKTOWE (nie full width) */}
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={accept}
              className="
                rounded-full border border-[var(--gold)]
                px-4 py-2 text-[11px] text-[var(--gold)]
                hover:bg-[var(--gold)] hover:text-black transition-colors
              "
            >
              Akceptuję
            </button>

            <button
              onClick={closeWithAnim}
              className="
                rounded-full border border-white/15
                px-4 py-2 text-[11px] text-white/60
                hover:text-white hover:border-white/30 transition-colors
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
