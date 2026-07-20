import BooksyButton from "./BooksyButton";

const BooksySection = () => {
  return (
    <div className="bg-[var(--background)] p-6 rounded-4xl border border-[var(--gold)]/70 mb-12">
      <h2 className="text-2xl font-semibold text-[var(--gold)] mb-2">
        Rezerwacje online
      </h2>

      <p className="text-white/80 text-sm md:text-base mb-5">
        Umów wizytę w kilka sekund przez Booksy — wybierz usługę i termin, a my
        wszystko potwierdzimy.
      </p>

      {/* Przycisk Booksy */}
    <div className="mt-4 flex justify-center">
    <div className="booksy-cta">
        <BooksyButton />
    </div>
    </div>

      <p className="text-white/50 text-xs mt-4">
        Po kliknięciu otworzy się okno rezerwacji.
      </p>
    </div>
  );
};

export default BooksySection;