import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, X } from "lucide-react";
import { toast } from "./ui/use-toast";

const CommentsSection = ({ articleId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getCurrentUser();
    
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("article_id", articleId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      setComments(data || []);
    };

    fetchComments();

    // Set up real-time subscription
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [articleId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const commentData = {
      article_id: articleId,
      user_id: user?.id || null,
      content: newComment,
      is_guest: !user,
      guest_name: "Guest"
    };

    const { data, error } = await supabase
      .from("comments")
      .insert([commentData])
      .select();

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setComments((prevComments) => [...prevComments, data[0]]);
      setNewComment("");
    }
  };

  const handleShareClick = async () => {
    // Generate a shareable URL using the article's ID
    const shareUrl = `${window.location.origin}/article/${articleId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Article link has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] mt-14 relative">
      <div className="p-4 border-b border-border bg-wikitok-dark/50 backdrop-blur-sm sticky top-14 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-primary">Comments</h2>
          <p className="text-sm text-muted-foreground">Join the discussion</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onClose()}
          className="hover:bg-destructive/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-14rem)]">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={comment.is_guest 
                    ? "https://via.placeholder.com/150" // Default avatar for guests
                    : (comment.profiles?.avatar_url || "https://via.placeholder.com/150")}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-gray-400">
                  {comment.is_guest ? comment.guest_name : (comment.profiles?.username || 'User')}
                </span>
                {comment.is_guest && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                    Guest
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400">Be the first to comment!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleCommentSubmit} className="sticky bottom-0 left-0 right-0 border-t border-border bg-wikitok-dark/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={user ? "Write a comment..." : "Write a comment as guest..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection;