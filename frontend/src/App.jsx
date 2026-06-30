import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./slices/cartSlice";
import { setWishlist } from "./slices/wishlistSlice";
import { getCart } from "./services/apiClient";
import { getWishlist } from "./services/apiClient";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Combos = lazy(() => import("./pages/Combos"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { pathname } = useLocation();

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  // Load cart and wishlist into Redux on auth change
  useEffect(() => {
    if (isAuthenticated) {
      getCart().then(data => { if (data) dispatch(setCart(data)); }).catch(() => { });
      getWishlist().then(data => { if (data) dispatch(setWishlist(data)); }).catch(() => { });
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#F8F6F0]"><div className="w-10 h-10 border-4 border-[#2C5234] border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/combos" element={<Combos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="/order-success/:orderId" element={
            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;