import "./Main.css";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function App({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        className="flex justify-center place-content-center w-screen h-screen"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
