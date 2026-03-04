import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { login } from "../slices/authSlice";
import { loginUser } from "../services/authApi";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = await loginUser(form.email, form.password);
            dispatch(login({ user: data.user, token: data.token }));
            toast.success(`Welcome, ${data.user.name}`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: "16px", maxWidth: "360px" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <label>Password:</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <br />
                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
            <p>No account? <Link to="/register">Register</Link></p>
        </div>
    );
};

export default Login;
