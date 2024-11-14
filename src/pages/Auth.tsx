import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js';
import Profile from "@/components/Profile";
import { useEnsureProfile } from "@/hooks/useEnsureProfile";

const AuthPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEnsureProfile(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-white/10">
        <h1 className="text-2xl font-bold text-center mb-6 text-wikitok-red">WikTok</h1>
        
        {!session ? (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ef4444',
                    brandAccent: '#dc2626',
                    inputText: 'white',
                    inputBackground: 'black',
                    inputBorder: 'gray',
                    inputLabelText: 'white',
                    inputPlaceholder: 'darkgray',
                  }
                }
              },
              className: {
                input: 'text-white bg-black border-gray-600',
                label: 'text-white',
              }
            }}
            providers={[]}
          />
        ) : (
          <Profile />
        )}
      </div>
    </div>
  );
};

export default AuthPage;