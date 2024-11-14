import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export const useEnsureProfile = (session: Session | null) => {
  useEffect(() => {
    const createProfileIfNeeded = async () => {
      try {
        if (!session?.user?.id) return;

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        // Only create if profile doesn't exist
        if (!existingProfile && !fetchError) {
          const newProfile: Profile = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            avatar_url: null,
            bio: null
          };

          const { error: createError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (createError) {
            throw createError;
          }
        }
      } catch (error) {
        console.error('Error in useEnsureProfile:', error);
      }
    };

    createProfileIfNeeded();
  }, [session]);
};