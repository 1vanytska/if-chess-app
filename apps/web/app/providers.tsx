"use client";

import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ReactElement } from "react";
import darkTheme from "./dark.theme";
import { AuthContext } from "./auth/auth-context";

interface ProviderProps {
    readonly children: ReactElement[];
    readonly authenticated: boolean;
}

export default function Providers({ children, authenticated }: ProviderProps) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={darkTheme}>
                <AuthContext.Provider value={authenticated}>{children}</AuthContext.Provider>
            </ThemeProvider>
        </AppRouterCacheProvider>
    )
}