const videoElement = document.getElementById('webcam');
const handCanvas = document.getElementById('handCanvas');
const handCtx = handCanvas.getContext('2d');

// Initialize camera
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      }
    });
    videoElement.srcObject = stream;
    
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        handCanvas.width = videoElement.videoWidth;
        handCanvas.height = videoElement.videoHeight;
        resolve();
      };
    });
  } catch (error) {
    console.error("Camera error:", error);
    alert("Could not access camera. Please enable camera permissions.");
  }
}

// Configure hand tracking
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Process results with proper mirroring
function onResults(results) {
  handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
  
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    
    // Draw mirrored hand skeleton
    handCtx.save();
    handCtx.scale(-1, 1); // Mirror the canvas
    handCtx.translate(-handCanvas.width, 0); // Adjust for mirroring
    
    handCtx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    handCtx.lineWidth = 2;
    handCtx.beginPath();
    
    // Draw hand connections (mirrored)
    const connections = [
      [0, 1, 2, 3, 4],    // Thumb
      [0, 5, 6, 7, 8],    // Index
      [0, 9, 10, 11, 12], // Middle
      [0, 13, 14, 15, 16], // Ring
      [0, 17, 18, 19, 20]  // Pinky
    ];
    
    connections.forEach(finger => {
      finger.forEach((joint, i) => {
        const landmark = landmarks[joint];
        const x = landmark.x * handCanvas.width;
        const y = landmark.y * handCanvas.height;
        
        if (i === 0) handCtx.moveTo(x, y);
        else handCtx.lineTo(x, y);
      });
      handCtx.moveTo(
        wrist.x * handCanvas.width,
        wrist.y * handCanvas.height
      );
    });
    
    handCtx.stroke();
    handCtx.restore();
    
    // Detect gesture direction (using mirrored coordinates)
    const mirroredX = 1 - indexTip.x; // Mirror x coordinate
    const dx = mirroredX - (1 - wrist.x);
    const dy = indexTip.y - wrist.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Only detect if finger is extended
    const thumbIndexDistance = Math.sqrt(
      Math.pow((1 - thumbTip.x) - mirroredX, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    
    if (distance > 0.15 && thumbIndexDistance > 0.1) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      let gesture = "";
      
      if (angle > -45 && angle < 45) gesture = "right";
      else if (angle >= 45 && angle < 135) gesture = "down";
      else if (angle >= 135 || angle < -135) gesture = "left";
      else gesture = "up";
      
      // Update direction
      setDirection(gesture);
      
      // Visual feedback (non-mirrored position)
      handCtx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      handCtx.fillRect(0, 0, handCanvas.width, handCanvas.height);
      handCtx.fillStyle = 'white';
      handCtx.font = '24px Arial';
      handCtx.textAlign = 'center';
      handCtx.fillText(
        gesture.toUpperCase(), 
        handCanvas.width/2, 
        40
      );
    }
  }
}

// Initialize everything
async function main() {
  await setupCamera();
  hands.onResults(onResults);
  
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  camera.start();
}

main();