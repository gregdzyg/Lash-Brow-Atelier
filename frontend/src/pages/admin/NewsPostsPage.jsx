import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ImagePlus,
    LoaderCircle,
    Newspaper,
    Send,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    createNewsPost,
    getAdminNewsPosts,
} from "../../api/apiNewsPosts";

const CATEGORY_OPTIONS = [
    { value: "NEWS", label: "Aktualność" },
    { value: "EVENT", label: "Wydarzenie" },
    { value: "PROMOTION", label: "Promocja" },
];

const CATEGORY_LABELS = Object.fromEntries(
    CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
);

const inputClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3 text-sm text-white outline-none transition duration-300
    placeholder:text-white/25 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
    disabled:cursor-not-allowed disabled:opacity-60
`;

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Brak daty";
    }

    return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateValue));
};

const NewsPostsPage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("NEWS");
    const [image, setImage] = useState(null);
    const [newsPosts, setNewsPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listError, setListError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const fileInputRef = useRef(null);
    const submissionInProgress = useRef(false);

    const previewUrl = useMemo(
        () => image ? URL.createObjectURL(image) : "",
        [image],
    );

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        let isMounted = true;

        const fetchNewsPosts = async () => {
            try {
                const fetchedNewsPosts = await getAdminNewsPosts();

                if (isMounted) {
                    setNewsPosts(
                        Array.isArray(fetchedNewsPosts) ? fetchedNewsPosts : [],
                    );
                }
            } catch {
                if (isMounted) {
                    setListError("Nie udało się pobrać aktualności.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchNewsPosts();

        return () => {
            isMounted = false;
        };
    }, []);

    const clearImage = () => {
        setImage(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setCategory("NEWS");
        clearImage();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submissionInProgress.current) {
            return;
        }

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setSubmitError("");
        setSuccessMessage("");

        try {
            const createdNewsPost = await createNewsPost({
                title,
                content,
                category,
                image,
            });
            setNewsPosts((currentNewsPosts) => [
                createdNewsPost,
                ...currentNewsPosts,
            ]);
            resetForm();
            setSuccessMessage("Aktualność została opublikowana.");
        } catch {
            setSubmitError(
                "Nie udało się opublikować aktualności. Sprawdź dane i spróbuj ponownie.",
            );
        } finally {
            submissionInProgress.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 max-w-2xl sm:mb-12">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Panel administracyjny
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    Aktualności
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Publikuj informacje, wydarzenia i promocje widoczne na stronie Atelier.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
            >
                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)] lg:p-10">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Nowy wpis
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-white/45">
                                Tytuł, treść i kategoria są wymagane. Zdjęcie jest opcjonalne.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="news-title"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Tytuł
                            </label>
                            <input
                                id="news-title"
                                type="text"
                                required
                                maxLength={255}
                                disabled={isSubmitting}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Np. Jesienna promocja na laminację"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="news-category"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Kategoria
                            </label>
                            <select
                                id="news-category"
                                required
                                disabled={isSubmitting}
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className={inputClassName}
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="news-content"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Treść
                            </label>
                            <textarea
                                id="news-content"
                                required
                                rows={8}
                                disabled={isSubmitting}
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                placeholder="Napisz wiadomość dla klientek…"
                                className={`${inputClassName} resize-y leading-6`}
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <p className="mb-2 text-sm font-medium text-white/85">
                                Zdjęcie
                            </p>
                            <label
                                htmlFor="news-image"
                                className="relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--gold)]/45 bg-black/15 text-center transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/[0.06]"
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Podgląd zdjęcia wpisu"
                                        className="h-64 w-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <ImagePlus
                                            aria-hidden="true"
                                            size={34}
                                            className="text-[var(--gold)]"
                                        />
                                        <span className="mt-4 text-sm font-semibold text-white/75">
                                            Wybierz zdjęcie
                                        </span>
                                        <span className="mt-1 text-xs text-white/35">
                                            JPG, JPEG lub PNG · maks. 10 MB
                                        </span>
                                    </>
                                )}
                            </label>
                            <input
                                ref={fileInputRef}
                                id="news-image"
                                type="file"
                                accept="image/jpeg,image/png"
                                disabled={isSubmitting}
                                onChange={(event) => {
                                    setImage(event.target.files?.[0] ?? null);
                                    setSubmitError("");
                                    setSuccessMessage("");
                                }}
                                className="sr-only"
                            />

                            {image && (
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <p className="min-w-0 truncate text-xs text-white/45">
                                        {image.name}
                                    </p>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={clearImage}
                                        className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-white/55 transition hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X aria-hidden="true" size={15} />
                                        Usuń
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs leading-5 text-white/40">
                            Zdjęcie jest wizualnym uzupełnieniem wpisu i nie otrzymuje osobnego podpisu.
                        </p>
                    </div>
                </div>

                {(submitError || successMessage) && (
                    <div className="px-6 pb-5 sm:px-8 lg:px-10">
                        {submitError && (
                            <div
                                role="alert"
                                className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                <AlertCircle aria-hidden="true" size={18} />
                                {submitError}
                            </div>
                        )}
                        {successMessage && (
                            <div
                                role="status"
                                className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                            >
                                <CheckCircle2 aria-hidden="true" size={18} />
                                {successMessage}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:px-8 lg:px-10">
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !content.trim()}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <LoaderCircle
                                aria-hidden="true"
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Send aria-hidden="true" size={17} />
                        )}
                        {isSubmitting ? "Publikowanie…" : "Opublikuj wpis"}
                    </button>
                </div>
            </form>

            <div className="mt-12">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            Opublikowane wpisy
                        </h2>
                        <p className="mt-2 text-sm text-white/50">
                            Wszystkie aktualności zapisane w panelu.
                        </p>
                    </div>
                    {!isLoading && !listError && (
                        <span className="shrink-0 text-sm text-white/45">
                            Liczba wpisów: {newsPosts.length}
                        </span>
                    )}
                </div>

                {isLoading && (
                    <div
                        role="status"
                        className="flex items-center justify-center gap-3 rounded-3xl border border-[var(--gold)]/20 bg-white/[0.035] px-6 py-12 text-sm text-white/55"
                    >
                        <LoaderCircle
                            aria-hidden="true"
                            size={20}
                            className="animate-spin text-[var(--gold)]"
                        />
                        Pobieranie aktualności…
                    </div>
                )}

                {!isLoading && listError && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        <AlertCircle aria-hidden="true" size={20} />
                        {listError}
                    </div>
                )}

                {!isLoading && !listError && newsPosts.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-[var(--gold)]/30 bg-white/[0.025] px-6 py-12 text-center">
                        <Newspaper
                            aria-hidden="true"
                            size={30}
                            className="mx-auto text-[var(--gold)]/70"
                        />
                        <p className="mt-4 text-sm font-medium text-white/70">
                            Nie ma jeszcze żadnych aktualności.
                        </p>
                    </div>
                )}

                {!isLoading && !listError && newsPosts.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {newsPosts.map((newsPost) => (
                            <article
                                key={newsPost.id}
                                className="overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-white/[0.045]"
                            >
                                {newsPost.imageUrl && (
                                    <img
                                        src={newsPost.imageUrl}
                                        alt={newsPost.imageAltText || newsPost.title}
                                        loading="lazy"
                                        decoding="async"
                                        className={`h-64 w-full object-cover ${newsPost.isActive ? "" : "opacity-45 grayscale"}`}
                                    />
                                )}
                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]">
                                            {CATEGORY_LABELS[newsPost.category] ?? newsPost.category}
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${newsPost.isActive ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-white/20 bg-white/[0.04] text-white/50"}`}>
                                            {newsPost.isActive ? "Widoczny" : "Ukryty"}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-xl font-semibold text-white">
                                        {newsPost.title}
                                    </h3>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/60">
                                        {newsPost.content}
                                    </p>
                                    <p className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/35">
                                        <CalendarDays aria-hidden="true" size={15} />
                                        {formatDate(newsPost.createdAt)}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewsPostsPage;
