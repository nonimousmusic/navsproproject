import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AppUser {
    id: string;
    email: string | null;
    emailVerified: boolean;
    user_metadata: {
        full_name: string | null;
    };
}

interface AuthContextType {
    user: AppUser | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(sbUser: User | null): AppUser | null {
    if (!sbUser) return null;
    return {
        id: sbUser.id,
        email: sbUser.email ?? null,
        emailVerified: !!sbUser.email_confirmed_at,
        user_metadata: {
            full_name: sbUser.user_metadata?.full_name ?? null,
        },
    };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the initial session
        supabase.auth.getSession()
            .then(({ data }) => {
                const session = data?.session ?? null;
                setSession(session);
                setUser(mapSupabaseUser(session?.user ?? null));
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error retrieving Supabase session:", err);
                setSession(null);
                setUser(null);
                setLoading(false);
            });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(mapSupabaseUser(session?.user ?? null));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
