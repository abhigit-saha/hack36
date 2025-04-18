// Define outside the component for performance
interface AngleDefinition {
    name: string;
    p1: string;
    vertex: string;
    p2: string;
  }
  
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
  
    // Shoulder Abduction/Adduction (Arm relative to torso width) - Optional
    // { name: 'left_shoulder_abduction', p1: 'left_elbow', vertex: 'left_shoulder', p2: 'right_shoulder' },
    // { name: 'right_shoulder_abduction', p1: 'right_elbow', vertex: 'right_shoulder', p2: 'left_shoulder' },
  
    // Hip Abduction/Adduction (Leg relative to hip width) - Optional
    // { name: 'left_hip_abduction', p1: 'left_knee', vertex: 'left_hip', p2: 'right_hip' },
    // { name: 'right_hip_abduction', p1: 'right_knee', vertex: 'right_hip', p2: 'left_hip' },
  ];
  
  // Type for keypoint data (adjust if your types are different)
  interface Keypoint {
    x: number;
    y: number;
    z?: number; // Optional z
    score: number;
    name: string;
  }