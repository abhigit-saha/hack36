"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Assuming your styles are correctly set up
import styles from '../styles/Demo1.module.css'; // Ensure this path is correct
import { updateAngles } from '../utils/angleStore';

// Define types for MediaPipe/TensorFlow if available, otherwise use 'any' cautiously
declare global {
    interface Window {
        tf: any;
        poseDetection: any;
        MediaPipePose: any; // Or specific type if known
    }
}

// --- Angle Calculation Setup (Outside Component) ---

// Type for keypoint data
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
const ANGLE_DEFINITIONS: AngleDefinition[] = [
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
function calculateAngle2D(kp1: Keypoint, kpVertex: Keypoint, kp2: Keypoint): number | null {
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

// --- React Component ---

export default function LiveDemo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Use refs for things that don't need to trigger re-renders but need persistence
    const detectorRef = useRef<any>(null); // Store the detector instance
    const rafRef = useRef<number | null>(null); // Store requestAnimationFrame ID
    const streamRef = useRef<MediaStream | null>(null); // Store the stream
    const isInitializedRef = useRef<boolean>(false); // Flag to prevent re-initialization

    // --- State and Refs for Angle Calculation ---
    const [currentAngles, setCurrentAngles] = useState<Record<string, number | null>>({});
    const lastUpdateTimeRef = useRef<number>(0); // For throttling LLM calls
    const UPDATE_INTERVAL_MS = 200; // Send data to LLM every 200ms (5 times/sec)

    // Define connections (moved outside component body as it's constant)
    const connections = [
        ['nose', 'left_eye_inner'], ['left_eye_inner', 'left_eye'], ['left_eye', 'left_eye_outer'],
        ['left_eye_outer', 'left_ear'], ['nose', 'right_eye_inner'], ['right_eye_inner', 'right_eye'],
        ['right_eye', 'right_eye_outer'], ['right_eye_outer', 'right_ear'], ['mouth_left', 'mouth_right'],
        ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
        ['left_wrist', 'left_thumb'], ['left_wrist', 'left_index'], ['left_wrist', 'left_pinky'],
        ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['right_wrist', 'right_thumb'],
        ['right_wrist', 'right_index'], ['right_wrist', 'right_pinky'], ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'], ['left_ankle', 'left_heel'], ['left_ankle', 'left_foot_index'],
        ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'], ['right_ankle', 'right_heel'],
        ['right_ankle', 'right_foot_index']
    ];

    // Helper function to load scripts (remains the same)
    const loadScript = useCallback((src: string) => {
        return new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve(); // Already loaded
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (err) => reject(`Failed to load script: ${src}. Error: ${err}`);
            document.head.appendChild(script);
        });
    }, []);

    // Effect for loading scripts ONCE on mount
    useEffect(() => {
        const loadScripts = async () => {
            try {
                console.log("Loading scripts...");
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter');
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose');
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection');
                console.log("Scripts loaded successfully.");
                setIsLoading(false);
            } catch (err: any) {
                setError(typeof err === 'string' ? err : 'Failed to load required libraries. Check console.');
                console.error('Script loading error:', err);
                setIsLoading(false);
            }
        };
        loadScripts();
    }, [loadScript]);

     // --- Define the async function to send data (Placeholder) ---
     const sendAnglesToLLM = async (angles: Record<string, number | null>) => {
        console.log("Throttled Send to LLM:", angles); // Replace with actual API call
        // Example fetch:
        // try {
        //   const response = await fetch('/api/your-llm-endpoint', { // Your actual API route
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ poseAngles: angles, timestamp: Date.now() })
        //   });
        //   if (!response.ok) {
        //     console.error("LLM API Error:", response.statusText);
        //   }
        //   // const result = await response.json(); // Handle response if needed
        //   // console.log("LLM Response:", result);
        // } catch (error) {
        //   console.error("Failed to send angles to LLM:", error);
        // }
    };


    // Main effect for initialization and running pose estimation
    useEffect(() => {
        // Ensure running only on client-side and after scripts are loaded
        if (typeof window === 'undefined' || isLoading || error || isInitializedRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            console.warn("Video or Canvas ref not available yet.");
            return;
        }

        // --- Define functions inside useEffect or use useCallback ---
        const drawResults = (pose: any, ctx: CanvasRenderingContext2D) => {
            // Ensure canvas dimensions match video to prevent distortion
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const keypointMap: { [key: string]: Keypoint } = {}; // Renamed for clarity
             if (pose.keypoints) { // Check keypoints exist for mapping
                 pose.keypoints.forEach((keypoint: Keypoint) => {
                     keypointMap[keypoint.name] = keypoint;
                 });
             }

            // Draw connections (only if keypoints available)
            if (pose.keypoints) {
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
            }

            // Draw keypoints with size based on Z-index (only if keypoints3D available)
            if (pose.keypoints3D && pose.keypoints) { // Need both for this visualization
                pose.keypoints3D.forEach((keypoint3D: any) => {
                    const point = keypointMap[keypoint3D.name]; // Lookup corresponding 2D point
                    if (point && point.score > 0.3) {
                        const normalizedZ = Math.abs(keypoint3D.z);
                        const circleSize = Math.max(3, Math.min(15, 5 + normalizedZ * 20));
                        const depthIntensity = Math.min(255, Math.max(0, 128 + normalizedZ * 255));
                        ctx.fillStyle = `rgb(${255 - depthIntensity}, ${depthIntensity}, 255)`;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, circleSize, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                });
            } else if (pose.keypoints) {
                 // Fallback: Draw simple keypoints if 3D data is unavailable
                 ctx.fillStyle = 'red';
                 const circleSize = 5;
                 pose.keypoints.forEach((point: Keypoint) => {
                     if (point.score > 0.3) {
                         ctx.beginPath();
                         ctx.arc(point.x, point.y, circleSize, 0, 2 * Math.PI);
                         ctx.fill();
                     }
                 });
             }


            // Draw Angles Text
             ctx.fillStyle = 'white';
             ctx.font = 'bold 12px Arial';
             ctx.strokeStyle = 'black'; // Outline for better visibility
             ctx.lineWidth = 2;
             let yPos = 20; // Start lower
             for (const [name, angle] of Object.entries(currentAngles)) {
                 if (angle !== null) {
                     const text = `${name}: ${angle.toFixed(1)}°`;
                     ctx.strokeText(text, 15, yPos); // Draw outline first
                     ctx.fillText(text, 15, yPos);   // Then fill text
                     yPos += 18; // Increase spacing
                 }
             }
        };

        // --- Function to process pose and calculate angles ---
         const processPose = (pose: any) => {
             const calculatedAngles: Record<string, number | null> = {};
             if (pose.keypoints) {
                 const keypointMap: { [key: string]: Keypoint } = {};
                 pose.keypoints.forEach((keypoint: Keypoint) => {
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
             
             // Send angles to the angle store
             updateAngles(calculatedAngles, 'live');

             // Throttle sending data to LLM
             const now = Date.now();
             if (now - lastUpdateTimeRef.current > UPDATE_INTERVAL_MS) {
                 lastUpdateTimeRef.current = now;
                 sendAnglesToLLM(calculatedAngles); // Call the async send function
             }
         };


        const detectPose = async () => {
            // Ensure refs are current and video is ready
            const currentDetector = detectorRef.current;
            const currentVideo = videoRef.current;
            const currentCanvas = canvasRef.current;

            if (!currentDetector || !currentVideo || currentVideo.readyState < 2 || !currentCanvas) {
                rafRef.current = requestAnimationFrame(detectPose); // Keep trying if not ready
                return;
            }

            try {
                const poses = await currentDetector.estimatePoses(currentVideo, {
                    flipHorizontal: false // Input is already flipped via CSS
                });
                const ctx = currentCanvas.getContext('2d');

                if (poses && poses.length > 0 && ctx) {
                     // --- Process the detected pose ---
                     processPose(poses[0]);

                     // --- Draw the visualization ---
                     drawResults(poses[0], ctx);
                } else if (ctx) {
                     // Optional: Clear previous drawings if no pose is detected
                     ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
                     // Reset angles if no pose? Optional.
                     // setCurrentAngles({});
                 }

            } catch (err) {
                console.error("Error during pose estimation:", err);
                // Consider how to handle errors, e.g., stop loop or show message
            }

            rafRef.current = requestAnimationFrame(detectPose); // Loop for next frame
        };

        const startPoseEstimation = async () => {
            console.log("Starting pose estimation setup...");
            if (!window.tf || !window.poseDetection) {
                setError("TensorFlow or PoseDetection not available.");
                console.error("TF or PoseDetection missing from window.");
                return;
            }

            try {
                await window.tf.setBackend('webgl');
                console.log("WebGL backend set.");

                const detectorConfig = {
                     modelType: 'full',
                     enableSmoothing: true,
                     runtime: 'mediapipe',
                     solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
                 };
                 detectorRef.current = await window.poseDetection.createDetector(
                     window.poseDetection.SupportedModels.BlazePose,
                     detectorConfig
                 );
                 console.log("Detector created.");

                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("getUserMedia is not supported by this browser.");
                }
                 streamRef.current = await navigator.mediaDevices.getUserMedia({
                     video: { width: 640, height: 480 }
                 });
                 video.srcObject = streamRef.current;
                 console.log("Camera stream obtained.");

                video.onloadedmetadata = () => {
                    console.log(`Video metadata loaded. Intrinsic size: ${video.videoWidth}x${video.videoHeight}`);
                     if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                         canvas.width = video.videoWidth;
                         canvas.height = video.videoHeight;
                         console.log(`Canvas attributes set on metadata: ${canvas.width}x${canvas.height}`);
                     }
                    video.play().then(() => {
                        console.log("Video playing.");
                        isInitializedRef.current = true;
                        console.log("Initialization complete. Starting detection loop.");
                        detectPose(); // Start the loop
                    }).catch(playErr => {
                         console.error("Error playing video:", playErr);
                         setError(`Error playing video: ${playErr.message}. Ensure permissions.`);
                     });
                 };
                 video.onerror = (e) => {
                     console.error("Video element error:", e);
                     setError("Video element encountered an error.");
                 };
            } catch (err: any) {
                console.error("Initialization failed:", err);
                setError(`Initialization failed: ${err.message || 'Unknown error'}. Check permissions and console.`);
                if (detectorRef.current) { detectorRef.current.dispose(); detectorRef.current = null; }
                if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
            }
        };

        // --- Start the process ---
        startPoseEstimation();

        // --- Cleanup function ---
        return () => {
            console.log("Running cleanup...");
            isInitializedRef.current = false;
            if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; console.log("RAF cancelled."); }
            if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; console.log("Stream stopped."); }
             if (video && video.srcObject) { // Check video ref before accessing srcObject
                 (video.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
                 video.srcObject = null;
                 console.log("Video src cleared.");
             }
            if (detectorRef.current) { detectorRef.current.dispose(); detectorRef.current = null; console.log("Detector disposed."); }
            console.log("Cleanup complete.");
        };

    }, [isLoading, error, loadScript]); // Dependencies

    return (
        <div className={styles.container}>
            <Head>
                <title>BlazePose Live Demo with Angles</title>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>BlazePose GHUM Live Demo</h1>
                <div className={styles.backLink}>
                    <Link href="/">Back to Home</Link>
                </div>

                {isLoading && <p className={styles.loading}>Loading libraries...</p>}
                {error && <p className={styles.error}>Error: {error}</p>}

                <div className={styles.demoContainer}>
                    {!isLoading && !error && !isInitializedRef.current &&
                        <p className={styles.loading}>Initializing camera and detector...</p>
                    }
                    {/* Apply CSS classes for layout */}
                    <div className={styles.videoContainer} style={{ visibility: isLoading || error ? 'hidden' : 'visible' }}>
                        <video
                            ref={videoRef}
                            className={styles.video} // Use class
                            playsInline
                            muted
                            autoPlay
                        />
                        <canvas
                            ref={canvasRef}
                            className={styles.canvas} // Use class
                            width="640" // Initial attributes
                            height="480"
                        />
                        {/* Optional: Display raw angles for debugging */}
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