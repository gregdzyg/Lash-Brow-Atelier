import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/head-images/logo.png';
import { Menu, X } from 'lucide-react';

const Navbar = () => {

    const [isOpen, setOpen] = useState(false);

    const navigation = [
        { name: "Home", href: '/'},
        { name: "O mnie", href: '/about'},
        { name: 'Galeria', href: '/gallery'},
        { name: 'Oferta', href: '/offer'},
        { name: 'Kontakt', href: '/contact'},
    ];

    return(
        <header className="sticky top-0 z-50 border-b border-[var(--gold)]/15 bg-[var(--background)]/90 backdrop-blur-xl">
            <nav className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="flex h-20 items-center justify-between sm:h-24">

                    <Link
                        to="/"
                        className="
                            flex items-center gap-3 rounded-full
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4
                            focus-visible:ring-offset-[var(--background)]
                        "
                    >
                        <img
                            src={logo}
                            alt="Logo"
                            className="
                                h-11 w-11 rounded-full border border-[var(--gold)]/40 object-cover
                                sm:h-13 sm:w-13
                            "
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold tracking-wide text-[var(--rose)] sm:text-base">
                                Lash&Brow Atelier
                            </span>
                             <span className="text-center text-xs italic text-[var(--rose)]/80 sm:text-sm">
                                by Paulina Tarnowska
                            </span>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) => `
                                    rounded-full px-4 py-2 text-sm font-medium
                                    transition-colors duration-300
                                    focus-visible:outline-none focus-visible:ring-2
                                    focus-visible:ring-[var(--gold)]
                                    ${isActive
                                        ? "bg-[var(--gold)]/12 text-white"
                                        : "text-white/60 hover:bg-white/[0.04] hover:text-[var(--gold)]"
                                    }
                                `}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    <div className="md:hidden">
                        <button
                            type="button"
                            aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
                            aria-expanded={isOpen}
                            onClick={() => setOpen(!isOpen)}
                            className="
                                flex h-11 w-11 cursor-pointer items-center justify-center
                                rounded-full border border-[var(--gold)]/35 text-[var(--gold)]
                                transition-colors hover:border-[var(--gold)] hover:bg-[var(--gold)]/10
                                focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-[var(--gold)]
                            "
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>

                {isOpen && (
                    <div className="grid gap-1 border-t border-[var(--gold)]/15 py-4 md:hidden">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) => `
                                    rounded-2xl px-4 py-3 text-center text-sm font-medium
                                    transition-colors
                                    ${isActive
                                        ? "bg-[var(--gold)]/12 text-white"
                                        : "text-[var(--gold)] hover:bg-white/[0.04]"
                                    }
                                `}
                                onClick={() => setOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
