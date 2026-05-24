import {useForm} from "react-hook-form";
import {loginStore} from "../store/loginStore.js";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {toast} from "sonner";

const Login = () => {

    const setUser = loginStore((state) => state.setUser)
    const {register, handleSubmit} = useForm();

    const {mutate} = useMutation({
        mutationFn: (data) => {
            return axios.post("http://localhost:8000/api/login", data, {
                withCredentials: true,
            })
        },
        onSuccess: (response) => {
            toast.success("Zalgoowano pomyslnie", {
                description: `Użytkownik ${response.data.user.username}`
            })

            if (response.data?.user.username || response.data?.success) {
                setUser(response.data.user);
            }
        },
        onError: (error) => {
            toast.error("Blad", {
                description: error.response.message
            })
        }
    })

    const onSumbit = (data) => {
        mutate(data)
    }

    return (
        <form className="flex flex-col gap-2 justify-center items-center border-2 p-5 rounded-md"
              onSubmit={handleSubmit(onSumbit)}>
            <label id="username"> Podaj swój nick!</label>
            <input className={"border-2 m-2 rounded-lg p-2"} type="text"
                   placeholder="Twoja nazwa..." {...register("username")}/>
            <label id="username"> Podaj swoje hasło!</label>
            <input className={"border-2 m-2 rounded-lg p-2"} type="password"
                   placeholder="Twoje hasło..." {...register("password")}/>
            <button className={"border-2 m-2 cursor-pointer rounded-xl px-6 py-2"} type="submit">Zaloguj</button>
        </form>
    );
};

export default Login;