import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedWord } from "./AnimatedWord";
import { useEffect, useRef } from "react";

export const Message = ({ role, content }: { role: 'user' | 'assistant', content: string }) => {
  const words = content.split(' ');
  const messageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, [words]);
  
  return (
    <motion.div 
      ref={messageRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-lg mb-4 overflow-hidden",
        role === 'user' 
          ? "bg-wikitok-red/10 ml-8" 
          : "bg-wikitok-blue/10 mr-8"
      )}
    >
      <div className="font-semibold mb-1">
        {role === 'user' ? 'You' : 'Assistant'}
      </div>
      <div className="text-sm text-gray-200">
        <AnimatePresence>
          {words.map((word, index) => (
            <AnimatedWord 
              key={index} 
              word={word} 
              delay={index * 0.1} 
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};