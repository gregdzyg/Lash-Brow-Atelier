import { AlertCircle, Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicOfferItems } from "../../api/apiPublicContent";

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

const PublicOfferCards = ({ limit }) => {
  const [offerItems, setOfferItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedOfferItem, setSelectedOfferItem] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOfferItems = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getPublicOfferItems();

        if (isMounted) {
          setOfferItems(Array.isArray(response) ? response : []);
        }
      } catch {
        if (isMounted) {
          setOfferItems([]);
          setLoadError("Nie udało się pobrać aktualnej oferty.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOfferItems();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedOfferItem) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedOfferItem(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedOfferItem]);

  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center gap-3 rounded-3xl border border-[var(--gold)]/20 bg-white/[0.025] text-sm text-white/50">
        <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-[var(--gold)]" />
        Pobieranie aktualnej oferty…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-rose-300/20 bg-rose-400/[0.04] p-8 text-center">
        <AlertCircle aria-hidden="true" size={26} className="text-rose-300" />
        <p className="mt-3 text-sm text-rose-100">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey((currentKey) => currentKey + 1)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 px-4 py-2 text-sm font-medium text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
        >
          <RefreshCw aria-hidden="true" size={15} />
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  const displayedOfferItems = typeof limit === "number"
    ? offerItems.slice(0, limit)
    : offerItems;

  if (displayedOfferItems.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--gold)]/20 bg-white/[0.025] px-6 py-16 text-center text-sm text-white/45">
        Oferta jest obecnie aktualizowana. Zapraszamy do kontaktu.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {displayedOfferItems.map((offerItem) => (
          <article
            key={offerItem.id}
            className="group flex h-80 flex-col rounded-3xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.075] to-white/[0.02] px-6 py-7 text-center backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/50 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20 sm:px-7"
          >
            <h3 className="text-lg font-semibold leading-snug text-[var(--gold)] transition-colors group-hover:text-[#c8ad55] sm:text-xl">
              {offerItem.name}
            </h3>

            {offerItem.description && (
              <div className="mt-4">
                <p className="line-clamp-5 text-sm leading-6 text-white/60">
                  {offerItem.description}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedOfferItem(offerItem)}
                  className="mt-3 text-sm font-medium text-[var(--gold)] transition hover:text-[#c8ad55] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
                >
                  Szczegóły
                </button>
              </div>
            )}

            <div className="mt-auto flex items-center justify-center gap-4 border-t border-[var(--gold)]/15 pt-5">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                <Clock3 aria-hidden="true" size={14} className="text-[var(--gold)]/75" />
                {offerItem.durationMinutes} min
              </span>
              <strong className="text-base font-semibold text-white sm:text-lg">
                {priceFormatter.format(Number(offerItem.basePrice))}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {selectedOfferItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOfferItem(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-details-title"
            aria-describedby="offer-details-description"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--gold)]/30 bg-[#1c1c1c] p-7 text-left shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedOfferItem(null)}
              aria-label="Zamknij szczegóły oferty"
              className="absolute right-5 top-4 text-2xl text-white/50 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
            >
              ×
            </button>

            <h2
              id="offer-details-title"
              className="pr-8 text-xl font-semibold text-[var(--gold)]"
            >
              {selectedOfferItem.name}
            </h2>

            <p
              id="offer-details-description"
              className="mt-5 whitespace-pre-line text-sm leading-7 text-white/70"
            >
              {selectedOfferItem.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicOfferCards;
