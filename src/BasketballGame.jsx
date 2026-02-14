import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// Sound effects using Web Audio API
const createSoundEffect = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const playSound = (type) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'swish') {
        // Swish sound - high frequency swoosh
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'shoot') {
        // Shoot sound - whoosh
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'miss') {
        // Miss sound - low thud
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'powerup') {
        // Power-up sound - ascending tone
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'activate') {
        // Power-up activated - chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  };
  
  return { playSound };
};

// Power-up types
const POWERUPS = {
  DOUBLE_POINTS: { name: '2X Points', color: '#FFD700', duration: 10000 },
  SUPER_SHOT: { name: 'Super Shot', color: '#FF4500', duration: 8000 },
  SLOW_MO: { name: 'Slow Motion', color: '#00BFFF', duration: 12000 },
};

// Leaderboard entry component
const LeaderboardEntry = ({ entry, index }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: index === 0 ? 'rgba(255, 215, 0, 0.3)' : index === 1 ? 'rgba(192, 192, 192, 0.3)' : index === 2 ? 'rgba(205, 127, 50, 0.3)' : 'rgba(255,255,255,0.1)',
    borderRadius: '5px',
    marginBottom: '5px',
    fontSize: '14px'
  }}>
    <span style={{ fontWeight: 'bold' }}>#{index + 1}</span>
    <span>{entry.name}</span>
    <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{entry.score}</span>
  </div>
);

const BasketballGame = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const ballRef = useRef(null);
  const ballVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isFlyingRef = useRef(false);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const soundRef = useRef(null);
  const powerupRef = useRef(null);
  const gravityRef = useRef(0.012);
  
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [message, setMessage] = useState('Click and hold to charge, release to shoot!');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Pro Player', score: 25 },
    { name: 'Basket Star', score: 18 },
    { name: 'Court King', score: 15 },
    { name: 'Hoop Master', score: 12 },
    { name: 'Net Rocker', score: 10 },
  ]);
  const [activePowerup, setActivePowerup] = useState(null);
  const [powerupPosition, setPowerupPosition] = useState(null);
  const [showPowerupMessage, setShowPowerupMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize sound
  useEffect(() => {
    soundRef.current = createSoundEffect();
  }, []);
  
  // Spawn power-up randomly
  const spawnPowerup = useCallback(() => {
    if (powerupRef.current) return;
    
    const types = Object.keys(POWERUPS);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const powerupData = POWERUPS[randomType];
    
    powerupRef.current = {
      type: randomType,
      ...powerupData,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        1,
        Math.random() * 2 + 3
      )
    };
    
    setPowerupPosition(powerupRef.current.position.clone());
  }, []);
  
  // Activate power-up
  const activatePowerup = useCallback((powerupType) => {
    const powerupData = POWERUPS[powerupType];
    setActivePowerup(powerupData);
    setShowPowerupMessage(true);
    setMessage(`🚀 ${powerupData.name} activated!`);
    
    if (soundRef.current) {
      soundRef.current.playSound('activate');
    }
    
    if (powerupType === 'SLOW_MO') {
      gravityRef.current = 0.006; // Slow down gravity
    }
    
    setTimeout(() => {
      setActivePowerup(null);
      setShowPowerupMessage(false);
      gravityRef.current = 0.012;
      setMessage('Click and hold to charge, release to shoot!');
    }, powerupData.duration);
    
    powerupRef.current = null;
    setPowerupPosition(null);
  }, []);
  
  // Check power-up collision
  const checkPowerupCollision = useCallback(() => {
    if (!powerupRef.current || !ballRef.current) return;
    
    const ballPos = ballRef.current.position;
    const powerupPos = powerupRef.current.position;
    const distance = ballPos.distanceTo(powerupPos);
    
    if (distance < 0.5) {
      if (soundRef.current) {
        soundRef.current.playSound('powerup');
      }
      activatePowerup(powerupRef.current.type);
    }
  }, [activatePowerup]);
  
  // Submit score to leaderboard
  const submitScore = useCallback(() => {
    if (!playerName.trim() || score === 0) return;
    
    const newLeaderboard = [...leaderboard, { name: playerName, score }];
    newLeaderboard.sort((a, b) => b.score - a.score);
    setLeaderboard(newLeaderboard.slice(0, 5));
    setPlayerName('');
    setScore(0);
    setShots(0);
  }, [playerName, score, leaderboard]);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Basketball hoop pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 16);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(0, 3, -5);
    pole.castShadow = true;
    scene.add(pole);
    
    // Backboard
    const backboardGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const backboardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, 5.5, -5.5);
    backboard.castShadow = true;
    scene.add(backboard);
    
    // Red square on backboard
    const redSquareGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.05);
    const redSquareMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const redSquare = new THREE.Mesh(redSquareGeometry, redSquareMaterial);
    redSquare.position.set(0, 5.5, -5.45);
    scene.add(redSquare);
    
    // Rim
    const rimGeometry = new THREE.TorusGeometry(0.45, 0.03, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(0, 5, -5);
    rim.rotation.x = Math.PI / 2;
    scene.add(rim);
    
    // Net
    const netGeometry = new THREE.CylinderGeometry(0.45, 0.35, 0.5, 12, 1, true);
    const netMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.set(0, 4.75, -5);
    scene.add(net);
    
    // Basketball
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 1, 5);
    ball.castShadow = true;
    scene.add(ball);
    ballRef.current = ball;
    
    // Ball black lines
    const lineGeometry = new THREE.TorusGeometry(0.305, 0.015, 8, 32);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
    line1.rotation.y = Math.PI / 2;
    ball.add(line1);
    
    const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
    line2.rotation.x = Math.PI / 2;
    ball.add(line2);
    
    const initialBallPos = new THREE.Vector3(0, 1, 5);
    const gravity = 0.012;
    
    // Game functions
    const resetBall = () => {
      ball.position.copy(initialBallPos);
      ballVelocityRef.current.set(0, 0, 0);
      isFlyingRef.current = false;
    };
    
    const checkScore = () => {
      const rimPos = new THREE.Vector3(0, 5, -5);
      const distToRim = ball.position.distanceTo(rimPos);
      
      if (distToRim < 0.5 && ball.position.y > 4.7 && ball.position.y < 5.3 && ballVelocityRef.current.y < 0) {
        let points = 1;
        // Apply power-up effects
        if (activePowerup && activePowerup.name === '2X Points') {
          points = 2;
        }
        if (activePowerup && activePowerup.name === 'Super Shot') {
          points = 3;
        }
        setScore(prev => prev + points);
        
        if (soundRef.current) {
          soundRef.current.playSound('swish');
        }
        
        const pointText = points > 1 ? ` +${points} points!` : '';
        setMessage(`SWISH! 🏀 Great shot!${pointText}`);
        
        // Spawn power-up after scoring
        if (Math.random() < 0.3) {
          setTimeout(() => spawnPowerup(), 500);
        }
        
        setTimeout(() => {
          setMessage('Click and hold to charge, release to shoot!');
        }, 2000);
        return true;
      }
      return false;
    };
    
    const shootBall = (powerLevel) => {
      if (isFlyingRef.current) return;
      
      isFlyingRef.current = true;
      setShots(prev => prev + 1);
      
      let force = 0.25 + (powerLevel * 0.20);
      
      // Apply power-up effects
      if (activePowerup && activePowerup.name === 'Super Shot') {
        force *= 1.3; // Stronger shots
      }
      
      const angle = Math.PI / 3.2;
      
      ballVelocityRef.current.set(
        0,
        force * Math.sin(angle),
        -force * Math.cos(angle)
      );
      
      if (soundRef.current) {
        soundRef.current.playSound('shoot');
      }
      
      setMessage('Watch it fly!');
    };
    
    // Check for power-up collision
    const checkPowerupCollision = () => {
      if (!powerupRef.current || !ballRef.current) return;
      
      const ballPos = ballRef.current.position;
      const powerupPos = powerupRef.current.position;
      const distance = ballPos.distanceTo(powerupPos);
      
      if (distance < 0.8) {
        const powerupType = powerupRef.current.type;
        const powerupData = POWERUPS[powerupType];
        
        if (soundRef.current) {
          soundRef.current.playSound('powerup');
        }
        
        setActivePowerup(powerupData);
        setShowPowerupMessage(true);
        setMessage(`🚀 ${powerupData.name} activated!`);
        
        if (powerupType === 'SLOW_MO') {
          gravityRef.current = 0.006;
        }
        
        setTimeout(() => {
          setActivePowerup(null);
          setShowPowerupMessage(false);
          gravityRef.current = 0.012;
          setMessage('Click and hold to charge, release to shoot!');
        }, powerupData.duration);
        
        powerupRef.current = null;
        setPowerupPosition(null);
      }
    };
    
    // Spawn power-up randomly
    const spawnPowerup = () => {
      if (powerupRef.current) return;
      
      const types = Object.keys(POWERUPS);
      const randomType = types[Math.floor(Math.random() * types.length)];
      const powerupData = POWERUPS[randomType];
      
      powerupRef.current = {
        type: randomType,
        ...powerupData,
        mesh: null
      };
      
      // Create power-up visual
      const powerupGeometry = new THREE.OctahedronGeometry(0.25);
      const powerupMaterial = new THREE.MeshStandardMaterial({ 
        color: powerupData.color,
        emissive: powerupData.color,
        emissiveIntensity: 0.5
      });
      const powerupMesh = new THREE.Mesh(powerupGeometry, powerupMaterial);
      powerupMesh.position.set(
        (Math.random() - 0.5) * 3,
        1.5,
        Math.random() * 2 + 3
      );
      scene.add(powerupMesh);
      powerupRef.current.mesh = powerupMesh;
      powerupRef.current.position = powerupMesh.position;
      
      setPowerupPosition(powerupMesh.position.clone());
    };
    
    // Mouse events
    const handleMouseDown = (e) => {
      if (!isFlyingRef.current) {
        chargingRef.current = true;
        chargeStartRef.current = Date.now();
        setIsCharging(true);
        setMessage('Charging power...');
      }
    };
    
    const handleMouseUp = (e) => {
      if (chargingRef.current && !isFlyingRef.current) {
        const chargeTime = (Date.now() - chargeStartRef.current) / 1000;
        const powerLevel = Math.min(chargeTime / 1.5, 1);
        setPower(0);
        setIsCharging(false);
        chargingRef.current = false;
        shootBall(powerLevel);
      }
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('touchstart', handleMouseDown);
    renderer.domElement.addEventListener('touchend', handleMouseUp);
    
    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update power bar
      if (chargingRef.current) {
        const chargeTime = (Date.now() - chargeStartRef.current) / 1000;
        setPower(Math.min((chargeTime / 1.5) * 100, 100));
      }
      
      // Animate power-up if it exists
      if (powerupRef.current && powerupRef.current.mesh) {
        powerupRef.current.mesh.rotation.y += 0.05;
        powerupRef.current.mesh.rotation.x += 0.02;
      }
      
      // Ball physics
      if (isFlyingRef.current) {
        ballVelocityRef.current.y -= gravity;
        ball.position.add(ballVelocityRef.current);
        ball.rotation.x += 0.1;
        ball.rotation.z += 0.1;
        
        // Check power-up collision
        if (powerupRef.current && ballRef.current) {
          const ballPos = ballRef.current.position;
          const powerupPos = powerupRef.current.mesh.position;
          const distance = ballPos.distanceTo(powerupPos);
          
          if (distance < 0.8) {
            const powerupType = powerupRef.current.type;
            const powerupData = POWERUPS[powerupType];
            
            if (soundRef.current) {
              soundRef.current.playSound('powerup');
            }
            
            // Remove power-up mesh from scene
            scene.remove(powerupRef.current.mesh);
            
            setActivePowerup(powerupData);
            setShowPowerupMessage(true);
            setMessage(`🚀 ${powerupData.name} activated!`);
            
            if (powerupType === 'SLOW_MO') {
              gravityRef.current = 0.006;
            }
            
            setTimeout(() => {
              setActivePowerup(null);
              setShowPowerupMessage(false);
              gravityRef.current = 0.012;
              setMessage('Click and hold to charge, release to shoot!');
            }, powerupData.duration);
            
            powerupRef.current = null;
            setPowerupPosition(null);
          }
        }
        
        const scored = checkScore();
        
        // Reset conditions
        if (ball.position.y < 0 || ball.position.z < -10 || Math.abs(ball.position.x) > 10) {
          if (!scored) {
            setMessage('Miss! Try again!');
            if (soundRef.current) {
              soundRef.current.playSound('miss');
            }
            setTimeout(() => {
              setMessage('Click and hold to charge, release to shoot!');
            }, 1500);
          }
          setTimeout(() => {
            resetBall();
          }, 1000);
        }
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('touchstart', handleMouseDown);
        renderer.domElement.removeEventListener('touchend', handleMouseUp);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : '0.0';
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Score UI */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontWeight: 'bold',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
        background: 'rgba(0,0,0,0.6)',
        padding: '20px',
        borderRadius: '15px',
        minWidth: '200px'
      }}>
        <div style={{ marginBottom: '10px' }}>🏀 Score: {score}</div>
        <div style={{ marginBottom: '10px' }}>📊 Shots: {shots}</div>
        <div style={{ fontSize: '20px', color: '#4ade80' }}>
          🎯 Accuracy: {accuracy}%
        </div>
      </div>
      
      {/* Power bar */}
      {isCharging && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '40px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '3px solid white',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: `${power}%`,
            height: '100%',
            background: power < 33 ? '#4ade80' : power < 66 ? '#facc15' : '#ef4444',
            transition: 'width 0.05s linear, background 0.2s'
          }} />
        </div>
      )}
      
      {/* Message */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '80px' : '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? '18px' : '24px',
        fontWeight: 'bold',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 30px',
        borderRadius: '15px',
        textAlign: 'center',
        minWidth: '300px',
        maxWidth: '90%'
      }}>
        {message}
      </div>
      
      {/* Active Power-up Indicator */}
      {activePowerup && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
          background: activePowerup.color,
          padding: '15px 20px',
          borderRadius: '10px',
          animation: 'pulse 1s infinite'
        }}>
          ⭐ {activePowerup.name}
        </div>
      )}
      
      {/* Leaderboard Button */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        🏆 Leaderboard
      </button>
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '30px',
          borderRadius: '20px',
          minWidth: '300px',
          maxWidth: '90%',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          zIndex: 1000
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '28px' }}>🏆 Leaderboard</h2>
          
          {leaderboard.map((entry, index) => (
            <LeaderboardEntry key={index} entry={entry} index={index} />
          ))}
          
          {/* Submit Score Form */}
          {score > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '20px' }}>
              <p style={{ textAlign: 'center', marginBottom: '10px' }}>Your Score: <strong style={{ color: '#4ade80', fontSize: '24px' }}>{score}</strong></p>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #667eea',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={submitScore}
                disabled={!playerName.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: playerName.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#555',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Submit Score
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowLeaderboard(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Mobile Touch Hint */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Touch and hold to charge • Release to shoot
        </div>
      )}
      
      {/* Power-up indicator in 3D scene */}
      {powerupPosition && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, #FFD700 0%, #FF4500 100%)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            boxShadow: '0 0 20px #FFD700'
          }} />
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BasketballGame;





