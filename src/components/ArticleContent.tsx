import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { WikipediaArticle } from '../services/types';

interface ArticleContentProps {
  article: WikipediaArticle;
  isVisible: boolean;
  currentIndex: number;
  index: number;
  displayedText: string;
  progress: number;
  textContainerRef: React.RefObject<HTMLDivElement>;
}

export const ArticleContent = ({
  article,
  isVisible,
  currentIndex,
  index,
  displayedText,
  progress,
  textContainerRef
}: ArticleContentProps) => {
  return (
    <div 
      key={article.id} 
      data-index={index}
      className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center"
    >
      <div className="absolute inset-0 w-screen h-screen">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isVisible && currentIndex === index ? 1 : 0,
          y: isVisible && currentIndex === index ? 0 : 20,
        }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-0 left-0 right-0 flex flex-col"
      >
        <div className="px-8 pt-6 pb-4 z-20">
          <h1 className="inline-block text-4xl font-bold mb-2">
            <span className="relative">
              <span className="absolute inset-0 backdrop-blur-md bg-black/30 rounded-lg -m-1 p-1" />
              <span className="relative px-2 py-1">
                {article.title}
              </span>
            </span>
          </h1>
          {article.title.includes("arXiv") && (
            <span className="bg-wikitok-red text-white px-2 py-1 rounded-full text-sm ml-2">
              Research Paper
            </span>
          )}
        </div>

        <div 
          ref={textContainerRef}
          className="max-h-[50vh] overflow-y-auto px-8 pb-8 flex flex-col-reverse"
        >
          <div className="relative">
            <span className="absolute inset-0 backdrop-blur-md bg-black/30 -z-10" />
            <p className="text-lg leading-loose mb-6 py-2 relative backdrop-blur-md bg-black/30 rounded-lg px-4">
              {currentIndex === index ? displayedText : article.content}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-300 mt-4">
              <span>{article.readTime} min read</span>
              <span>•</span>
              <span>{article.views?.toLocaleString() || 'Research Paper'}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {currentIndex === index && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <Progress 
            value={progress} 
            className="h-1 bg-black/20"
            indicatorClassName="bg-red-500"
          />
        </div>
      )}
    </div>
  );
};