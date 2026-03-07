import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, Heart, ShoppingCart, ChevronDown, User, LogOut, Package } from "lucide-react";
import { logout } from "../slices/authSlice";
import { clearCart } from "../slices/cartSlice";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const { totalItems } = useSelector((s) => s.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // On the home page the navbar overlays the hero image → keep it absolute
    // On every other page → sticky at the top of the viewport
    const isHome = location.pathname === "/";

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        toast.success("Logged out");
        navigate("/");
    };

    return (
        <div
            className={isHome ? "absolute top-5 left-0 right-0 z-30 flex justify-center px-6" : "sticky top-0 z-30 flex justify-center px-6 py-3"}
            style={isHome ? {} : { backgroundColor: "rgba(248,246,240,0.95)", backdropFilter: "blur(8px)" }}
        >
            <nav
                className="w-full bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-between px-8 py-3"
                style={{ maxWidth: "1280px" }}
            >
                {/* Logo */}
                <Link to="/">
                    <img src={logo} alt="Tastes of Organic" className="w-10 h-10 rounded-full object-cover" />
                </Link>

                {/* Nav links */}
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

                {/* Right icons */}
                <div className="flex items-center gap-4 text-gray-700">
                    {/* Search */}
                    <button
                        aria-label="Search"
                        className="hover:opacity-70 transition-opacity hidden sm:block"
                        onClick={() => navigate("/shop")}
                    >
                        <Search size={18} />
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
