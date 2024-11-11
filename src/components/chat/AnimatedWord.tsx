import { motion } from "framer-motion";

export const AnimatedWord = ({ word, delay }: { word: string; delay: number }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="inline-block mr-1"
  >
    {word}
  </motion.span>
);