import {create} from "zustand";

export const loginStore = create((set) => ({
    user: null,
    setUser: (user) => set({user}),
    deleteUser: () => set({user: null}),
}));