import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from '../assets/head-images/logo.png';
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
        <header className="sticky top-0 z-50 shadow-md bg-[var(--background)] pt-2">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-around items-center h-20">

                    <Link to='/' className="flex items-center space-x-3">
                        <img src={logo} alt="Logo" className="h-8 w-auto sm:h-10 rounded-full" />
                        <div className="flex flex-col leading-tight text-white">
                            <span className="text-sm sm:text-base font-semibold text-[var(--rose)]">
                                Lash&Brow Atelier
                            </span>
                             <span className="text-xs sm:text-sm italic text-[var(--rose)] text-center">
                                by Paulina Tarnowska
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex space-x-6 items-center">
                        {navigation.map((item) => (
                            <NavLink key={item.name} to={item.href} className={({ isActive }) => `${
                                isActive
                                ? "text-white"
                                : "text-[var(--gold)] hover:text-white font-medium"
                                }`
                                }>
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setOpen(!isOpen)} className="text-[var(--gold)] focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>

                {isOpen && (
                    <div className="md:hidden mt-2 space-y-2 pb-4">
                        {navigation.map((item) => (
                            <NavLink key={item.name} to={item.href} className={({ isActive }) => 
                                `block text-center ${isActive
                                    ? "text-white"
                                    : "text-[var(--gold)]" 
                                 }`
                                 }
                                  onClick={() => setOpen(false)}>
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>
           <div className='w-4/5 mx-auto h-px bg-[var(--gold)]/50' />
        </header>
    );
}

export default Navbar;