"use client"
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Demo.module.css';
// Default video path to use - change this to your video path
const DEFAULT_VIDEO_PATH = '/Recording 2025-04-18 121201.mp4';

// Define types for keypoint data
interface Keypoint {
  x: number;
  y: number;
  z?: number; // Optional z coordinate
  score: number;
  name: string;
}

// Define the structure for an angle definition
interface AngleDefinition {
  name: string; // Name of the angle (e.g., 'left_elbow')
  p1: string;   // Name of the first keypoint
  vertex: string; // Name of the vertex keypoint
  p2: string;   // Name of the second keypoint
}

// List of angles to calculate
const ANGLE_DEFINITIONS = [
  // Elbows
  { name: 'left_elbow', p1: 'left_shoulder', vertex: 'left_elbow', p2: 'left_wrist' },
  { name: 'right_elbow', p1: 'right_shoulder', vertex: 'right_elbow', p2: 'right_wrist' },
  // Shoulders (Arm relative to torso - Side View approximation)
  { name: 'left_shoulder', p1: 'left_hip', vertex: 'left_shoulder', p2: 'left_elbow' },
  { name: 'right_shoulder', p1: 'right_hip', vertex: 'right_shoulder', p2: 'right_elbow' },
  // Hips (Leg relative to torso - Side View approximation)
  { name: 'left_hip', p1: 'left_shoulder', vertex: 'left_hip', p2: 'left_knee' },
  { name: 'right_hip', p1: 'right_shoulder', vertex: 'right_hip', p2: 'right_knee' },
  // Knees
  { name: 'left_knee', p1: 'left_hip', vertex: 'left_knee', p2: 'left_ankle' },
  { name: 'right_knee', p1: 'right_hip', vertex: 'right_knee', p2: 'right_ankle' },
  // Ankles (Optional - can be less stable)
  { name: 'left_ankle', p1: 'left_knee', vertex: 'left_ankle', p2: 'left_foot_index' },
  { name: 'right_ankle', p1: 'right_knee', vertex: 'right_ankle', p2: 'right_foot_index' },
];

/**
 * Calculates the angle between three 2D points using atan2.
 * @param kp1 Keypoint object for the first point.
 * @param kpVertex Keypoint object for the vertex (center point).
 * @param kp2 Keypoint object for the second point.
 * @returns Angle in degrees (0-180 based on common joint usage), or null if input is invalid.
 */
function calculateAngle2D(kp1, kpVertex, kp2) {
  if (!kp1 || !kpVertex || !kp2) {
    return null;
  }
  
  const radToDeg = 180.0 / Math.PI;
  // Calculate vectors
  const v1x = kp1.x - kpVertex.x;
  const v1y = kp1.y - kpVertex.y;
  const v2x = kp2.x - kpVertex.x;
  const v2y = kp2.y - kpVertex.y;
  
  // Calculate angles of vectors using atan2
  const angle1 = Math.atan2(v1y, v1x);
  const angle2 = Math.atan2(v2y, v2x);
  
  // Calculate difference in angles
  let angleDiff = angle2 - angle1;
  
  // Normalize to range [-PI, PI] to get the smaller angle
  while (angleDiff <= -Math.PI) angleDiff += 2 * Math.PI;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  
  // Convert to degrees and return absolute value (common for joint angles)
  return Math.abs(angleDiff * radToDeg);
}

export default function VideoDemo() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [videoPath, setVideoPath] = useState(DEFAULT_VIDEO_PATH);
  const [currentAngles, setCurrentAngles] = useState({});
  const lastUpdateTimeRef = useRef(0);
  const UPDATE_INTERVAL_MS = 200; // Send data to LLM every 200ms (5 times/sec)

  useEffect(() => {
    // Load TensorFlow.js and MediaPipe scripts
    const loadScripts = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose');
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load required libraries. Please check your internet connection.');
        console.error('Script loading error:', err);
      }
    };

    loadScripts();
  }, []);

  // --- Define the async function to send data (Placeholder) ---
  const sendAnglesToLLM = async (angles) => {
    console.log("Throttled Send to LLM:", angles);
    // Example fetch implementation - commented out
    // try {
    //   const response = await fetch('/api/your-llm-endpoint', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ poseAngles: angles, timestamp: Date.now() })
    //   });
    //   if (!response.ok) {
    //     console.error("LLM API Error:", response.statusText);
    //   }
    //   // const result = await response.json();
    //   // console.log("LLM Response:", result);
    // } catch (error) {
    //   console.error("Failed to send angles to LLM:", error);
    // }
  };

  useEffect(() => {
    let detector;
    let rafId;

    // Define connections between keypoints for drawing lines
    const connections = [
      // Face connections
      ['nose', 'left_eye_inner'],
      ['left_eye_inner', 'left_eye'],
      ['left_eye', 'left_eye_outer'],
      ['left_eye_outer', 'left_ear'],
      ['nose', 'right_eye_inner'],
      ['right_eye_inner', 'right_eye'],
      ['right_eye', 'right_eye_outer'],
      ['right_eye_outer', 'right_ear'],
      ['mouth_left', 'mouth_right'],
      
      // Torso connections
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      
      // Left arm connections
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['left_wrist', 'left_thumb'],
      ['left_wrist', 'left_index'],
      ['left_wrist', 'left_pinky'],
      
      // Right arm connections
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['right_wrist', 'right_thumb'],
      ['right_wrist', 'right_index'],
      ['right_wrist', 'right_pinky'],
      
      // Left leg connections
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['left_ankle', 'left_heel'],
      ['left_ankle', 'left_foot_index'],
      
      // Right leg connections
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
      ['right_ankle', 'right_heel'],
      ['right_ankle', 'right_foot_index']
    ];

    const initializeDetector = async () => {
      if (!window.poseDetection) return null;
      
      await window.tf.setBackend('webgl');
      const detectorConfig = { 
        modelType: 'full', 
        enableSmoothing: true, 
        runtime: 'mediapipe', 
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose' 
      };
      
      return await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.BlazePose, 
        detectorConfig
      );
    };

    // --- Function to process pose and calculate angles ---
    const processPose = (pose) => {
      const calculatedAngles = {};
      if (pose.keypoints) {
        const keypointMap = {};
        pose.keypoints.forEach(keypoint => {
          keypointMap[keypoint.name] = keypoint;
        });

        for (const angleDef of ANGLE_DEFINITIONS) {
          const kp1 = keypointMap[angleDef.p1];
          const kpVertex = keypointMap[angleDef.vertex];
          const kp2 = keypointMap[angleDef.p2];

          const confidenceThreshold = 0.4; // Confidence threshold
          if (kp1?.score > confidenceThreshold &&
              kpVertex?.score > confidenceThreshold &&
              kp2?.score > confidenceThreshold)
          {
            const angle = calculateAngle2D(kp1, kpVertex, kp2);
            calculatedAngles[angleDef.name] = angle;
          } else {
            calculatedAngles[angleDef.name] = null;
          }
        }
      }
      
      // Update state with the newly calculated angles
      setCurrentAngles(calculatedAngles);

      // Throttle sending data to LLM
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > UPDATE_INTERVAL_MS) {
        lastUpdateTimeRef.current = now;
        sendAnglesToLLM(calculatedAngles); // Call the async send function
      }
    };

    const drawResults = (pose, ctx) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      if (pose.keypoints3D && pose.keypoints) {
        // Create a map for quick look-up
        const keypointMap = {};
        pose.keypoints.forEach(keypoint => {
          keypointMap[keypoint.name] = keypoint;
        });
        
        // Draw connections
        ctx.strokeStyle = 'aqua';
        ctx.lineWidth = 2;
        
        connections.forEach(([firstPoint, secondPoint]) => {
          const kp1 = keypointMap[firstPoint];
          const kp2 = keypointMap[secondPoint];
          
          if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
          }
        });
        
        // Draw keypoints with size based on Z-index
        pose.keypoints3D.forEach(keypoint => {
          const point = keypointMap[keypoint.name];
          if (point && point.score > 0.3) {
            // Normalize z value for visualization
            const normalizedZ = Math.abs(keypoint.z);
            const circleSize = Math.max(3, Math.min(15, 5 + normalizedZ * 20));
            
            // Color based on depth
            const depthIntensity = Math.min(255, Math.max(0, 128 + normalizedZ * 255));
            ctx.fillStyle = `rgb(${255 - depthIntensity}, ${depthIntensity}, 255)`;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, circleSize, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
        
        // Draw Angles Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.strokeStyle = 'black'; // Outline for better visibility
        ctx.lineWidth = 2;
        let yPos = 20; // Start position for text
        for (const [name, angle] of Object.entries(currentAngles)) {
          if (angle !== null) {
            const text = `${name}: ${angle.toFixed(1)}°`;
            ctx.strokeText(text, 15, yPos); // Draw outline first
            ctx.fillText(text, 15, yPos);   // Then fill text
            yPos += 18; // Increase spacing
          }
        }
      }
    };

    const detectPose = async () => {
      if (!detector || !videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const ctx = canvasRef.current.getContext('2d');
      
      if (video.paused || video.ended) {
        setIsProcessing(false);
        return;
      }
      
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        // Process the detected pose to calculate angles
        processPose(poses[0]);
        
        // Draw the visualization
        drawResults(poses[0], ctx);
      }
      
      rafId = requestAnimationFrame(detectPose);
    };

    const loadVideo = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set up video source
        video.src = videoPath;
        
        video.onloadedmetadata = async () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Initialize detector
          detector = await initializeDetector();
          if (!detector) {
            setError('Failed to initialize pose detector');
            return;
          }
          
          // Add event listeners for video playback
          video.onplay = () => {
            if (!isProcessing) {
              setIsProcessing(true);
              detectPose();
            }
          };
          
          video.onpause = () => {
            if (rafId) {
              cancelAnimationFrame(rafId);
            }
            setIsProcessing(false);
          };
          
          video.onended = () => {
            if (rafId) {
              cancelAnimationFrame(rafId);
            }
            setIsProcessing(false);
          };
        };
        
        video.onerror = (e) => {
          setError(`Video error: Could not load the video from ${videoPath}`);
          console.error('Video error:', e);
        };
        
      } catch (err) {
        setError(`Error loading video: ${err.message}`);
        console.error('Video setup error:', err);
      }
    };

    // If libraries are loaded and the component is mounted, load the video
    if (!isLoading && videoRef.current && canvasRef.current && !error) {
      loadVideo();
    }

    // Cleanup function
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [isLoading, videoPath, error]);

  // Handle custom API path set through code (for demonstration)
  const setCustomVideoPath = (path) => {
    // In a real application, this would come from an API or props
    setVideoPath(path);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>BlazePose Video Demo with Angles</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>BlazePose GHUM Video Demo with Angles</h1>
        
        <div className={styles.backLink}>
          <Link href="/">Back to Home</Link>
        </div>

        {isLoading && <p className={styles.loading}>Loading libraries...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.controls}>
          <h3>Current Video Path:</h3>
          <code className={styles.path}>{videoPath}</code>
          <p className={styles.info}>
            To change the video path, modify the DEFAULT_VIDEO_PATH constant in video-demo.js
          </p>
        </div>
        
        <div className={styles.demoContainer}>
          <div className={styles.videoContainer}>
            <video ref={videoRef} className={styles.video} controls />
            <canvas ref={canvasRef} className={styles.canvas} />
            
            {/* Optional: Raw angles display for debugging */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px', fontSize: '10px', zIndex: 10, maxHeight: '100px', overflowY: 'auto' }}>
              Raw Angles:
              <pre style={{ margin: 0 }}>{JSON.stringify(currentAngles, null, 1)}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to load scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
} 