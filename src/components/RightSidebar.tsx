import { Share2, ThumbsUp, Bot, MessageSquare, X, Headset } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState, useEffect } from "react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CommentsSection from "./CommentSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
}

const FeedbackDialog = ({ isOpen, onClose, articleId }: FeedbackDialogProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      const { error } = await supabase
        .from("feedback")
        .insert([{
          article_id: articleId,
          content: feedback.trim(),
          user_id: user?.id || null,
          is_guest: !user,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
        duration: 3000,
      });
      
      setFeedback("");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-wikitok-dark border-wikitok-blue/20">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts about this article
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RightSidebar = ({ 
  article, 
  showChat, 
  onToggleChat 
}: { 
  article: Article, 
  showChat: boolean,
  onToggleChat: () => void
}) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Check initial like status
  useEffect(() => {
    const checkLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: likes } = await supabase
          .from("likes")
          .select()
          .eq('article_id', article.id.toString())
          .eq('user_id', user.id);
        
        setLiked(likes && likes.length > 0);
      } else {
        // Check localStorage for guest likes
        const guestLikes = JSON.parse(localStorage.getItem('guestLikes') || '[]');
        setLiked(guestLikes.includes(article.id));
      }
    };

    checkLikeStatus();
  }, [article.id]);

  // Subscribe to likes changes
  useEffect(() => {
    const subscription = supabase
      .channel(`likes:${article.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'likes',
          filter: `article_id=eq.${article.id}`
        }, 
        () => {
          // Refresh like status when changes occur
          checkLikeStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [article.id]);

  // Add this effect to fetch initial like count
  useEffect(() => {
    const fetchLikeCount = async () => {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .eq('article_id', article.id.toString());
      
      setLikeCount(count || 0);
    };

    fetchLikeCount();
  }, [article.id]);

  // Update the subscription effect to also refresh like count
  useEffect(() => {
    const subscription = supabase
      .channel(`likes:${article.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'likes',
          filter: `article_id=eq.${article.id}`
        }, 
        async () => {
          // Refresh like count when changes occur
          const { count } = await supabase
            .from("likes")
            .select("*", { count: 'exact', head: true })
            .eq('article_id', article.id.toString());
          
          setLikeCount(count || 0);
          checkLikeStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [article.id]);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (user) {
        // Check if already liked
        const { data: likes } = await supabase
          .from("likes")
          .select()
          .eq('article_id', article.id.toString())
          .eq('user_id', user.id);

        if (likes && likes.length > 0) {
          // Unlike: Delete the existing like
          const { error: deleteError } = await supabase
            .from("likes")
            .delete()
            .eq('article_id', article.id.toString())
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;

          setLiked(false);
          toast({
            title: "Unliked",
            description: "You unliked this article",
            duration: 2000,
          });
          return;
        }

        // Like: Insert new like
        const { error: insertError } = await supabase
          .from("likes")
          .insert([{ 
            article_id: article.id.toString(),
            user_id: user.id,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        setLiked(true);
        toast({
          title: "Liked!",
          description: "You liked this article.",
          duration: 2000,
        });
      } else {
        // Handle guest likes/unlikes
        const guestLikes = JSON.parse(localStorage.getItem('guestLikes') || '[]');
        if (guestLikes.includes(article.id)) {
          // Unlike for guests
          const updatedLikes = guestLikes.filter((id: string) => id !== article.id);
          localStorage.setItem('guestLikes', JSON.stringify(updatedLikes));
          setLiked(false);
          toast({
            title: "Unliked",
            description: "You unliked this article",
            duration: 2000,
          });
        } else {
          // Like for guests
          guestLikes.push(article.id);
          localStorage.setItem('guestLikes', JSON.stringify(guestLikes));
          setLiked(true);
          toast({
            title: "Liked!",
            description: "You liked this article.",
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Error handling like/unlike:", error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareableUrl = `${window.location.origin}/article/${article.id}`;
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "Copied",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-end pb-[3.6rem]">
      {/* Main button group */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="w-16 h-16 p-0 justify-center hover:text-wikitok-blue"
            onClick={onToggleChat}
          >
            <Bot className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            className={`w-16 h-16 p-0 justify-center hover:text-wikitok-blue ${liked ? 'text-wikitok-blue' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-sm text-gray-400">{likeCount}</span>
        </div>

        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="w-16 h-16 p-0 justify-center hover:text-wikitok-blue"
            onClick={() => setShowComments(true)}
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="w-16 h-16 p-0 justify-center hover:text-wikitok-blue"
            onClick={handleShare}
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Feedback button with separator and different style */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="w-16 h-16 p-0 justify-center hover:text-wikitok-blue"
            onClick={() => setShowFeedback(true)}
          >
            <Headset className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );

  const ChatContent = () => (
    <div className="relative h-full bg-gradient-to-b from-wikitok-blue/5 to-wikitok-dark">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 hover:text-wikitok-blue"
        onClick={() => setShowChat(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <ArticleAssistant 
        article={article} 
        onClose={onToggleChat}
      />
    </div>
  );

  const CommentsContent = () => (
    <div className="relative h-full bg-gradient-to-b from-wikitok-blue/5 to-wikitok-dark">
      <CommentsSection 
        articleId={article.id} 
        onClose={() => setShowComments(false)}
      />
    </div>
  );

  return (
    <div className="fixed right-0 top-0 bottom-0 z-40">
      <div className={`h-screen ${showChat || showComments ? 'w-screen md:w-[450px] bg-wikitok-dark border-l border-wikitok-blue/20' : 'sm:w-16 bg-transparent'}`}>
        {showChat ? <ChatContent /> : 
         showComments ? <CommentsContent /> : 
         <SidebarContent />}
      </div>
      <FeedbackDialog 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        articleId={article.id}
      />
    </div>
  );
};

export default RightSidebar;