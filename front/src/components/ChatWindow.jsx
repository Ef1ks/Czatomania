import React, {useEffect, useRef} from 'react';
import {useForm} from "react-hook-form";
import {loginStore} from "../store/loginStore.js";

const ChatWindow = ({messages, onSendMessage, title}) => {
    const messagesEndRef = useRef(null);
    const isInitialLoad = useRef(true);
    const {register, handleSubmit, reset} = useForm();
    const user = loginStore(state => state.user)
    // Zarządzanie scrollem przy ładowaniu nowych paczek wiadomości
    useEffect(() => {
        if (messages.length > 0 && messagesEndRef.current) {
            if (isInitialLoad.current) {
                messagesEndRef.current.scrollIntoView({behavior: "auto"});
                isInitialLoad.current = false;
            } else {
                messagesEndRef.current.scrollIntoView({behavior: "smooth"});
            }
        }
    }, [messages]);

    useEffect(() => {
        isInitialLoad.current = true;
    }, [title]);

    const handleSend = (data) => {
        if (!data.message || !data.message.trim()) return;
        onSendMessage(data.message);
        reset();
    };

    return (
        <div className="flex flex-col w-3/4 h-125 bg-[#1F1F1F] p-4 rounded-r-md">
            <div className="pb-3 mb-3 border-b border-[#1F1F1F] flex items-center justify-between">
                <span className="text-[#F5F5F5] font-bold text-lg tracking-wide">
                    {title}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#F26122] animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2 bg-[#000000] rounded-md mb-4">
                {messages.map((msg) => {
                    const isOwnMessage = user && msg.senderUuid === user.uuid;

                    return (
                        <div key={msg._id} className="p-2 rounded bg-[#111111] border border-[#1F1F1F]">
                            <span className={`font-bold text-sm mr-2 transition-colors ${
                                isOwnMessage ? 'text-green-400' : 'text-[#F26122]'
                            }`}>
                {msg.username}:
            </span>

                            <span className="text-[#F5F5F5]">{msg.message}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}/>
            </div>

            {/* Panel wpisywania */}
            <form onSubmit={handleSubmit(handleSend)} className="flex gap-2">
                <input
                    type="text"
                    {...register("message")}
                    className="flex-1 bg-[#000000] text-[#F5F5F5] border border-[#1F1F1F] rounded-md p-2 outline-none focus:border-[#F26122]"
                    placeholder="Napisz wiadomość..."
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="bg-[#F26122] text-[#000000] font-bold px-6 rounded-md cursor-pointer hover:bg-[#E50914] transition-colors"
                >
                    Wyślij
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;