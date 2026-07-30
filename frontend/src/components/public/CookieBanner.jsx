import { Link } from "react-router-dom";
import { usePrivacyPreferences } from "../../privacy/usePrivacyPreferences";

const CookieBanner = () => {
  const {
    externalContentConsent,
    areSettingsOpen,
    acceptExternalContent,
    rejectExternalContent,
    closePrivacySettings,
  } = usePrivacyPreferences();

  const isVisible =
    externalContentConsent === null || areSettingsOpen;

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="cookie-slide-up-slow fixed inset-x-0 bottom-0 z-[9999] flex justify-center p-4 sm:justify-end sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-preferences-title"
      aria-describedby="privacy-preferences-description"
    >
      <div className="w-full max-w-[390px] rounded-3xl border border-[var(--gold)]/35 bg-[#111111]/95 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="p-5 sm:p-6">
          <p
            id="privacy-preferences-title"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold)]"
          >
            Prywatność i mapa Google
          </p>

          <p
            id="privacy-preferences-description"
            className="mt-3 text-xs leading-relaxed text-white/65 sm:text-sm"
          >
            Mapa Google jest treścią zewnętrzną. Załadujemy ją dopiero po
            Twojej zgodzie. Odrzucenie nie wpływa na pozostałe funkcje strony.
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

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={rejectExternalContent}
              className="cursor-pointer rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Odrzucam
            </button>
            <button
              type="button"
              onClick={acceptExternalContent}
              className="cursor-pointer rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              Akceptuję
            </button>
          </div>

          {areSettingsOpen && externalContentConsent !== null && (
            <button
              type="button"
              onClick={closePrivacySettings}
              className="mt-3 w-full cursor-pointer text-center text-xs text-white/45 underline decoration-white/20 underline-offset-4 transition hover:text-white/70"
            >
              Pozostaw obecne ustawienie
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
