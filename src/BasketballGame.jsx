import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
  
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [message, setMessage] = useState('Click and hold to charge, release to shoot!');
  
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
        setScore(prev => prev + 1);
        setMessage('SWISH! 🏀 Great shot!');
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
      
      const force = 0.25 + (powerLevel * 0.20);
      const angle = Math.PI / 3.2;
      
      ballVelocityRef.current.set(
        0,
        force * Math.sin(angle),
        -force * Math.cos(angle)
      );
      
      setMessage('Watch it fly!');
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
      
      // Ball physics
      if (isFlyingRef.current) {
        ballVelocityRef.current.y -= gravity;
        ball.position.add(ballVelocityRef.current);
        ball.rotation.x += 0.1;
        ball.rotation.z += 0.1;
        
        const scored = checkScore();
        
        // Reset conditions
        if (ball.position.y < 0 || ball.position.z < -10 || Math.abs(ball.position.x) > 10) {
          if (!scored) {
            setMessage('Miss! Try again!');
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
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 30px',
        borderRadius: '15px',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        {message}
      </div>
    </div>
  );
};

export default BasketballGame;

