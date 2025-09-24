import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[var(--background)] text-white text-sm py-10 px-4">
      {/* Główna siatka */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-y-6  text-center">
        {/* Kontakt */}
        <div className="space-y-1">
          <p className="text-[var(--gold)] font-medium mb-1">Kontakt</p>
          <p className="text-xs">📍 ul. Kościelna 26, 21-200 Parczew</p>
          <p className="text-xs">📞 +48 534 345 432</p>
          <p className="text-xs">📧 kontakt@atelierbypaula.pl</p>
        </div>
        {/* Dodatkowe linki */}
        <div>
          <p className="text-[var(--gold)] font-medium">Informacje</p>
          <ul className="space-y-1">
            <li>
              <Link to="/offer" className="hover:underline text-xs">
                Oferta
              </Link>
            </li>
            <li>
              <span className="text-xs">🕒 Godziny otwarcia: 8–17</span>
            </li>
            <li>
              <Link to="/regulamin" className="text-xs hover:underline">
                Regulamin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Separator */}
      <div className="w-4/5 mx-auto h-px bg-[var(--gold)]/50 my-6" />

      {/* Ikony social media */}
      <div className="flex justify-center items-center space-x-6">
        <a href="https://www.instagram.com/paulina_tarnowska_?igsh=MWNreGprdDRzN3mbA==" aria-label="Instagram" className="hover:text-[var(--gold)] transition flex items-center gap-1">
          <FaInstagram size={18} />
          <span className="text-xs">Instagram</span>
        </a>
        <a href="https://facebook.com/share/1CXJKitwvD/" aria-label="Facebook" className="hover:text-[var(--gold)] transition flex items-center gap-1">
          <FaFacebookF size={18} />
          <span className="text-xs">Facebook</span>
        </a>
        <a href="https://www.tiktok.com/@lashbrowatelierpaula" aria-label="TikTok" className="hover:text-[var(--gold)] transition flex items-center gap-1">
          <FaTiktok size={18} />
          <span className="text-xs">TikTok</span>
        </a>
      </div>
       {/* Branding */}
        <div className="text-center mt-4">
          <span className="text-[var(--rose)] font-semibold mb-1">
            Lash&Brow Atelier </span>
          
          <span className="text-xs italic text-[var(--rose)]">by Paulina Tarnowska </span>
          <span className="text-xs">
            © 2025 
          </span>
        </div>
    </footer>
  );
};

export default Footer;