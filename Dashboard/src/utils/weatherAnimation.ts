export const weatherAnimationStyles = `
  @keyframes rain {
    0% { transform: translateY(-20px) scaleX(0.7); opacity: 0.8; }
    80% { opacity: 1; }
    100% { transform: translateY(100vh) scaleX(1); opacity: 0.2; }
  }
  
  @keyframes lightning-flash {
    0%, 5%, 20%, 30%, 100% { 
      opacity: 0; 
      transform: scaleY(0.1) translateY(-50%) rotate(0deg); 
      filter: blur(5px);
    }
    7% {
      opacity: 1; 
      transform: scaleY(1) translateY(-50%) rotate(5deg); 
      filter: blur(0px); 
      box-shadow: 0 0 100px 50px rgba(255, 255, 255, 0.9);
    }
    8% {
      opacity: 0.8; 
      transform: scaleY(0.8) translateY(-50%) rotate(-3deg); 
      filter: blur(2px);
      box-shadow: 0 0 80px 40px rgba(255, 255, 255, 0.7);
    }
    10% {
      opacity: 0.4; 
      transform: scaleY(0.5) translateY(-50%) rotate(10deg); 
      filter: blur(10px);
      box-shadow: 0 0 60px 30px rgba(255, 255, 255, 0.5);
    }
  }

  @keyframes cloud { 
    0% { transform: translateX(-120%); opacity: 0.7; } 
    10% { opacity: 1; } 
    100% { transform: translateX(120vw); opacity: 0.7; } 
  }
  
  @keyframes cloud-slow { 
    0% { transform: translateX(-120%); opacity: 0.5; } 
    10% { opacity: 0.8; } 
    100% { transform: translateX(120vw); opacity: 0.5; } 
  }

  .animate-rain {
    animation: rain linear infinite;
    border-radius: 9999px;
    filter: blur(0.5px);
  }

  .lightning-flash {
    animation: lightning-flash 6s ease-out infinite;
    background: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 100%);
    width: 4px;
    transform-origin: top center;
    z-index: 10;
  }

  .rain-drop {
    box-shadow: 0 0 6px 2px #3b82f6aa;
    background: linear-gradient(180deg, #60a5fa 60%, #3b82f6 100%);
  }

  .sun-glow {
    box-shadow: 0 0 120px 60px #fde68a88, 0 0 200px 120px #f59e4288;
    filter: blur(12px);
  }

  .pulse-orb {
    animation: pulse 2s infinite alternate;
  }

  @keyframes pulse {
    0% { opacity: 0.7; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.08); }
  }

  .thunder-cloud {
    animation: cloud 60s linear infinite;
    filter: blur(15px);
    opacity: 0.6;
    background: rgba(40,40,40,0.8);
  }

  .thunder-cloud-slow {
    animation: cloud-slow 90s linear infinite;
    filter: blur(20px);
    opacity: 0.4;
    background: rgba(60,60,60,0.7);
  }

  .animate-cloud { 
    animation: cloud 50s linear infinite; 
    filter: blur(8px); 
  }
  
  .animate-cloud-slow { 
    animation: cloud-slow 80s linear infinite; 
    filter: blur(12px); 
  }
`;