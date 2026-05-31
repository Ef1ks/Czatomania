import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {loginStore} from '../store/loginStore.js';

const fetchCurrentUser = async () => {
    const response = await axios.get("http://localhost:8000/api/me", {
        withCredentials: true,
    });
    return response.data;
};

export const AuthProvider = ({children}) => {
    const setUser = loginStore((state) => state.setUser);
    const clearUser = loginStore((state) => state.deleteUser);

    const {data, isLoading, isError} = useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (data?.user) {
            setUser(data.user);
        } else if (isError) {
            clearUser();
        }
    }, [data, isError, setUser, clearUser]);

    return <>{children}</>;
};