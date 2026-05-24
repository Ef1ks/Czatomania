import {loginStore} from "./store/loginStore.js";
import Login from "./components/Login.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import ChatLayout from "./components/ChatLayout.jsx";

const App = () => {

    const user = loginStore((state) => state.user)

    console.log(user)

    return (
        <div className="flex justify-center items-center flex-col h-screen max-w-250 w-full">
            <h1>Hello, React!</h1>
            {user?.username ? <ChatLayout/> : <Login/>}
            <LogoutButton/>

        </div>
    );
};

export default App;