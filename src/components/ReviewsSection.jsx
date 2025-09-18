import { useState } from "react";

import op1 from "../assets/reviews/op1.png";
import op2 from "../assets/reviews/op2.png";
import op3 from "../assets/reviews/op3.png";
import op4 from "../assets/reviews/op4.png";
import op5 from "../assets/reviews/op5.png";
import op6 from "../assets/reviews/op6.png";
import op7 from "../assets/reviews/op7.png";
import op8 from "../assets/reviews/op8.png";
import op9 from "../assets/reviews/op9.png";
import op10 from "../assets/reviews/op10.png";

const reviews = [op1, op2, op3, op4, op5, op6, op7, op8, op9, op10];

export default function ReviewsSection() {
  const [preview, setPreview] = useState(null);

  return (
    <section className="text-white w-4/5 mx-auto py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--gold)] text-center mb-8">
        Opinie naszych Klientek
      </h2>

      {/* Większe karty + lepszy kontrast: białe tło pod screenami tekstu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((src, i) => (
          <figure
            key={i}
            className="bg-white text-black rounded-3xl border border-[var(--gold)]/60 shadow-md hover:shadow-lg transition p-4 cursor-zoom-in"
            onClick={() => setPreview(src)}
          >
            {/* większa typografia pod screen, gdybyś kiedyś dodał podpis */}
            {/* <figcaption className="text-sm mb-2 text-center text-black/70">Opinia {i + 1}</figcaption> */}
            <img
              src={src}
              alt={`Opinia klientki ${i + 1}`}
              loading="lazy"
              className="w-full h-auto rounded-2xl"
            />
            <p className="mt-2 text-xs text-center text-black/60">Kliknij, aby powiększyć</p>
          </figure>
        ))}
      </div>

      {/* Lightbox / powiększenie */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={preview}
            alt="Podgląd opinii"
            className="max-w-[90vw] max-h-[90vh] rounded-xl"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white text-black text-sm font-semibold shadow"
          >
            Zamknij
          </button>
        </div>
      )}
    </section>
  );
}