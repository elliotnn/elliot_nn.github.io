import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setProfile({
        id: user.id,
        username: data?.username || "",
        avatar_url: data?.avatar_url || null,
        bio: data?.bio || null
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={profile.avatar_url || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <label className="absolute bottom-0 right-0 bg-wikitok-red hover:bg-wikitok-red/90 text-white p-2 rounded-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Edit"
            )}
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-200">Username</label>
          <Input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-200">Bio</label>
          <Input
            type="text"
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={updateProfile}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Profile"
            )}
          </Button>
          <Button
            onClick={handleSignOut}
            variant="destructive"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;