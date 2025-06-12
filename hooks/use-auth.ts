'use client';

import { createClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/types/database';
import { toast } from 'sonner';

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getActiveSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
        
        if (profileError) {
            console.error("Error fetching profile:", profileError);
        } else {
            setProfile(profileData);
        }
      }
      setLoading(false);
    }

    getActiveSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profileError) {
                    toast.error("Could not fetch user profile.");
                    console.error("Error fetching profile on auth change:", profileError);
                } else {
                    setProfile(profileData);
                }
            } else {
                setProfile(null);
            }
            
            // Re-fetch data on sign-in/sign-out
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                // This is a bit of a hack, but it's a simple way to trigger a re-render
                // of server components that depend on auth state.
                window.location.reload();
            }
        }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, profile, session, loading };
} 