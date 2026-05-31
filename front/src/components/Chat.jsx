import React, {useEffect, useMemo, useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

import ChatWindow from "./ChatWindow";
import {useChatStore} from "../store/useChatStore.js";
import {loginStore} from "../store/loginStore.js";

const fetchMessagesHistory = async () => {
    const response = await axios.get('http://localhost:8000/api/messages', {withCredentials: true});
    return response.data;
};
const fetchMessagesHistoryPrivate = async (uuid) => {
    const response = await axios.get('http://localhost:8000/api/messages/private', {
        withCredentials: true,
        params: {
            recipientUuid: uuid
        }
    });
    return response.data;
};

const Chat = ({onSendMessage, lastJsonMessage}) => {
    const activeRecipient = useChatStore((state) => state.activeRecipient);
    const currentUser = loginStore((state) => state.user);


    const {data: globalHistory, isLoading} = useQuery({
        queryKey: ['messagesHistory'],
        queryFn: fetchMessagesHistory,
        staleTime: Infinity,
    });

    const {data: privateHistory, isLoading: isPrivateLoading} = useQuery({
        queryKey: ['messagesHistoryPrivate', activeRecipient?.uuid], // Poprawiona literówka
        queryFn: () => fetchMessagesHistoryPrivate(activeRecipient?.uuid),
        staleTime: Infinity,
        enabled: !!activeRecipient?.uuid,
    })


    const [globalLiveMessages, setGlobalLiveMessages] = useState([]);
    const [privateLiveMessages, setPrivateLiveMessages] = useState({});


    useEffect(() => {
        if (!lastJsonMessage || lastJsonMessage.type !== 'NEW_MESSAGE') return;

        const messageData = lastJsonMessage.data;
        if (!messageData) return;

        if (messageData.type === 'PRIVATE_MESSAGE') {
            const chatPartnerUuid = messageData.senderUuid === currentUser?.uuid
                ? messageData.recipientUuid
                : messageData.senderUuid;

            if (chatPartnerUuid) {
                setPrivateLiveMessages((prev) => ({
                    ...prev,
                    [chatPartnerUuid]: [...(prev[chatPartnerUuid] || []), messageData]
                }));
            }
        } else if (messageData.type === 'GLOBAL_MESSAGE' || !messageData.type) {
            setGlobalLiveMessages((prev) => [...prev, messageData]);
        }
    }, [lastJsonMessage, currentUser?.uuid]);

    const globalMessages = useMemo(() => {
        const historyArray = globalHistory || [];
        const uniqueLive = globalLiveMessages.filter(
            (liveMsg) => !historyArray.some((histMsg) => histMsg._id === liveMsg._id)
        );

        return [...historyArray, ...uniqueLive];
    }, [globalHistory, globalLiveMessages]);


    const privateMessages = useMemo(() => {
        const historyArray = privateHistory || [];
        const liveArray = activeRecipient?.uuid ? (privateLiveMessages[activeRecipient.uuid] || []) : [];
        const uniqueLive = liveArray.filter(
            (liveMsg) => !historyArray.some((histMsg) => histMsg._id === liveMsg._id)
        );

        return [...historyArray, ...uniqueLive];
    }, [privateHistory, privateLiveMessages, activeRecipient?.uuid]);


    const handleSendMessage = (text) => {
        if (activeRecipient) {
            onSendMessage({
                type: "PRIVATE_MESSAGE",
                recipientUuid: activeRecipient.uuid,
                message: text
            });
        } else {
            onSendMessage({message: text, type: "GLOBAL_MESSAGE"});
        }
    };

    const chatTitle = activeRecipient
        ? `💬 Rozmowa z: ${activeRecipient.username}`
        : "🌐 Czat ogólny";

    const currentMessages = activeRecipient
        ? privateMessages
        : globalMessages;

    if (isLoading && !activeRecipient) {
        return <div className="p-4 text-[#737373]">Ładowanie historii...</div>;
    }

    return (
        <ChatWindow
            title={chatTitle}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
        />
    );
};

export default Chat;