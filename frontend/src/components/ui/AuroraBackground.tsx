import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated aurora gradient background blobs.
 * Always rendered as a fixed overlay, pointer-events: none.
 */
const AuroraBackground: React.FC = () => {
  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Blob 1 — Indigo, top-left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Blob 2 — Violet, top-right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
          top: '-80px',
          right: '5%',
        }}
        animate={{ x: [0, -30, 15, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Blob 3 — Cyan, bottom-left */}
      <motion.div
        className="aurora-blob"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          bottom: '10%',
          left: '15%',
        }}
        animate={{ x: [0, 25, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Blob 4 — Pink, bottom-right */}
      <motion.div
        className="aurora-blob"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
          bottom: '5%',
          right: '10%',
        }}
        animate={{ x: [0, -20, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          mask: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
          WebkitMask: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
        }}
      />
    </div>
  );
};

export default AuroraBackground;
