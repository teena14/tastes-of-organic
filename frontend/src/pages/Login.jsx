import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { login } from "../slices/authSlice";
import { loginUser } from "../services/authApi";
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

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = await loginUser(form.email, form.password);
            dispatch(login({ user: data.user, token: data.token }));
            toast.success(`Welcome back, ${data.user.name} 🌿`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

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
                className="login-left-panel"
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
                        Pure. Traceable. Himalayan.
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
                        Good food starts with<br />knowing where it comes from.
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
                        From the terraced fields of Chamoli to your kitchen — every product
                        carries the name of the family that grew it.
                    </p>

                    {/* Trust badges */}
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "36px",
                            flexWrap: "wrap",
                        }}
                    >
                        {["🌿 100% Organic", "🏔️ From Uttarakhand", "🤝 Fair Trade"].map(
                            (badge) => (
                                <span
                                    key={badge}
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.15)",
                                        backdropFilter: "blur(6px)",
                                        border: "1px solid rgba(255,255,255,0.25)",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        padding: "7px 14px",
                                        borderRadius: "999px",
                                    }}
                                >
                                    {badge}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ── Right panel: login form ── */}
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
                            Welcome back
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
                            Sign in to your account
                        </h1>
                        <p style={{ color: C.muted, fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
                            Don't have an account?{" "}
                            <Link
                                to="/register"
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
                                Create one here
                            </Link>
                        </p>
                    </div>

                    {/* Divider line */}
                    <div
                        style={{
                            width: "40px",
                            height: "3px",
                            borderRadius: "999px",
                            backgroundColor: C.sage,
                            marginBottom: "32px",
                        }}
                    />

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                                id="login-email"
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
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Your password"
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
                        </div>

                        {/* Submit button */}
                        <button
                            id="login-submit"
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
                                transition: "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,32,0.28)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = "#144d19";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 6px 22px rgba(27,94,32,0.36)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = C.primary;
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(27,94,32,0.28)";
                                }
                            }}
                        >
                            {loading ? "Signing in…" : "Sign In"}
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
                        By signing in, you agree to our{" "}
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
                    .login-left-panel {
                        display: block !important;
                    }
                }
                @import url('https://fonts.googleapis.com/css2?family=Abel&family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
};

export default Login;
