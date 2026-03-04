import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        productIds: [] // array of product _id strings for quick lookup
    },
    reducers: {
        setWishlist(state, action) {
            // action.payload is array of product objects or ids
            state.productIds = action.payload.map(item =>
                typeof item === "string" ? item : item._id
            );
        },
        addToWishlistLocal(state, action) {
            if (!state.productIds.includes(action.payload)) {
                state.productIds.push(action.payload);
            }
        },
        removeFromWishlistLocal(state, action) {
            state.productIds = state.productIds.filter(id => id !== action.payload);
        }
    }
});

export const { setWishlist, addToWishlistLocal, removeFromWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
