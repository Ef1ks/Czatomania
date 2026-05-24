import React, {useEffect, useState} from 'react';
import {useChatStore} from "../store/useChatStore.js";
import {loginStore} from "../store/loginStore.js";

const Contacts = ({activeUsers}) => {
    const [users, setUsers] = useState({});
    const activeRecipient = useChatStore((state) => state.activeRecipient);
    const setActiveRecipient = useChatStore((state) => state.setActiveRecipient);
    const clearActiveRecipient = useChatStore((state) => state.clearActiveRecipient);
    const user = loginStore((state) => state.user);


    useEffect(() => {
        if (activeUsers && (activeUsers.type === 'USER_JOINED' || activeUsers.type === 'USER_LEFT')) {
            console.log("Aktualizacja listy użytkowników:", activeUsers.data);
            setUsers(activeUsers.data);
        }
    }, [activeUsers]);

    const usersList = Object.entries(users);

    return (
        <div className="flex flex-col w-1/4 h-full bg-[#111111] border-r border-[#1F1F1F] p-4 text-[#F5F5F5]">
            <h3 className="text-sm font-bold text-[#F26122] mb-4 uppercase tracking-wider">
                Aktywni użytkownicy ({usersList.length})
            </h3>
            <ul className="flex-1 flex flex-col gap-2 overflow-y-auto mb-4">
                {usersList.map(([uuid, userData]) => {
                    const isSelected = activeRecipient?.uuid === uuid;

                    return (
                        <li
                            key={uuid}
                            className={`flex items-center gap-3 p-2 rounded-md bg-[#1F1F1F] border transition-colors ${
                                isSelected
                                    ? 'border-[#F26122] bg-[#111111]'
                                    : 'border-transparent hover:border-[#E50914]'
                            }`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>

                            <div className="flex flex-col truncate w-full">
                                <span className="font-semibold text-[#F5F5F5] truncate">
                                    {userData.username}
                                </span>
                                {user && user.uuid !== uuid ?
                                    <button
                                        onClick={() => setActiveRecipient({uuid, username: userData.username})}
                                        className={`text-[11px] text-left mt-0.5 font-medium transition-colors cursor-pointer ${
                                            isSelected ? 'text-[#F26122]' : 'text-[#737373] hover:text-[#F5F5F5]'
                                        }`}
                                    >
                                        {isSelected ? '● Rozmawiasz' : 'Wyślij wiadomość'}
                                    </button>
                                    : null
                                }


                            </div>
                        </li>
                    );
                })}

                {usersList.length === 0 && (
                    <div className="text-xs text-[#737373] text-center mt-4 italic">
                        Brak aktywnych użytkowników
                    </div>
                )}
            </ul>

            {activeRecipient && (
                <div className="pt-3 border-t border-[#1F1F1F]">
                    <button
                        onClick={clearActiveRecipient}
                        className="flex items-center justify-center gap-2 w-full p-2.5 rounded-md bg-transparent border-2 border-[#F26122] text-[#F26122] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#F26122] hover:text-[#000000] transition-all"
                    >
                        🌐 Czat ogólny
                    </button>
                </div>
            )}
        </div>
    );
};

export default Contacts;