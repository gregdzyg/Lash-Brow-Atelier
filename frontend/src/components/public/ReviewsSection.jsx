import { useState } from "react";

import op1 from "../../assets/reviews/op1.png";
import op2 from "../../assets/reviews/op2.png";
import op3 from "../../assets/reviews/op3.png";
import op4 from "../../assets/reviews/op4.png";
import op5 from "../../assets/reviews/op5.png";
import op6 from "../../assets/reviews/op6.png";
import op7 from "../../assets/reviews/op7.png";
import op8 from "../../assets/reviews/op8.png";
import op9 from "../../assets/reviews/op9.png";
import op10 from "../../assets/reviews/op10.png";

const reviews = [op1, op2, op3, op4, op5, op6, op7, op8, op9, op10];

export default function ReviewsSection() {
  const [preview, setPreview] = useState(null);

  return (
    <section className="py-16 text-white sm:py-24">
      <h2 className="mb-10 text-center text-3xl font-semibold text-[var(--gold)] sm:mb-14 sm:text-4xl">
        Opinie naszych Klientek
      </h2>

      {/* Większe karty + lepszy kontrast: białe tło pod screenami tekstu */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {reviews.map((src, i) => (
          <figure
            key={i}
            className="
              group cursor-zoom-in rounded-3xl border border-[var(--gold)]/20
              bg-white p-3 text-black shadow-[0_18px_45px_rgba(0,0,0,0.2)]
              transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/55
              hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)]
            "
            onClick={() => setPreview(src)}
          >
            {/* większa typografia pod screen, gdybyś kiedyś dodał podpis */}
            {/* <figcaption className="text-sm mb-2 text-center text-black/70">Opinia {i + 1}</figcaption> */}
            <img
              src={src}
              alt={`Opinia klientki ${i + 1}`}
              loading="lazy"
              className="h-auto w-full rounded-2xl"
            />
            <p className="mt-3 text-center text-xs text-black/50 transition-colors group-hover:text-black/70">Kliknij, aby powiększyć</p>
          </figure>
        ))}
      </div>

      {/* Lightbox / powiększenie */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={preview}
            alt="Podgląd opinii"
            className="max-h-[88vh] max-w-[92vw] rounded-2xl border border-[var(--gold)]/25 shadow-2xl"
          />
          <button
            onClick={() => setPreview(null)}
            className="
              absolute right-4 top-4 cursor-pointer rounded-full border border-[var(--gold)]/50
              bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg
              transition-colors hover:bg-[var(--gold)] hover:text-black
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
              sm:right-6 sm:top-6
            "
          >
            Zamknij
          </button>
        </div>
      )}
    </section>
  );
}
