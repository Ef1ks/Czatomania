import React from 'react';
import {loginStore} from "../store/loginStore.js";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {toast} from "sonner";


const LogoutButton = () => {

    const user = loginStore((state) => state.user)
    const setUser = loginStore((state) => state.setUser)

    const queryClient = useQueryClient()


    const {mutate} = useMutation({
        mutationFn: () => {
            return axios.post("http://localhost:8000/api/logout", {}, {
                withCredentials: true,
            })
        },
        onSuccess: (response) => {
            toast.success("Wylogowano pomyslnie", {
                description: response.data.message
            })
            setUser(null)
        },
        onError: (error) => {
            toast.error("Blad", {
                description: error.response.message
            })
        }
    })

    const logout = () => {
        queryClient.clear();
        mutate()
    }

    if (!user?.username) {
        return null
    }

    return (
        <button className={"mt-10 cursor-pointer border-2 rounded-md py-2 px-6"}
                onClick={() => logout()}>Wyloguj
        </button>
    );
};

export default LogoutButton;