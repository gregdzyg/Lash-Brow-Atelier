import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Eye,
    EyeOff,
    ImagePlus,
    ImageOff,
    ImageUp,
    LoaderCircle,
    Newspaper,
    Pencil,
    Save,
    Send,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    createNewsPost,
    getAdminNewsPosts,
    setNewsPostVisibility,
    updateNewsPostDetails,
    removeNewsPostImage,
    replaceNewsPostImage,
    deleteNewsPost,
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
    const [visibilityError, setVisibilityError] = useState("");
    const [updatingNewsPostId, setUpdatingNewsPostId] = useState(null);
    const [editingNewsPostId, setEditingNewsPostId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("NEWS");
    const [editError, setEditError] = useState("");
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [updatingImageNewsPostId, setUpdatingImageNewsPostId] = useState(null);
    const [imageRemovalConfirmationId, setImageRemovalConfirmationId] = useState(null);
    const [imageError, setImageError] = useState("");
    const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
    const [deletingNewsPostId, setDeletingNewsPostId] = useState(null);
    const [deleteError, setDeleteError] = useState("");
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

    const handleVisibilityChange = async (newsPost) => {
        setUpdatingNewsPostId(newsPost.id);
        setVisibilityError("");
        setDeleteConfirmationId(null);
        setImageRemovalConfirmationId(null);

        try {
            const updatedNewsPost = await setNewsPostVisibility(
                newsPost.id,
                !newsPost.isActive,
            );
            setNewsPosts((currentNewsPosts) =>
                currentNewsPosts.map((currentNewsPost) =>
                    currentNewsPost.id === updatedNewsPost.id
                        ? updatedNewsPost
                        : currentNewsPost
                )
            );
        } catch {
            setVisibilityError(
                "Nie udało się zmienić widoczności wpisu. Spróbuj ponownie.",
            );
        } finally {
            setUpdatingNewsPostId(null);
        }
    };

    const startEditing = (newsPost) => {
        setDeleteConfirmationId(null);
        setImageRemovalConfirmationId(null);
        setEditingNewsPostId(newsPost.id);
        setEditTitle(newsPost.title);
        setEditContent(newsPost.content);
        setEditCategory(newsPost.category);
        setEditError("");
    };

    const cancelEditing = () => {
        setEditingNewsPostId(null);
        setEditError("");
    };

    const handleDetailsSubmit = async (event, newsPostId) => {
        event.preventDefault();
        setIsSavingDetails(true);
        setEditError("");

        try {
            const updatedNewsPost = await updateNewsPostDetails(newsPostId, {
                title: editTitle.trim(),
                content: editContent.trim(),
                category: editCategory,
            });
            setNewsPosts((currentNewsPosts) =>
                currentNewsPosts.map((currentNewsPost) =>
                    currentNewsPost.id === updatedNewsPost.id
                        ? updatedNewsPost
                        : currentNewsPost
                )
            );
            setEditingNewsPostId(null);
        } catch {
            setEditError("Nie udało się zapisać zmian we wpisie.");
        } finally {
            setIsSavingDetails(false);
        }
    };

    const handleImageReplace = async (newsPostId, selectedImage) => {
        if (!selectedImage) {
            return;
        }

        setUpdatingImageNewsPostId(newsPostId);
        setImageRemovalConfirmationId(null);
        setImageError("");

        try {
            const updatedNewsPost = await replaceNewsPostImage(
                newsPostId,
                selectedImage,
            );
            setNewsPosts((currentNewsPosts) =>
                currentNewsPosts.map((currentNewsPost) =>
                    currentNewsPost.id === updatedNewsPost.id
                        ? updatedNewsPost
                        : currentNewsPost
                )
            );
        } catch {
            setImageError("Nie udało się zmienić zdjęcia wpisu.");
        } finally {
            setUpdatingImageNewsPostId(null);
        }
    };

    const handleImageRemove = async (newsPostId) => {
        setUpdatingImageNewsPostId(newsPostId);
        setImageError("");

        try {
            const updatedNewsPost = await removeNewsPostImage(newsPostId);
            setNewsPosts((currentNewsPosts) =>
                currentNewsPosts.map((currentNewsPost) =>
                    currentNewsPost.id === updatedNewsPost.id
                        ? updatedNewsPost
                        : currentNewsPost
                )
            );
            setImageRemovalConfirmationId(null);
        } catch {
            setImageError("Nie udało się usunąć zdjęcia wpisu.");
        } finally {
            setUpdatingImageNewsPostId(null);
        }
    };

    const handlePermanentDelete = async (newsPostId) => {
        setDeletingNewsPostId(newsPostId);
        setDeleteError("");

        try {
            await deleteNewsPost(newsPostId);
            setNewsPosts((currentNewsPosts) =>
                currentNewsPosts.filter(
                    (currentNewsPost) => currentNewsPost.id !== newsPostId,
                )
            );
            setDeleteConfirmationId(null);
        } catch {
            setDeleteError(
                "Nie udało się trwale usunąć wpisu. Spróbuj ponownie.",
            );
        } finally {
            setDeletingNewsPostId(null);
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

                {visibilityError && (
                    <div
                        role="alert"
                        className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        <AlertCircle aria-hidden="true" size={20} />
                        {visibilityError}
                    </div>
                )}

                {imageError && (
                    <div
                        role="alert"
                        className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        <AlertCircle aria-hidden="true" size={20} />
                        {imageError}
                    </div>
                )}

                {deleteError && (
                    <div
                        role="alert"
                        className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        <AlertCircle aria-hidden="true" size={20} />
                        {deleteError}
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

                                    {editingNewsPostId === newsPost.id ? (
                                        <form
                                            onSubmit={(event) => handleDetailsSubmit(
                                                event,
                                                newsPost.id,
                                            )}
                                            className="mt-5 space-y-4"
                                        >
                                            <input
                                                type="text"
                                                required
                                                maxLength={255}
                                                disabled={isSavingDetails}
                                                value={editTitle}
                                                onChange={(event) => setEditTitle(event.target.value)}
                                                aria-label="Tytuł wpisu"
                                                className={inputClassName}
                                            />
                                            <select
                                                required
                                                disabled={isSavingDetails}
                                                value={editCategory}
                                                onChange={(event) => setEditCategory(event.target.value)}
                                                aria-label="Kategoria wpisu"
                                                className={inputClassName}
                                            >
                                                {CATEGORY_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea
                                                required
                                                rows={6}
                                                disabled={isSavingDetails}
                                                value={editContent}
                                                onChange={(event) => setEditContent(event.target.value)}
                                                aria-label="Treść wpisu"
                                                className={`${inputClassName} resize-y leading-6`}
                                            />
                                            {editError && (
                                                <p role="alert" className="text-xs text-red-300">
                                                    {editError}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isSavingDetails}
                                                    onClick={cancelEditing}
                                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/25 px-3 py-2.5 text-xs font-semibold text-white/65 transition hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <X aria-hidden="true" size={15} />
                                                    Anuluj
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSavingDetails || !editTitle.trim() || !editContent.trim()}
                                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-3 py-2.5 text-xs font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isSavingDetails ? (
                                                        <LoaderCircle
                                                            aria-hidden="true"
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Save aria-hidden="true" size={15} />
                                                    )}
                                                    {isSavingDetails ? "Zapisywanie…" : "Zapisz"}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
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
                                            <button
                                                type="button"
                                                disabled={editingNewsPostId !== null || updatingNewsPostId !== null}
                                                onClick={() => startEditing(newsPost)}
                                                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Pencil aria-hidden="true" size={16} />
                                                Edytuj wpis
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        disabled={updatingNewsPostId !== null || editingNewsPostId !== null}
                                        onClick={() => handleVisibilityChange(newsPost)}
                                        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)]/55 px-4 py-2.5 text-sm font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingNewsPostId === newsPost.id ? (
                                            <LoaderCircle
                                                aria-hidden="true"
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : newsPost.isActive ? (
                                            <EyeOff aria-hidden="true" size={16} />
                                        ) : (
                                            <Eye aria-hidden="true" size={16} />
                                        )}
                                        {updatingNewsPostId === newsPost.id
                                            ? "Zapisywanie…"
                                            : newsPost.isActive
                                                ? "Ukryj wpis"
                                                : "Opublikuj ponownie"}
                                    </button>

                                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <label
                                            className={`flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white ${updatingImageNewsPostId !== null || editingNewsPostId !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                        >
                                            {updatingImageNewsPostId === newsPost.id ? (
                                                <LoaderCircle
                                                    aria-hidden="true"
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <ImageUp aria-hidden="true" size={16} />
                                            )}
                                            {newsPost.imageUrl ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                disabled={updatingImageNewsPostId !== null || editingNewsPostId !== null}
                                                onChange={(event) => {
                                                    handleImageReplace(
                                                        newsPost.id,
                                                        event.target.files?.[0],
                                                    );
                                                    event.target.value = "";
                                                }}
                                                className="sr-only"
                                            />
                                        </label>

                                        {newsPost.imageUrl && (
                                            <button
                                                type="button"
                                                disabled={updatingImageNewsPostId !== null || editingNewsPostId !== null}
                                                onClick={() => setImageRemovalConfirmationId(newsPost.id)}
                                                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-200/75 transition-colors hover:border-red-300/60 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <ImageOff aria-hidden="true" size={16} />
                                                Usuń zdjęcie
                                            </button>
                                        )}
                                    </div>

                                    {imageRemovalConfirmationId === newsPost.id && (
                                        <div className="mt-3 rounded-2xl border border-red-400/25 bg-red-500/[0.07] p-4">
                                            <p className="text-xs leading-5 text-red-100/75">
                                                Zdjęcie zostanie trwale usunięte z R2. Sam wpis pozostanie bez zmian.
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={updatingImageNewsPostId !== null}
                                                    onClick={() => setImageRemovalConfirmationId(null)}
                                                    className="flex-1 cursor-pointer rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/65 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Anuluj
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={updatingImageNewsPostId !== null}
                                                    onClick={() => handleImageRemove(newsPost.id)}
                                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/50 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {updatingImageNewsPostId === newsPost.id && (
                                                        <LoaderCircle
                                                            aria-hidden="true"
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    )}
                                                    Usuń trwale
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!newsPost.isActive && (
                                        <div className="mt-3 border-t border-red-400/15 pt-3">
                                            {deleteConfirmationId === newsPost.id ? (
                                                <div className="rounded-2xl border border-red-400/30 bg-red-500/[0.08] p-4">
                                                    <p className="text-xs leading-5 text-red-100/80">
                                                        Wpis zostanie usunięty z bazy, a jego zdjęcie z R2. Tej operacji nie można cofnąć.
                                                    </p>
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={deletingNewsPostId !== null}
                                                            onClick={() => setDeleteConfirmationId(null)}
                                                            className="flex-1 cursor-pointer rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/65 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Anuluj
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={deletingNewsPostId !== null}
                                                            onClick={() => handlePermanentDelete(newsPost.id)}
                                                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/60 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingNewsPostId === newsPost.id ? (
                                                                <LoaderCircle
                                                                    aria-hidden="true"
                                                                    size={14}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2 aria-hidden="true" size={14} />
                                                            )}
                                                            Usuń wpis
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={deletingNewsPostId !== null || updatingImageNewsPostId !== null || editingNewsPostId !== null}
                                                    onClick={() => {
                                                        setDeleteConfirmationId(newsPost.id);
                                                        setImageRemovalConfirmationId(null);
                                                    }}
                                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/35 px-4 py-2.5 text-sm font-semibold text-red-200/80 transition hover:border-red-300/65 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Trash2 aria-hidden="true" size={16} />
                                                    Usuń wpis trwale
                                                </button>
                                            )}
                                        </div>
                                    )}
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
