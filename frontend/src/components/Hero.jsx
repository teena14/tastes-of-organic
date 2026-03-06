import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Heart, ShoppingCart, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";
import hero from "../assets/hero_section_image.png";

const Hero = () => {
    const { totalItems } = useSelector((s) => s.cart);

    return (
        <section className="relative h-[520px] w-full overflow-hidden">

            {/* Background */}
            <img src={hero} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />

            {/* ── Floating pill navbar — wide, small side margins ── */}
            <nav
                className="absolute top-5 left-1/2 -translate-x-1/2 z-20
                   bg-white/95 backdrop-blur-sm rounded-full shadow-lg
                   flex items-center justify-between px-8 py-3"
                style={{ width: "calc(100% - 48px)" }}   /* full width minus 24px each side */
            >
                <Link to="/">
                    <img src={logo} alt="logo" className="w-10 h-10 rounded-full object-cover" />
                </Link>

                {/* Nav links — Poppins Regular */}
                <div className="hidden md:flex items-center gap-8 text-sm font-poppins font-normal text-gray-800">
                    <Link to="/shop" className="flex items-center gap-1 hover:text-primary transition-colors">
                        Shop <ChevronDown size={14} />
                    </Link>
                    <Link to="/blog" className="hover:text-primary transition-colors">Blogs</Link>
                    <Link to="/about" className="hover:text-primary transition-colors">About us</Link>
                    <Link to="/combos" className="hover:text-primary transition-colors">Combos</Link>
                    <Link to="/subscription" className="hover:text-primary transition-colors">Subscription</Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-700">
                    <button aria-label="Search" className="hover:text-primary transition-colors"><Search size={18} /></button>
                    <Link to="/wishlist" aria-label="Wishlist" className="hover:text-primary transition-colors"><Heart size={18} /></Link>
                    <Link to="/cart" aria-label="Cart" className="relative hover:text-primary transition-colors">
                        <ShoppingCart size={18} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>

            {/* ── Hero text ── */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-4">
                {/* "Rooted & Pure" — Poppins light */}
                <p className="font-poppins font-light tracking-[0.35em] text-sm uppercase mb-2 text-white/80">
                    Rooted &amp; Pure
                </p>
                {/* Main title — Abel */}
                <h1 className="font-abel text-5xl md:text-6xl leading-tight drop-shadow-lg uppercase tracking-wide">
                    Taste of Organics
                </h1>
                {/* Subtitle — Poppins */}
                <p className="font-poppins font-light mt-4 text-base text-white/85 max-w-md">
                    We are proud of our natural produce and our farmer's
                </p>
                <Link to="/shop">
                    <button className="mt-7 border border-white/60 bg-white/20 backdrop-blur-sm text-white
                             font-poppins font-medium px-10 py-3 rounded-full text-sm tracking-wide
                             hover:bg-white/30 transition-all duration-200">
                        Explore
                    </button>
                </Link>
            </div>

        </section>
    );
};

export default Hero;
