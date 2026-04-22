import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { loginRequest, registerRequest, setAuthToken } from "../services/api";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

export const AuthContext = createContext({
    user: null,
    token: null,
    isInitializing: true,
    isAuthenticated: false,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const applySession = useCallback(async ({ nextToken, nextUser }) => {
        setToken(nextToken);
        setUser(nextUser || null);
        setAuthToken(nextToken);

        if (nextToken) {
            await AsyncStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        } else {
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }

        if (nextUser) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        } else {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        async function restoreSession() {
            try {
                const [storedToken, storedUserJson] = await Promise.all([
                    AsyncStorage.getItem(TOKEN_STORAGE_KEY),
                    AsyncStorage.getItem(USER_STORAGE_KEY),
                ]);

                if (!storedToken) {
                    setAuthToken(null);
                    return;
                }

                const parsedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
                setToken(storedToken);
                setUser(parsedUser);
                setAuthToken(storedToken);
            } finally {
                setIsInitializing(false);
            }
        }

        restoreSession();
    }, []);

    const login = useCallback(
        async (payload) => {
            const response = await loginRequest(payload);
            await applySession({
                nextToken: response.token,
                nextUser: response.user || null,
            });
            return response;
        },
        [applySession]
    );

    const register = useCallback(
        async (payload) => {
            await registerRequest(payload);
            const loginResponse = await loginRequest(payload);
            await applySession({
                nextToken: loginResponse.token,
                nextUser: loginResponse.user || null,
            });
            return loginResponse;
        },
        [applySession]
    );

    const logout = useCallback(async () => {
        await applySession({ nextToken: null, nextUser: null });
    }, [applySession]);

    const value = useMemo(
        () => ({
            user,
            token,
            isInitializing,
            isAuthenticated: Boolean(token),
            login,
            register,
            logout,
        }),
        [user, token, isInitializing, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}