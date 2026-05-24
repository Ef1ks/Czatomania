import {create} from 'zustand';
import {persist} from 'zustand/middleware'; // Importujemy middleware do zapisu

export const useChatStore = create(
    persist(
        (set) => ({
            // Stan początkowy (Zustand sam sprawdzi, czy coś jest w localStorage)
            activeRecipient: null,

            // Akcja ustawiająca wybranego użytkownika
            setActiveRecipient: (user) => set({activeRecipient: user}),

            // Akcja do czyszczenia wyboru (powrót do czatu ogólnego)
            clearActiveRecipient: () => set({activeRecipient: null}),
        }),
        {
            // Unikalna nazwa klucza w localStorage przeglądarki
            name: 'chat-recipient-storage',
        }
    )
);