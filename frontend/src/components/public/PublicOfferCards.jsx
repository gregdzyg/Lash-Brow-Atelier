import { AlertCircle, Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicOfferItems } from "../../api/apiPublicContent";

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

const PublicOfferCards = ({ limit, compact = false }) => {
  const [offerItems, setOfferItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {displayedOfferItems.map((offerItem) => (
        <article
          key={offerItem.id}
          className={`group flex flex-col rounded-3xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.075] to-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/50 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20 ${
            compact
              ? "min-h-56 px-6 py-7 text-center sm:px-7"
              : "min-h-72 p-7"
          }`}
        >
          <h3 className="text-lg font-semibold leading-snug text-[var(--gold)] transition-colors group-hover:text-[#c8ad55] sm:text-xl">
            {offerItem.name}
          </h3>

          {offerItem.description && (
            <p className="mt-4 flex-1 text-sm leading-6 text-white/60">
              {offerItem.description}
            </p>
          )}

          <div className={`mt-6 border-t border-[var(--gold)]/15 pt-5 ${
            compact ? "flex items-center justify-center gap-4" : "flex items-end justify-between gap-4"
          }`}>
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
  );
};

export default PublicOfferCards;
