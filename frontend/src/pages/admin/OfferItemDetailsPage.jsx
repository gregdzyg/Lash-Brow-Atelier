import {
    AlertCircle,
    ArrowLeft,
    Clock3,
    FileText,
    LoaderCircle,
    Pencil,
    Sparkles,
    Tag,
    Trash2,
    WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { archiveOfferItem, getOfferItem } from "../../api/apiOfferItems";

const categoryLabels = {
    LASHES: "Rzęsy",
    BROWS: "Brwi",
    OTHER: "Inne",
};

const priceFormatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
});

const OfferItemDetailsPage = () => {
    const [offerItem, setOfferItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isArchiveConfirmationVisible, setIsArchiveConfirmationVisible] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveError, setArchiveError] = useState("");
    const archiveInProgress = useRef(false);
    const { offerItemId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const successMessage = location.state?.successMessage;

    useEffect(() => {
        let isMounted = true;

        const fetchOfferItem = async () => {
            try {
                const fetchedOfferItem = await getOfferItem(offerItemId);

                if (isMounted) {
                    setOfferItem(fetchedOfferItem);
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać danych usługi. Spróbuj ponownie później.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOfferItem();

        return () => {
            isMounted = false;
        };
    }, [offerItemId]);

    const handleShowArchiveConfirmation = () => {
        setArchiveError("");
        setIsArchiveConfirmationVisible(true);
    };

    const handleCancelArchive = () => {
        setIsArchiveConfirmationVisible(false);
    };

    const handleArchive = async () => {
        if (archiveInProgress.current) {
            return;
        }

        archiveInProgress.current = true;
        setIsArchiving(true);
        setArchiveError("");

        try {
            await archiveOfferItem(offerItemId);
            navigate("/admin/offer", {
                replace: true,
                state: {
                    successMessage: "Usługa została zarchiwizowana.",
                },
            });
        } catch {
            setArchiveError("Nie udało się zarchiwizować usługi. Spróbuj ponownie później.");
            archiveInProgress.current = false;
            setIsArchiving(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 sm:mb-12">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Panel administracyjny
                </p>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="break-words text-3xl font-bold text-white sm:text-4xl">
                            Szczegóły usługi
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                            Informacje o pozycji aktywnej oferty.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        {!isLoading && !error && offerItem && (
                            <Link
                                to={`/admin/offer/${offerItemId}/edit`}
                                className="
                                    flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border
                                    border-[var(--gold)]/65 px-5 py-2.5 text-sm font-semibold text-[var(--gold)]
                                    transition-colors duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold)]/10
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                                    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                                "
                            >
                                <Pencil aria-hidden="true" size={16} />
                                Edytuj usługę
                            </Link>
                        )}

                        <Link
                            to="/admin/offer"
                            className="
                                group flex w-fit shrink-0 items-center justify-center gap-2 rounded-full px-2 py-1
                                text-sm font-medium text-white/55 transition-colors duration-300
                                hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2
                                focus-visible:ring-offset-[var(--background)]
                            "
                        >
                            <ArrowLeft
                                aria-hidden="true"
                                size={17}
                                className="transition-transform duration-300 group-hover:-translate-x-1"
                            />
                            Wróć do oferty
                        </Link>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 max-w-5xl rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    {successMessage}
                </div>
            )}

            {isLoading && (
                <div
                    role="status"
                    className="
                        flex min-h-52 max-w-5xl flex-col items-center justify-center rounded-4xl border
                        border-[var(--gold)]/25 bg-white/[0.04] px-6 py-12
                    "
                >
                    <LoaderCircle
                        aria-hidden="true"
                        size={32}
                        className="animate-spin text-[var(--gold)]"
                    />
                    <p className="mt-4 text-sm text-white/60">
                        Pobieranie danych usługi…
                    </p>
                </div>
            )}

            {!isLoading && error && (
                <div
                    role="alert"
                    className="
                        flex min-h-52 max-w-5xl flex-col items-center justify-center rounded-4xl border
                        border-red-500/30 bg-red-500/[0.08] px-6 py-12 text-center
                    "
                >
                    <AlertCircle
                        aria-hidden="true"
                        size={32}
                        className="text-red-300"
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        Wystąpił błąd
                    </h2>
                    <p className="mt-2 text-sm text-red-200/75">
                        {error}
                    </p>
                </div>
            )}

            {!isLoading && !error && offerItem && (
                <article className="
                    max-w-5xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br
                    from-white/[0.08] to-white/[0.025] backdrop-blur-xl
                ">
                    <div className="flex items-center gap-4 border-b border-[var(--gold)]/20 px-6 py-6 sm:px-8 lg:px-10">
                        <span className="
                            flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border
                            border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]
                        ">
                            <Sparkles aria-hidden="true" size={21} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]/70">
                                Usługa
                            </p>
                            <h2 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">
                                {offerItem.name}
                            </h2>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 px-6 py-2 sm:grid-cols-3 sm:px-8 lg:px-10">
                        <div className="flex min-w-0 gap-3 border-b border-[var(--gold)]/15 py-5 sm:border-b-0 sm:border-r sm:pr-6">
                            <Tag
                                aria-hidden="true"
                                size={18}
                                className="mt-0.5 shrink-0 text-[var(--gold)]/75"
                            />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Kategoria
                                </dt>
                                <dd className="mt-2 text-sm text-white/75">
                                    {categoryLabels[offerItem.category] ?? offerItem.category}
                                </dd>
                            </div>
                        </div>

                        <div className="flex min-w-0 gap-3 border-b border-[var(--gold)]/15 py-5 sm:border-b-0 sm:border-r sm:px-6">
                            <Clock3
                                aria-hidden="true"
                                size={18}
                                className="mt-0.5 shrink-0 text-[var(--gold)]/75"
                            />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Czas trwania
                                </dt>
                                <dd className="mt-2 text-sm text-white/75">
                                    {offerItem.durationMinutes} min
                                </dd>
                            </div>
                        </div>

                        <div className="flex min-w-0 gap-3 py-5 sm:pl-6">
                            <WalletCards
                                aria-hidden="true"
                                size={18}
                                className="mt-0.5 shrink-0 text-[var(--gold)]/75"
                            />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Cena podstawowa
                                </dt>
                                <dd className="mt-2 text-sm font-medium text-[var(--gold)]">
                                    {priceFormatter.format(offerItem.basePrice)}
                                </dd>
                            </div>
                        </div>
                    </dl>

                    <div className="border-t border-[var(--gold)]/20 bg-black/10 px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
                        <div className="flex items-center gap-3">
                            <FileText
                                aria-hidden="true"
                                size={18}
                                className="text-[var(--gold)]/75"
                            />
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
                                Opis
                            </h2>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-white/70">
                            {offerItem.description?.trim() || "Brak opisu"}
                        </p>
                    </div>

                    <div className="border-t border-red-500/20 bg-red-950/[0.08] px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
                        {!isArchiveConfirmationVisible ? (
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200/70">
                                        Archiwizacja usługi
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-white/45">
                                        Usługa zniknie z aktywnej oferty, ale jej dane pozostaną w bazie.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleShowArchiveConfirmation}
                                    className="
                                        flex w-fit cursor-pointer items-center gap-2 rounded-full border border-red-400/55 px-5
                                        py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/10 focus-visible:outline-none
                                        focus-visible:ring-2 focus-visible:ring-red-400
                                    "
                                >
                                    <Trash2 aria-hidden="true" size={16} />
                                    Zarchiwizuj usługę
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-5 sm:p-6">
                                <h2 className="text-base font-semibold text-white">
                                    Czy na pewno chcesz zarchiwizować tę usługę?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-white/55">
                                    Usługa zniknie z aktywnej oferty, ale jej dane pozostaną w bazie.
                                </p>

                                {archiveError && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                                    >
                                        {archiveError}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelArchive}
                                        disabled={isArchiving}
                                        className="
                                            cursor-pointer rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold
                                            text-white/65 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2
                                            focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50
                                        "
                                    >
                                        Anuluj
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleArchive}
                                        disabled={isArchiving}
                                        className="
                                            flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400
                                            bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-100 hover:bg-red-500/25
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                                            disabled:cursor-not-allowed disabled:opacity-50
                                        "
                                    >
                                        {isArchiving ? (
                                            <LoaderCircle
                                                aria-hidden="true"
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 aria-hidden="true" size={16} />
                                        )}
                                        {isArchiving
                                            ? "Archiwizowanie…"
                                            : "Tak, zarchiwizuj usługę"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            )}
        </section>
    );
};

export default OfferItemDetailsPage;
