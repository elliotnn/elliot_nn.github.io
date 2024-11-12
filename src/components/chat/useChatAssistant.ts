import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useChatAssistant = (article: { title: string; content: string } | null) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInitialQuestion = async (apiKey: string) => {
    if (!article) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant tasked with generating an engaging question about the following ${article.title.includes("arXiv") ? "research paper" : "article"}. 
              Generate ONE interesting question that would help the reader better understand the content.
              Make the question concise and specific to the content.
              
              Title: ${article.title}
              Full Content: ${article.content}`
            },
            {
              role: "user",
              content: "Generate an interesting question about this content."
            }
          ]
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const question = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: question }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate initial question. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async (question: string, apiKey: string) => {
    if (!article) return;
    
    setIsLoading(true);
    try {
      setMessages(prev => [...prev, { role: 'user', content: question }]);
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant answering questions about the following ${article.title.includes("arXiv") ? "research paper" : "Wikipedia article"}. 
              Keep your responses concise and to the point, ideally under 3 sentences.
              When answering, try to reference specific parts of the content when relevant.
              
              Title: ${article.title}
              Full Content: ${article.content}
              
              If this is a research paper, you should focus on explaining complex concepts in simple terms and highlighting the key contributions and findings.`
            },
            {
              role: "user",
              content: question
            }
          ]
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, askQuestion, generateInitialQuestion };
};