import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = false, 
  hover = true,
  onClick
}) => {
  const cardClass = `${hover ? 'glass-card-hover' : 'glass-card'} ${glow ? 'neon-border' : ''} ${className}`;
  
  if (onClick) {
    return (
      <motion.div 
        onClick={onClick}
        whileHover={{ scale: hover ? 1.01 : 1 }}
        whileTap={{ scale: hover ? 0.99 : 1 }}
        className={`${cardClass} cursor-pointer`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClass}>
      {children}
    </div>
  );
};

export default GlassCard;
