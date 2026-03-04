import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import { clearCart } from "../slices/cartSlice";
import toast from "react-hot-toast";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector(s => s.auth);
    const { totalItems } = useSelector(s => s.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        toast.success("Logged out");
        navigate("/");
    };

    return (
        <nav style={{ borderBottom: "1px solid #ccc", padding: "8px 16px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/"><strong>🌿 Tastes of Organic</strong></Link>
            <Link to="/shop">Shop</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/about">About</Link>
            <Link to="/subscription">Subscription</Link>
            <Link to="/cart">Cart {totalItems > 0 ? `(${totalItems})` : ""}</Link>
            <Link to="/wishlist">Wishlist</Link>
            {isAuthenticated ? (
                <>
                    <span>Hi, {user?.name}</span>
                    <Link to="/orders">Orders</Link>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
