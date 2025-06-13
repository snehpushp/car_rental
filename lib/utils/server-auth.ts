import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { API_ROUTES } from '@/lib/config/routes';

export async function getServerUser() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    // Since we can't hit our own API routes from a server component,
    // we have to fetch the user profile directly from the database.
    const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (error) {
        // This should not happen if the user has a session, but handle it just in case.
        console.error('Error fetching user profile:', error);
        return null;
    }
    
    return { ...user, session };
} 