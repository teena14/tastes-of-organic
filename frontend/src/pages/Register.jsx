import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { login } from "../slices/authSlice";
import { registerUser } from "../services/authApi";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error("Password min 6 chars"); return; }
        try {
            setLoading(true);
            const data = await registerUser(form.name, form.email, form.password);
            dispatch(login({ user: data.user, token: data.token }));
            toast.success("Account created!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: "16px", maxWidth: "360px" }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <label>Email:</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <label>Password:</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <br />
                <button type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
            </form>
            <p>Have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Register;
