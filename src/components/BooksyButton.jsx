import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const BOOKSY_ID = "332745";

const BooksyButton = () => {
  const hostRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!hostRef.current) return;

    // 1) Wyczyść miejsce na przycisk
    hostRef.current.innerHTML = "";

    // 2) Usuń stare kontenery Booksy z poprzednich wejść (jeśli zostały)
    document.querySelectorAll(".booksy-widget-container").forEach((el) => el.remove());

    // 3) Dodaj skrypt DO hosta (Booksy wstawia UI przed script-em)
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;

    // 🔥 cache buster: wymusza ponowne wykonanie przy każdym wejściu na stronę
    const v = Date.now();

    script.src =
      `https://booksy.com/widget/code.js?id=${BOOKSY_ID}` +
      `&country=pl&lang=pl&mode=dialog&theme=default&v=${v}`;

    hostRef.current.appendChild(script);

    // cleanup przy wyjściu z podstrony
    return () => {
      hostRef.current?.querySelector(".booksy-widget-container")?.remove();
      hostRef.current?.querySelector("script")?.remove();
    };
  }, [location.pathname]); // <-- klucz: odpalaj przy zmianie trasy

  return <div ref={hostRef} />;
}
export default BooksyButton;