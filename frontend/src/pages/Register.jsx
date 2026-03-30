import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { login } from "../slices/authSlice";
import { registerUser, googleAuthApi } from "../services/authApi";
import { useGoogleLogin } from "@react-oauth/google";
import loginBg from "../assets/login_bg.png";
import logo from "../assets/logo.png";

/* ─── Theme colours (matching site palette) ─────────────── */
const C = {
    bg: "#F8F6F0",
    primary: "#1B5E20",
    sage: "#C8D9B0",
    sageLight: "#E8F0DC",
    sageDeep: "#A8C58A",
    cream: "#FDFBF5",
    text: "#1a1a1a",
    muted: "#6B7280",
    border: "#E2ECDA",
};

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        try {
            setLoading(true);
            const data = await registerUser(form.name, form.email, form.password);
            dispatch(login({ user: data.user, token: data.token }));
            toast.success("Welcome to Tastes of Organic! 🌿");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const data = await googleAuthApi(tokenResponse.access_token);
                dispatch(login({ user: data.user, token: data.token }));
                toast.success(`Welcome to Tastes of Organic, ${data.user.name}! 🌿`);
                navigate("/");
            } catch (err) {
                toast.error(err?.response?.data?.message || "Google Authentication failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Registration Failed");
        }
    });

    const inputStyle = (field) => ({
        width: "100%",
        padding: "13px 16px",
        border: `1.5px solid ${focusedField === field ? C.primary : C.border}`,
        borderRadius: "10px",
        backgroundColor: focusedField === field ? "#fff" : C.cream,
        fontSize: "14px",
        color: C.text,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: focusedField === field ? `0 0 0 3px rgba(27,94,32,0.08)` : "none",
        fontFamily: "Poppins, sans-serif",
    });

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                fontFamily: "Poppins, sans-serif",
                backgroundColor: C.bg,
            }}
        >
            {/* ── Left panel: background image with overlay ── */}
            <div
                style={{
                    flex: "1 1 55%",
                    position: "relative",
                    overflow: "hidden",
                    display: "none",
                }}
                className="register-left-panel"
            >
                <img
                    src={loginBg}
                    alt="Organic farms of Uttarakhand"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                    }}
                />
                {/* Dark gradient overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(135deg, rgba(27,94,32,0.75) 0%, rgba(0,0,0,0.4) 100%)",
                    }}
                />
                {/* Text content */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "56px 52px",
                    }}
                >
                    <p
                        style={{
                            color: C.sageDeep,
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            marginBottom: "14px",
                            marginTop: 0,
                        }}
                    >
                        Join our community
                    </p>
                    <h2
                        style={{
                            fontFamily: "Abel, sans-serif",
                            fontSize: "clamp(28px, 3.2vw, 44px)",
                            color: "#fff",
                            lineHeight: 1.2,
                            marginBottom: "18px",
                            marginTop: 0,
                            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        Become part of a<br />cleaner food story.
                    </h2>
                    <p
                        style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "13px",
                            lineHeight: 1.8,
                            maxWidth: "380px",
                            margin: 0,
                        }}
                    >
                        Join 50,000+ families who've chosen to eat with purpose. Every order
                        supports a farming family in the Himalayas.
                    </p>

                    {/* Benefits */}
                    <div
                        style={{
                            marginTop: "36px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {[
                            "✦  Free delivery on first order",
                            "✦  Exclusive member pricing",
                            "✦  Early access to seasonal drops",
                        ].map((benefit) => (
                            <p
                                key={benefit}
                                style={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: "13px",
                                    margin: 0,
                                    fontWeight: 500,
                                }}
                            >
                                {benefit}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel: registration form ── */}
            <div
                style={{
                    flex: "1 1 45%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 32px",
                    backgroundColor: C.cream,
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ width: "100%", maxWidth: "380px" }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <img
                            src={logo}
                            alt="Tastes of Organic"
                            style={{ height: "52px", objectFit: "contain" }}
                        />
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: "32px" }}>
                        <p
                            style={{
                                color: C.primary,
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                marginBottom: "8px",
                                marginTop: 0,
                            }}
                        >
                            New here?
                        </p>
                        <h1
                            style={{
                                fontFamily: "Abel, sans-serif",
                                fontSize: "32px",
                                color: C.text,
                                lineHeight: 1.2,
                                marginBottom: "8px",
                                marginTop: 0,
                                fontWeight: 400,
                            }}
                        >
                            Create your account
                        </h1>
                        <p style={{ color: C.muted, fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                style={{
                                    color: C.primary,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.textDecoration = "underline")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.textDecoration = "none")
                                }
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={() => googleLogin()}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginBottom: "20px",
                            backgroundColor: "#fff",
                            color: C.text,
                            border: `1px solid ${C.border}`,
                            borderRadius: "10px",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = "#fafafa";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = "#fff";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                            }
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
                        <span style={{ margin: "0 12px", fontSize: "12px", color: C.muted, fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                    >
                        {/* Full Name */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: C.text,
                                    marginBottom: "7px",
                                    letterSpacing: "0.03em",
                                }}
                            >
                                Full name
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                onFocus={() => setFocusedField("name")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Priya Sharma"
                                required
                                style={inputStyle("name")}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: C.text,
                                    marginBottom: "7px",
                                    letterSpacing: "0.03em",
                                }}
                            >
                                Email address
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="you@example.com"
                                required
                                style={inputStyle("email")}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: C.text,
                                    marginBottom: "7px",
                                    letterSpacing: "0.03em",
                                }}
                            >
                                Password{" "}
                                <span style={{ color: C.muted, fontWeight: 400 }}>(min. 6 chars)</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Create a strong password"
                                    required
                                    style={{ ...inputStyle("password"), paddingRight: "44px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: C.muted,
                                        fontSize: "13px",
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {form.password.length > 0 && (
                                <div style={{ marginTop: "8px", display: "flex", gap: "4px", alignItems: "center" }}>
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1,
                                                height: "3px",
                                                borderRadius: "999px",
                                                backgroundColor:
                                                    form.password.length >= level * 3
                                                        ? level <= 2
                                                            ? "#F59E0B"
                                                            : C.primary
                                                        : C.border,
                                                transition: "background-color 0.2s ease",
                                            }}
                                        />
                                    ))}
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color:
                                                form.password.length >= 12
                                                    ? C.primary
                                                    : form.password.length >= 6
                                                    ? "#F59E0B"
                                                    : "#EF4444",
                                            marginLeft: "6px",
                                            fontWeight: 600,
                                            minWidth: "32px",
                                        }}
                                    >
                                        {form.password.length >= 12
                                            ? "Strong"
                                            : form.password.length >= 6
                                            ? "Fair"
                                            : "Weak"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: "4px",
                                width: "100%",
                                padding: "14px",
                                backgroundColor: loading ? C.sageDeep : C.primary,
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                                letterSpacing: "0.03em",
                                transition:
                                    "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,32,0.28)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = "#144d19";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 6px 22px rgba(27,94,32,0.36)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = C.primary;
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 16px rgba(27,94,32,0.28)";
                                }
                            }}
                        >
                            {loading ? "Creating account…" : "Create Account"}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "12px",
                            color: C.muted,
                            marginTop: "32px",
                            lineHeight: 1.7,
                        }}
                    >
                        By creating an account, you agree to our{" "}
                        <span style={{ color: C.primary, fontWeight: 500, cursor: "pointer" }}>
                            Terms
                        </span>{" "}
                        &{" "}
                        <span style={{ color: C.primary, fontWeight: 500, cursor: "pointer" }}>
                            Privacy Policy
                        </span>
                        .
                    </p>
                </div>
            </div>

            {/* ── Responsive styles ── */}
            <style>{`
                @media (min-width: 768px) {
                    .register-left-panel {
                        display: block !important;
                    }
                }
                @import url('https://fonts.googleapis.com/css2?family=Abel&family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
};

export default Register;
