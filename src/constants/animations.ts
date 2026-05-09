import { type Variants } from "framer-motion";

// Fades an element up from y:30 — used on all scroll-triggered content
export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Container variant that staggers its direct children by 0.1s each
export const staggerContainerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Applied to each child inside a stagger container
export const staggerItemVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Button hover — slight scale-up on hover, scale-down on press
export const buttonHoverVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2, ease: "easeInOut" } },
  tap:   { scale: 0.98 },
};

// Card hover — lifts the card 4px on hover
export const cardHoverVariants = {
  rest:  { y: 0 },
  hover: { y: -4, transition: { duration: 0.3, ease: "easeOut" } },
};
