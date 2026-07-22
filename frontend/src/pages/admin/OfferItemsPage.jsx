import {
    AlertCircle,
    LoaderCircle,
    Plus,
    Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOfferItems } from "../../api/apiOfferItems";

const categoryLabels = {
    LASHES: "Rzęsy",
    BROWS: "Brwi",
    OTHER: "Inne",
};

const categoryFilters = [
    {
        value: "",
        label: "Wszystkie",
    },
    {
        value: "LASHES",
        label: "Rzęsy",
    },
    {
        value: "BROWS",
        label: "Brwi",
    },
    {
        value: "OTHER",
        label: "Inne",
    },
];

const priceFormatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
});

const OfferItemsPage = () => {
    const [offerItems, setOfferItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const successMessage = location.state?.successMessage;

    useEffect(() => {
        let isMounted = true;

        const fetchOfferItems = async () => {
            setIsLoading(true);
            setError("");

            try {
                const fetchedOfferItems = await getOfferItems(
                    selectedCategory || undefined
                );

                if (isMounted) {
                    setOfferItems(
                        Array.isArray(fetchedOfferItems) ? fetchedOfferItems : []
                    );
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać oferty. Spróbuj ponownie później.");
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
    }, [selectedCategory]);

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                        <span className="h-px w-8 bg-[var(--gold)]/70" />
                        Panel administracyjny
                    </p>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        Oferta
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                        Zarządzaj aktywnymi usługami, czasem ich trwania i cenami.
                    </p>
                </div>

                <Link
                    to="/admin/offer/new"
                    className="
                        flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border-2
                        border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black
                        transition-colors duration-300 hover:bg-transparent hover:text-[var(--gold)]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                        focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                    "
                >
                    <Plus aria-hidden="true" size={17} />
                    Dodaj usługę
                </Link>
            </div>

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    {successMessage}
                </div>
            )}

            <div
                className="mb-6 flex flex-wrap gap-2"
                aria-label="Filtruj ofertę według kategorii"
            >
                {categoryFilters.map((filter) => {
                    const isSelected = selectedCategory === filter.value;

                    return (
                        <button
                            key={filter.label}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedCategory(filter.value)}
                            className={`
                                cursor-pointer rounded-full border px-4 py-2 text-sm font-medium
                                transition-colors focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2
                                focus-visible:ring-offset-[var(--background)]
                                ${isSelected
                                    ? "border-[var(--gold)] bg-[var(--gold)] text-black"
                                    : `
                                        border-[var(--gold)]/35 bg-white/[0.04] text-white/65
                                        hover:border-[var(--gold)]/70 hover:text-[var(--gold)]
                                    `
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            {isLoading && (
                <div
                    role="status"
                    className="
                        flex min-h-52 flex-col items-center justify-center rounded-4xl border
                        border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12
                        text-center backdrop-blur-xl
                    "
                >
                    <LoaderCircle
                        aria-hidden="true"
                        size={32}
                        className="animate-spin text-[var(--gold)]"
                    />
                    <p className="mt-4 text-sm text-white/60">
                        Pobieranie oferty…
                    </p>
                </div>
            )}

            {!isLoading && error && (
                <div
                    role="alert"
                    className="
                        flex min-h-52 flex-col items-center justify-center rounded-4xl border border-red-500/30
                        bg-red-500/[0.08] px-6 py-12 text-center backdrop-blur-xl
                    "
                >
                    <AlertCircle
                        aria-hidden="true"
                        size={32}
                        className="text-red-300"
                    />
                    <h2 className="mt-4 text-lg font-semibold text-white">
                        Wystąpił błąd
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-red-200/75">
                        {error}
                    </p>
                </div>
            )}

            {!isLoading && !error && offerItems.length === 0 && (
                <div className="
                    flex min-h-52 flex-col items-center justify-center rounded-4xl border
                    border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12
                    text-center backdrop-blur-xl
                ">
                    <span
                        className="
                            flex h-14 w-14 items-center justify-center rounded-2xl
                            border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]
                        "
                    >
                        <Sparkles aria-hidden="true" size={27} />
                    </span>
                    <h2 className="mt-5 text-xl font-semibold text-white">
                        {selectedCategory
                            ? "Brak usług w tej kategorii"
                            : "Oferta jest jeszcze pusta"}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
                        {selectedCategory
                            ? `W kategorii „${categoryLabels[selectedCategory]}” nie ma obecnie aktywnych usług.`
                            : "Dodaj pierwszą usługę, aby zacząć budować ofertę Atelier."}
                    </p>

                    {!selectedCategory && (
                        <Link
                            to="/admin/offer/new"
                            className="
                                mt-6 flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)]
                                px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-transparent
                                hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2
                                focus-visible:ring-offset-[var(--background)]
                            "
                        >
                            <Plus aria-hidden="true" size={16} />
                            Dodaj pierwszą usługę
                        </Link>
                    )}
                </div>
            )}

            {!isLoading && !error && offerItems.length > 0 && (
                <div className="
                    overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br
                    from-white/[0.08] to-white/[0.025] backdrop-blur-xl
                ">
                    <div className="
                        hidden
                        grid-cols-[minmax(0,1.5fr)_minmax(7rem,0.65fr)_minmax(7rem,0.55fr)_minmax(7rem,0.65fr)]
                        gap-5 border-b border-[var(--gold)]/25 bg-black/10 px-7 py-4 text-xs font-semibold
                        uppercase tracking-[0.16em] text-[var(--gold)]/75 md:grid
                    ">
                        <span>Usługa</span>
                        <span>Kategoria</span>
                        <span>Czas</span>
                        <span>Cena</span>
                    </div>

                    <div className="divide-y divide-[var(--gold)]/15">
                        {offerItems.map((offerItem) => (
                            <Link
                                key={offerItem.id}
                                to={`/admin/offer/${offerItem.id}`}
                                aria-label={`Otwórz szczegóły usługi ${offerItem.name}`}
                                className="
                                    grid grid-cols-1 gap-4 px-5 py-5 transition-colors duration-300
                                    hover:bg-[var(--gold)]/[0.06] focus-visible:bg-[var(--gold)]/[0.06]
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                                    focus-visible:ring-[var(--gold)]/50 sm:px-6
                                    md:grid-cols-[minmax(0,1.5fr)_minmax(7rem,0.65fr)_minmax(7rem,0.55fr)_minmax(7rem,0.65fr)]
                                    md:items-center md:gap-5 md:px-7 md:py-4
                                "
                            >
                                <div className="min-w-0">
                                    <p
                                        className="
                                            mb-1 text-[0.65rem] font-semibold uppercase
                                            tracking-[0.16em] text-[var(--gold)]/65 md:hidden
                                        "
                                    >
                                        Usługa
                                    </p>
                                    <h2 className="break-words text-base font-semibold text-white">
                                        {offerItem.name}
                                    </h2>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        Kategoria
                                    </p>
                                    <p className="text-sm text-white/70">
                                        {categoryLabels[offerItem.category] ?? offerItem.category}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        Czas
                                    </p>
                                    <p className="text-sm text-white/70">
                                        {offerItem.durationMinutes} min
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        Cena
                                    </p>
                                    <p className="text-sm font-medium text-[var(--gold)]">
                                        {priceFormatter.format(offerItem.basePrice)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default OfferItemsPage;
