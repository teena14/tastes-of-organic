import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Heart, ShoppingCart, ChevronDown, User, LogOut, Package, X } from "lucide-react";
import { logout } from "../slices/authSlice";
import { clearCart } from "../slices/cartSlice";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const { totalItems } = useSelector((s) => s.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef(null);
    const searchContainerRef = useRef(null);

    // On pages with a full-bleed coloured banner (home hero, shop banner)
    // the navbar overlays it via absolute positioning.
    // On every other page it is sticky at the top.
    const isOverlay = location.pathname === "/" || location.pathname.startsWith("/shop");

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        toast.success("Logged out");
        navigate("/");
    };

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery("");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            closeSearch();
        }
    };

    // Close search bar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                closeSearch();
            }
        };
        if (searchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeSearch();
        };
        if (searchOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [searchOpen]);

    return (
        <div
            className={isOverlay ? "absolute top-5 left-0 right-0 z-30 flex justify-center px-6" : "sticky top-0 z-30 flex justify-center px-6 py-3"}
            style={isOverlay ? {} : { backgroundColor: "rgba(248,246,240,0.95)", backdropFilter: "blur(8px)" }}
        >
            <nav
                className="w-full bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-between px-8 py-3"
                style={{ maxWidth: "1280px" }}
            >
                {/* Logo */}
                <Link to="/">
                    <img src={logo} alt="Tastes of Organic" className="w-10 h-10 rounded-full object-cover" />
                </Link>

                {/* Nav links — hidden when search is open */}
                {!searchOpen && (
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                        <Link
                            to="/shop"
                            className="flex items-center gap-1 transition-colors"
                            style={{ color: location.pathname.startsWith("/shop") ? "#1B5E20" : undefined }}
                        >
                            Shop <ChevronDown size={14} />
                        </Link>
                        <Link to="/blog" style={{ color: location.pathname === "/blog" ? "#1B5E20" : undefined }} className="transition-colors">
                            Blogs
                        </Link>
                        <Link to="/about" style={{ color: location.pathname === "/about" ? "#1B5E20" : undefined }} className="transition-colors">
                            About us
                        </Link>
                        <Link to="/combos" style={{ color: location.pathname === "/combos" ? "#1B5E20" : undefined }} className="transition-colors">
                            Combos
                        </Link>
                        <Link to="/subscription" style={{ color: location.pathname === "/subscription" ? "#1B5E20" : undefined }} className="transition-colors">
                            Subscription
                        </Link>
                    </div>
                )}

                {/* Expanded search bar */}
                {searchOpen && (
                    <form
                        ref={searchContainerRef}
                        onSubmit={handleSearchSubmit}
                        className="flex-1 mx-4 flex items-center gap-2 rounded-full px-4 py-1.5"
                        style={{ backgroundColor: "#F0F7EB", border: "1.5px solid #1B5E20" }}
                    >
                        <Search size={16} style={{ color: "#1B5E20", flexShrink: 0 }} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for products…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "#333", fontFamily: "Poppins, sans-serif" }}
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery("")} style={{ color: "#888" }}>
                                <X size={14} />
                            </button>
                        )}
                    </form>
                )}

                {/* Right icons */}
                <div className="flex items-center gap-4 text-gray-700">
                    {/* Search toggle */}
                    <button
                        aria-label={searchOpen ? "Close search" : "Open search"}
                        className="hover:opacity-70 transition-opacity hidden sm:block"
                        onClick={searchOpen ? closeSearch : openSearch}
                        style={{ color: searchOpen ? "#1B5E20" : undefined }}
                    >
                        {searchOpen ? <X size={18} /> : <Search size={18} />}
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" aria-label="Wishlist" className="hover:opacity-70 transition-opacity">
                        <Heart size={18} />
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" aria-label="Cart" className="relative hover:opacity-70 transition-opacity">
                        <ShoppingCart size={18} />
                        {totalItems > 0 && (
                            <span
                                className="absolute -top-2 -right-2 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                                style={{ backgroundColor: "#1B5E20" }}
                            >
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {/* Auth */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link to="/orders" aria-label="Orders" className="hover:opacity-70 transition-opacity hidden sm:block">
                                <Package size={18} />
                            </Link>
                            <span className="text-sm font-medium hidden lg:block" style={{ color: "#1B5E20" }}>
                                {user?.name?.split(" ")[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                aria-label="Logout"
                                className="hover:opacity-70 transition-opacity"
                            >
                                <LogOut size={17} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full transition-all"
                            style={{ backgroundColor: "#1B5E20", color: "#fff" }}
                        >
                            <User size={14} /> Login
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
