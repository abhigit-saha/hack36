/**
 * Calculates the angle between three 2D points using atan2.
 * @param kp1 Keypoint object for the first point.
 * @param kpVertex Keypoint object for the vertex (center point).
 * @param kp2 Keypoint object for the second point.
 * @returns Angle in degrees (0-360), or null if input is invalid.
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
  
    // Normalize to range [0, 2*PI]
    // if (angleDiff < 0) {
    //   angleDiff += 2 * Math.PI;
    // }
    // Normalize to range [-PI, PI] then convert to degrees [0, 360] if needed
    // This normalization gives the smaller angle, typically desired for joints
     while (angleDiff <= -Math.PI) angleDiff += 2 * Math.PI;
     while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  
  
    // Convert to degrees and return absolute value (common for joint angles)
    return Math.abs(angleDiff * radToDeg);
  }