import React, { useEffect, useRef } from 'react';

const FireParticles = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      
      // Random size
      const size = Math.random() * 6 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Random animation duration
      const duration = Math.random() * 8 + 6;
      particle.style.animationDuration = duration + 's';
      
      // Random delay
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      // Random opacity
      particle.style.opacity = Math.random() * 0.7 + 0.3;
      
      // Add to container
      container.appendChild(particle);
      
      // Remove after animation
      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      }, (duration + 2) * 1000);
    };

    // Create initial particles
    for (let i = 0; i < 50; i++) {
      setTimeout(() => createParticle(), i * 100);
    }

    // Continue creating particles
    const interval = setInterval(() => {
      createParticle();
    }, 200);

    return () => {
      clearInterval(interval);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div ref={particlesRef} className="fire-particles"></div>;
};

export default FireParticles;
