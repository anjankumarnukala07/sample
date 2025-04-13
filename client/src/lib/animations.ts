import { Variants } from "framer-motion";

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Staggered children variants
export const containerVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const childVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

// Fade in variants
export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Scale in variants
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

// Slide in from left
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Slide in from right
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Hover animation for cards
export const hoverScale: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

// Ripple animation for buttons
export const rippleButton: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(79, 70, 229, 0.2)"
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 0 0 5px rgba(79, 70, 229, 0)",
    transition: {
      boxShadow: {
        duration: 1,
        ease: "easeOut"
      },
      scale: {
        duration: 0.2
      }
    }
  }
};

// Pulse animation
export const pulse: Variants = {
  initial: {
    scale: 1
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Animation for speaking bars
export const speakingBarVariants: Variants = {
  initial: {
    height: 5
  },
  animate: {
    height: [5, 15, 8, 20, 5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Animation for progress bars
export const progressBar: Variants = {
  initial: {
    width: 0
  },
  animate: (custom) => ({
    width: `${custom}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  })
};

// Letter by letter text reveal
export const textReveal: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.03
    }
  }
};

export const letterVariant: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};
