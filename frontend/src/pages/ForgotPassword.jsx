import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import loginBg from "../assets/login_bg.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

/* ─── Shared input style ───────────────────────── */
const input = (focused) => ({
    width: "100%",
    padding: "13px 16px",
    border: `1.5px solid ${focused ? C.primary : C.border}`,
    borderRadius: "10px",
    backgroundColor: focused ? "#fff" : C.cream,
    fontSize: "14px",
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, background-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(27,94,32,0.08)" : "none",
    fontFamily: "Poppins, sans-serif",
});

const ForgotPassword = () => {
    const navigate = useNavigate();

    // 3 steps: "email" | "otp" | "password"
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);

    // 10-minute countdown for OTP step
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (step !== "otp" || secondsLeft <= 0) return;
        const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [step, secondsLeft]);

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    /* ── Step 1: request OTP ── */
    const sendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Code sent! Check your inbox.");
            setSecondsLeft(10 * 60);
            setStep("otp");
        } catch (err) {
            toast.error(err.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 2: verify OTP ── */
    const verifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Code verified!");
            setStep("password");
        } catch (err) {
            toast.error(err.message || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 3: reset password ── */
    const doReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Password reset! Please sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.message || "Reset failed.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Step metadata ── */
    const steps = ["email", "otp", "password"];
    const stepIdx = steps.indexOf(step);

    const headings = {
        email: { sub: "Forgot your password?", title: "Reset via email", desc: "Enter the email linked to your account and we'll send you a verification code." },
        otp: { sub: "Check your inbox", title: "Enter the code", desc: `We sent a 6-digit code to ${email}. It expires in ${fmt(secondsLeft)}.` },
        password: { sub: "Almost there", title: "Create new password", desc: "Choose a strong password you haven't used before." },
    };
    const h = headings[step];

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Poppins, sans-serif", backgroundColor: C.bg }}>

            {/* ── Left panel ── */}
            <div
                style={{ flex: "1 1 55%", position: "relative", overflow: "hidden", display: "none" }}
                className="fp-left-panel"
            >
                <img src={loginBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(27,94,32,0.75),rgba(0,0,0,0.4))" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "56px 52px" }}>
                    <p style={{ color: C.sageDeep, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "14px", marginTop: 0 }}>
                        Pure. Traceable. Himalayan.
                    </p>
                    <h2 style={{ fontFamily: "Abel, sans-serif", fontSize: "clamp(28px,3.2vw,44px)", color: "#fff", lineHeight: 1.2, marginBottom: "18px", marginTop: 0, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                        Good food starts with<br />knowing where it comes from.
                    </h2>
                </div>
            </div>

            {/* ── Right panel ── */}
            <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", backgroundColor: C.cream, minHeight: "100vh", boxSizing: "border-box" }}>
                <div style={{ width: "100%", maxWidth: "380px" }}>

                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <img src={logo} alt="Tastes of Organic" style={{ height: "52px", objectFit: "contain" }} />
                    </div>

                    {/* Progress dots */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
                        {steps.map((s, i) => (
                            <div
                                key={s}
                                style={{
                                    width: i === stepIdx ? "24px" : "8px",
                                    height: "8px",
                                    borderRadius: "999px",
                                    background: i <= stepIdx ? C.primary : C.sage,
                                    transition: "all 0.3s",
                                }}
                            />
                        ))}
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: "28px" }}>
                        <p style={{ color: C.primary, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px", marginTop: 0 }}>
                            {h.sub}
                        </p>
                        <h1 style={{ fontFamily: "Abel, sans-serif", fontSize: "30px", color: C.text, lineHeight: 1.2, marginBottom: "8px", marginTop: 0, fontWeight: 400 }}>
                            {h.title}
                        </h1>
                        <p style={{ color: C.muted, fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{h.desc}</p>
                    </div>

                    <div style={{ width: "40px", height: "3px", borderRadius: "999px", backgroundColor: C.sage, marginBottom: "28px" }} />

                    {/* ── STEP 1: Email ── */}
                    {step === "email" && (
                        <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "7px", letterSpacing: "0.03em" }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="you@example.com"
                                    required
                                    style={input(focused === "email")}
                                />
                            </div>
                            <Btn loading={loading}>{loading ? "Sending…" : "Send Code"}</Btn>
                        </form>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === "otp" && (
                        <form onSubmit={verifyCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                                    <label style={{ fontSize: "12px", fontWeight: 600, color: C.text, letterSpacing: "0.03em" }}>
                                        6-digit code
                                    </label>
                                    {secondsLeft > 0 ? (
                                        <span style={{ fontSize: "12px", color: secondsLeft < 60 ? "#c62828" : C.muted }}>
                                            Expires in {fmt(secondsLeft)}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { setStep("email"); setOtp(""); }}
                                            style={{ fontSize: "12px", color: C.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                        >
                                            Resend code
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    onFocus={() => setFocused("otp")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="••••••"
                                    required
                                    style={{ ...input(focused === "otp"), letterSpacing: "8px", fontSize: "20px", textAlign: "center" }}
                                />
                            </div>
                            <Btn loading={loading}>{loading ? "Verifying…" : "Verify Code"}</Btn>
                            <button
                                type="button"
                                onClick={() => { setStep("email"); setOtp(""); }}
                                style={{ background: "none", border: "none", color: C.muted, fontSize: "13px", cursor: "pointer", textAlign: "center" }}
                            >
                                ← Use a different email
                            </button>
                        </form>
                    )}

                    {/* ── STEP 3: New Password ── */}
                    {step === "password" && (
                        <form onSubmit={doReset} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "7px", letterSpacing: "0.03em" }}>
                                    New password
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        onFocus={() => setFocused("new")}
                                        onBlur={() => setFocused(null)}
                                        placeholder="Min. 6 characters"
                                        required
                                        style={{ ...input(focused === "new"), paddingRight: "44px" }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: "13px", padding: 0 }}>
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "7px", letterSpacing: "0.03em" }}>
                                    Confirm password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocused("confirm")}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Repeat your password"
                                    required
                                    style={input(focused === "confirm")}
                                />
                            </div>
                            <Btn loading={loading}>{loading ? "Resetting…" : "Reset Password"}</Btn>
                        </form>
                    )}

                    {/* Back to login */}
                    <p style={{ textAlign: "center", fontSize: "13px", color: C.muted, marginTop: "28px" }}>
                        Remember your password?{" "}
                        <Link to="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) { .fp-left-panel { display: block !important; } }
                @import url('https://fonts.googleapis.com/css2?family=Abel&family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
};

/* ─── Shared submit button ─────────────────────── */
const Btn = ({ loading, children }) => (
    <button
        type="submit"
        disabled={loading}
        style={{
            marginTop: "4px", width: "100%", padding: "14px",
            backgroundColor: loading ? "#A8C58A" : "#1B5E20",
            color: "#fff", border: "none", borderRadius: "10px",
            fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.03em",
            transition: "background-color 0.2s, transform 0.15s, box-shadow 0.2s",
            boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,32,0.28)",
        }}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "#144d19"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "#1B5E20"; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
        {children}
    </button>
);

export default ForgotPassword;
