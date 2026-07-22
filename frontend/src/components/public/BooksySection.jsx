import BooksyButton from "./BooksyButton";

const BooksySection = () => {
  return (
    <div className="
      mb-12 grid items-center gap-8 rounded-4xl border border-[var(--gold)]/25
      bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6
      shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl
      sm:p-8 md:grid-cols-[1fr_auto] lg:p-10
    ">
      <div>
      <h2 className="text-2xl font-semibold text-[var(--gold)] sm:text-3xl">
        Rezerwacje online
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
        Umów wizytę w kilka sekund przez Booksy — wybierz usługę i termin, a my
        wszystko potwierdzimy.
      </p>

      <p className="mt-4 text-xs text-white/40">
        Po kliknięciu otworzy się okno rezerwacji.
      </p>
      </div>

      {/* Przycisk Booksy */}
    <div className="flex justify-center md:justify-end">
    <div className="booksy-cta rounded-full ring-1 ring-[var(--gold)]/20 ring-offset-4 ring-offset-transparent">
        <BooksyButton />
    </div>
    </div>
    </div>
  );
};

export default BooksySection;
