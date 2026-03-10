import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import { Cat } from 'lucide-react';

// Loading spinner while checking auth
function AuthLoading() {
    return (
        <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 bg-[#E0E5EC] rounded-2xl shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)] flex items-center justify-center"
                >
                    <Cat size={32} className="text-[#6C63FF]" />
                </motion.div>
                <p className="text-[#8B92A0] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Loading WaCat...
                </p>
            </motion.div>
        </div>
    );
}

// Protects routes: redirects to /signin if not authenticated
export function AuthGuard() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        // Listen for auth changes (login / logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Still checking
    if (session === undefined) return <AuthLoading />;

    // Not logged in → redirect to sign in
    if (session === null) return <Navigate to="/signin" replace />;

    // Logged in → render children
    return <Outlet />;
}
