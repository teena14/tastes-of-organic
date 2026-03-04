import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
        totalItems: 0
    },
    reducers: {
        setCart(state, action) {
            state.items = action.payload.items ?? [];
            state.subtotal = action.payload.subtotal ?? 0;
            state.delivery = action.payload.delivery ?? 0;
            state.total = action.payload.total ?? 0;
            state.totalItems = action.payload.totalItems ?? 0;
        },
        clearCart(state) {
            state.items = [];
            state.subtotal = 0;
            state.delivery = 0;
            state.total = 0;
            state.totalItems = 0;
        }
    }
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
