import { createSlice } from "@reduxjs/toolkit";

const DISCOUNT_MAP = { 3: 10, 6: 15, 12: 20 };

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState: {
        selectedPlan: null, // 3, 6, or 12
        items: [] // [{ product, quantity }]
    },
    reducers: {
        selectPlan(state, action) {
            state.selectedPlan = action.payload;
        },
        addSubscriptionItem(state, action) {
            const existing = state.items.find(
                i => i.product._id === action.payload._id
            );
            if (existing) {
                existing.quantity += 1;
            } else {
                state.items.push({ product: action.payload, quantity: 1 });
            }
        },
        updateSubscriptionItem(state, action) {
            const { productId, quantity } = action.payload;
            const item = state.items.find(i => i.product._id === productId);
            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter(i => i.product._id !== productId);
                } else {
                    item.quantity = quantity;
                }
            }
        },
        removeSubscriptionItem(state, action) {
            state.items = state.items.filter(i => i.product._id !== action.payload);
        },
        clearSubscription(state) {
            state.selectedPlan = null;
            state.items = [];
        }
    }
});

export const {
    selectPlan,
    addSubscriptionItem,
    updateSubscriptionItem,
    removeSubscriptionItem,
    clearSubscription
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
