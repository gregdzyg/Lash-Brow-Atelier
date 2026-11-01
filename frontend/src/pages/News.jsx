import {
  AlertCircle,
  CalendarDays,
  LoaderCircle,
  Newspaper,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicNewsPosts } from "../api/apiPublicContent";

const CATEGORY_LABELS = {
  NEWS: "Aktualność",
  EVENT: "Wydarzenie",
  PROMOTION: "Promocja",
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
};

const News = () => {
  const [newsPosts, setNewsPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchNewsPosts = async () => {
      try {
        const response = await getPublicNewsPosts();

        if (isMounted) {
          setNewsPosts(Array.isArray(response) ? response : []);
          setHasError(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
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

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[var(--gold)]/70" />
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Aktualności
          </h1>
          <span className="h-px w-10 bg-[var(--gold)]/70" />
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
          Najnowsze informacje, wydarzenia i promocje prosto z Atelier.
        </p>
      </div>

      {isLoading && (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-16 text-sm text-white/55"
        >
          <LoaderCircle
            aria-hidden="true"
            size={20}
            className="animate-spin text-[var(--gold)]"
          />
          Pobieranie aktualności…
        </div>
      )}

      {!isLoading && hasError && (
        <div
          role="alert"
          className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-red-500/25 bg-red-500/[0.06] px-6 py-12 text-center"
        >
          <AlertCircle aria-hidden="true" size={30} className="text-red-300" />
          <p className="mt-4 text-sm leading-6 text-white/65">
            Nie udało się pobrać aktualności. Spróbuj ponownie później.
          </p>
        </div>
      )}

      {!isLoading && !hasError && newsPosts.length === 0 && (
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-dashed border-[var(--gold)]/30 bg-white/[0.025] px-6 py-12 text-center">
          <Newspaper
            aria-hidden="true"
            size={30}
            className="text-[var(--gold)]/70"
          />
          <p className="mt-4 text-sm font-medium text-white/65">
            Wkrótce pojawią się tutaj najnowsze informacje z Atelier.
          </p>
        </div>
      )}

      {!isLoading && !hasError && newsPosts.length > 0 && (
        <div className="mx-auto grid max-w-5xl gap-7 sm:gap-9">
          {newsPosts.map((newsPost) => (
            <article
              key={newsPost.id}
              className={`overflow-hidden rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.075] to-white/[0.025] shadow-[0_24px_60px_rgba(0,0,0,0.2)] ${newsPost.imageUrl ? "grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}
            >
              {newsPost.imageUrl && (
                <div className="min-h-72 overflow-hidden lg:min-h-96">
                  <img
                    src={newsPost.imageUrl}
                    alt={newsPost.imageAltText || newsPost.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full max-h-[34rem] w-full object-cover transition duration-700 hover:scale-[1.025]"
                  />
                </div>
              )}

              <div className={`flex flex-col justify-center p-6 sm:p-9 lg:p-11 ${newsPost.imageUrl ? "" : "mx-auto w-full max-w-3xl text-center"}`}>
                <div className={`flex flex-wrap items-center gap-3 ${newsPost.imageUrl ? "" : "justify-center"}`}>
                  <span className="rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
                    {CATEGORY_LABELS[newsPost.category] ?? newsPost.category}
                  </span>
                  {newsPost.createdAt && (
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <CalendarDays aria-hidden="true" size={14} />
                      {formatDate(newsPost.createdAt)}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {newsPost.title}
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/65 sm:text-base">
                  {newsPost.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default News;
