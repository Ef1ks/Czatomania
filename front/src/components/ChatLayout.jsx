import React, {useMemo} from 'react';
import Contacts from "./Contacts.jsx";
import Chat from "./Chat.jsx";
import {loginStore} from "../store/loginStore.js";
import useWebsocket from "react-use-websocket/src/lib/use-websocket.ts";
import throttle from "lodash.throttle";


const ChatLayout = () => {

    const user = loginStore((state) => state.user);


    const WS_URL = 'ws://localhost:8000'

    const {sendJsonMessage, lastJsonMessage} = useWebsocket(WS_URL,

        {
            queryParams: user?.username ? {username: user.username} : {},

        }
    )


    const THROTTLE = 50
    const throttledSend = useMemo(() => {
        return throttle((data) => sendJsonMessage(data), THROTTLE);
    }, [sendJsonMessage]);

    return (
        <div className="flex flex-col w-full  ">
            <h1 className="text-4xl font-bold ">
                Zalogowany jako {user.username}
            </h1>
            <h1 className="text-4xl font-bold ">
                ID: {user.uuid}
            </h1>
            <div className="flex flex-row w-full min-h-125 bg-gray-200">
                <Contacts activeUsers={lastJsonMessage}/>
                <Chat onSendMessage={throttledSend} lastJsonMessage={lastJsonMessage}/>
            </div>


        </div>
    );
};

export default ChatLayout;