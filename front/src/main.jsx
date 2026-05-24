import {createRoot} from 'react-dom/client'
import './index.css'
import App from "./App.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "sonner";
import {AuthProvider} from "./components/AuthProvider.jsx";
import {StrictMode} from "react";

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App/>
                <Toaster position={'top-right'}/>
            </AuthProvider>

        </QueryClientProvider>
        // </StrictMode>
    ,
)
