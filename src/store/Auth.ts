import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

import { AppwriteException, ID, Models } from 'appwrite';
import { account } from '@/models/client/config';

export interface UserPrefs {
    reputation: number;
}

interface AuthStore {
    session: Models.Session | null;
    jwt: string | null;
    user: Models.User<UserPrefs> | null;
    hydrated: boolean;

    setHydrated(): void;

    verifySession(): Promise<void>;

    login(
        email: string,
        password: string,
    ): Promise<{ success: boolean; error?: AppwriteException }>;

    createAccount(
        name: string,
        email: string,
        password: string,
    ): Promise<{ success: boolean; error?: AppwriteException }>;

    logout(): Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        immer((set) => ({
            session: null,
            jwt: null,
            user: null,
            hydrated: false,

            setHydrated() {
                set({ hydrated: true });
            },

            async verifySession() {
                try {
                    const session = await account.getSession('current');
                    set({ session });
                } catch (error) {
                    console.error('Error verifying session:', error);
                }
            },

            async login(email: string, password: string) {
                try {
                    const session = await account.createEmailPasswordSession(
                        email,
                        password,
                    );
                    const [user, { jwt }] = await Promise.all([
                        account.get<UserPrefs>(),
                        account.createJWT(),
                    ]);
                    if (!user.prefs?.reputation)
                        await account.updatePrefs<UserPrefs>({ reputation: 0 });
                    set({ session, user, jwt });
                    return { success: true };
                } catch (error) {
                    console.error('Error logging in:', error);
                    return {
                        success: false,
                        error:
                            error instanceof AppwriteException
                                ? error
                                : undefined,
                    };
                }
            },

            async createAccount(name: string, email: string, password: string) {
                try {
                    account.create(ID.unique(), email, password, name);
                    return { success: true };
                } catch (error) {
                    console.error('Error creating account:', error);
                    return {
                        success: false,
                        error:
                            error instanceof AppwriteException
                                ? error
                                : undefined,
                    };
                }
            },

            async logout() {
                try {
                    await account.deleteSession('current');
                    set({ session: null, user: null, jwt: null });
                } catch (error) {
                    console.error('Error logging out:', error);
                }
            },
        })),
        {
            name: 'auth',
            onRehydrateStorage() {
                return (state, error) => {
                    if (!error) state?.setHydrated();
                };
            },
        },
    ),
);
