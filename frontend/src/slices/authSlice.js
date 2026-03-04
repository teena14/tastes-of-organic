import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("authToken");
const user = (() => {
    try {
        return JSON.parse(localStorage.getItem("authUser")) || null;
    } catch {
        return null;
    }
})();

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: user,
        token: token,
        isAuthenticated: !!token
    },
    reducers: {
        login(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("authToken", action.payload.token);
            localStorage.setItem("authUser", JSON.stringify(action.payload.user));
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
        },
        setUser(state, action) {
            state.user = action.payload;
            localStorage.setItem("authUser", JSON.stringify(action.payload));
        }
    }
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
