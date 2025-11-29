import React from 'react';
import { motion } from 'framer-motion';

const Balloon = ({ color, delay, x, scale }: { color: string; delay: number; x: string; scale: number }) => (
  <motion.div
    initial={{ y: '120vh', x }}
    animate={{ 
      y: '-20vh',
      x: [`${x}`, `calc(${x} + 50px)`, `${x}`]
    }}
    transition={{
      y: {
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        ease: 'linear',
        delay
      },
      x: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }}
    style={{ scale }}
    className="absolute pointer-events-none z-0 opacity-20"
  >
    <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 50C38.8071 50 50 38.8071 50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 38.8071 11.1929 50 25 50Z" fill={color}/>
      <path d="M25 50L22 60H28L25 50Z" fill={color}/>
      <path d="M25 50V60" stroke={color} strokeWidth="1"/>
    </svg>
  </motion.div>
);

const Star = ({ delay, x, scale }: { delay: number; x: string; scale: number }) => (
  <motion.div
    initial={{ y: '120vh', x, rotate: 0 }}
    animate={{ 
      y: '-20vh',
      rotate: 360
    }}
    transition={{
      y: {
        duration: 20 + Math.random() * 10,
        repeat: Infinity,
        ease: 'linear',
        delay
      },
      rotate: {
        duration: 10,
        repeat: Infinity,
        ease: 'linear'
      }
    }}
    style={{ scale }}
    className="absolute pointer-events-none z-0 opacity-20 text-gold"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  </motion.div>
);

export const FloatingElements: React.FC = () => {
  const elements = [
    { type: 'balloon', color: '#fbbf24', x: '10%', delay: 0, scale: 1 }, // Gold
    { type: 'balloon', color: '#1e3a8a', x: '20%', delay: 5, scale: 0.8 }, // Royal Blue
    { type: 'star', x: '30%', delay: 2, scale: 1.2 },
    { type: 'balloon', color: '#fcd34d', x: '50%', delay: 8, scale: 1.1 }, // Light Gold
    { type: 'star', x: '60%', delay: 12, scale: 0.9 },
    { type: 'balloon', color: '#d97706', x: '80%', delay: 3, scale: 0.9 }, // Dark Gold
    { type: 'star', x: '90%', delay: 7, scale: 1.5 },
    { type: 'balloon', color: '#1e3a8a', x: '15%', delay: 15, scale: 0.7 },
    { type: 'star', x: '75%', delay: 10, scale: 1 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el, i) => (
        el.type === 'balloon' ? (
          <Balloon key={i} color={el.color!} x={el.x} delay={el.delay} scale={el.scale} />
        ) : (
          <Star key={i} x={el.x} delay={el.delay} scale={el.scale} />
        )
      ))}
    </div>
  );
};
