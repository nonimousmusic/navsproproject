import { motion } from "framer-motion";
import { Sparkles, Brain, Heart, TrendingUp, Compass, Lightbulb } from "lucide-react";

const nodes = [
  { icon: Brain, label: "Aptitude", delay: 0, x: -180, y: -100, size: "lg" },
  { icon: Heart, label: "Interests", delay: 0.2, x: 200, y: -80, size: "md" },
  { icon: Sparkles, label: "Skills", delay: 0.4, x: -160, y: 90, size: "md" },
  { icon: TrendingUp, label: "Growth", delay: 0.6, x: 190, y: 110, size: "lg" },
  { icon: Compass, label: "Direction", delay: 0.8, x: -240, y: 0, size: "sm" },
  { icon: Lightbulb, label: "Potential", delay: 1, x: 260, y: -10, size: "sm" },
];

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-14 h-14",
  lg: "w-16 h-16",
};

const iconSizes = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
};

export const FloatingNodes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 top-1/3 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-1/4 top-1/2 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" 
      />
      
      {/* Connection lines SVG */}
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        {/* Outer orbit */}
        <motion.circle
          cx="300"
          cy="300"
          r="220"
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="1"
          strokeDasharray="12 8"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.4, rotate: 360 }}
          transition={{ opacity: { duration: 1 }, rotate: { duration: 60, repeat: Infinity, ease: "linear" } }}
        />
        {/* Middle orbit */}
        <motion.circle
          cx="300"
          cy="300"
          r="150"
          fill="none"
          stroke="url(#orbitGradient2)"
          strokeWidth="1"
          strokeDasharray="8 6"
          initial={{ opacity: 0, rotate: 360 }}
          animate={{ opacity: 0.3, rotate: 0 }}
          transition={{ opacity: { duration: 1, delay: 0.3 }, rotate: { duration: 45, repeat: Infinity, ease: "linear" } }}
        />
        {/* Inner orbit */}
        <motion.circle
          cx="300"
          cy="300"
          r="80"
          fill="none"
          stroke="hsl(var(--secondary) / 0.3)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="orbitGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Central core */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm border border-secondary/30 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/50 to-accent/30 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-secondary/80" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating nodes */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.label}
          className="absolute left-1/2 top-1/2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: node.x,
            y: node.y,
          }}
          transition={{ 
            delay: node.delay + 0.8,
            duration: 0.8,
            type: "spring",
            stiffness: 80,
            damping: 12
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              x: [0, index % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{ 
              duration: 5 + index * 0.7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-2"
          >
            {/* Glow effect behind node */}
            <div className="absolute inset-0 rounded-2xl bg-secondary/20 blur-xl scale-150" />
            
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className={`${sizeClasses[node.size as keyof typeof sizeClasses]} rounded-2xl bg-gradient-to-br from-primary-foreground/15 to-primary-foreground/5 backdrop-blur-md border border-primary-foreground/20 flex items-center justify-center shadow-lg relative overflow-hidden`}
            >
              {/* Inner shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <node.icon className={`${iconSizes[node.size as keyof typeof iconSizes]} text-secondary relative z-10`} />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: node.delay + 1.2 }}
              className="text-xs font-medium text-primary-foreground/60 hidden md:block backdrop-blur-sm px-2 py-0.5 rounded-full bg-primary-foreground/5"
            >
              {node.label}
            </motion.span>
          </motion.div>
        </motion.div>
      ))}

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-secondary/40"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
