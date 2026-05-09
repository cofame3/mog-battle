import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model = null;

// Initialize model ahead of time
export const initModel = async () => {
  if (!model) {
    try {
      await tf.ready();
      model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          maxFaces: 1,
        }
      );
      console.log('FaceLandmarksDetection model loaded successfully.');
    } catch (e) {
      console.error('Error loading FaceLandmarksDetection model:', e);
    }
  }
};

// Helper: Calculate distance between two 3D points
const distance = (p1, p2) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2) + 
    Math.pow(p1.z - p2.z, 2)
  );
};

// Helper: Calculate angle between two points (for Canthal Tilt)
const calculateAngle = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

// Helper: Distance from point to a line (for symmetry)
const distanceToLine = (point, linePoint1, linePoint2) => {
  const num = Math.abs(
    (linePoint2.y - linePoint1.y) * point.x - 
    (linePoint2.x - linePoint1.x) * point.y + 
    linePoint2.x * linePoint1.y - 
    linePoint2.y * linePoint1.x
  );
  const den = Math.sqrt(
    Math.pow(linePoint2.y - linePoint1.y, 2) + 
    Math.pow(linePoint2.x - linePoint1.x, 2)
  );
  return num / den;
};

export const analyzeAppearance = async (mediaElement) => {
  if (!model) await initModel();

  if (model && mediaElement) {
    try {
      // Create an offscreen canvas to guarantee the model gets a static frame
      const canvas = document.createElement('canvas');
      canvas.width = mediaElement.videoWidth || mediaElement.naturalWidth || 640;
      canvas.height = mediaElement.videoHeight || mediaElement.naturalHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);

      let faces = await model.estimateFaces(canvas);
      
      // If it fails on the first try, try one more time
      if (faces.length === 0) {
        await new Promise(r => setTimeout(r, 100)); // wait 100ms
        ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
        faces = await model.estimateFaces(canvas);
      }
      
      if (faces.length === 0) {
        return {
          error: true,
          verdict: "FACE NOT FOUND",
          total: 0,
          symmetry: 0,
          jawline: 0,
          eyes: 0
        };
      }

      const keypoints = faces[0].keypoints;

      // --- 1. EYES SCORE (Canthal Tilt) ---
      // Right eye (on screen): Outer = 33, Inner = 133
      // Left eye (on screen): Inner = 362, Outer = 263
      const rightOuter = keypoints[33];
      const rightInner = keypoints[133];
      const leftInner = keypoints[362];
      const leftOuter = keypoints[263];

      // Screen Y grows downwards, so positive tilt = outer Y < inner Y
      const rightTilt = calculateAngle(rightOuter, rightInner); // Should be negative for hunter eyes
      const leftTilt = calculateAngle(leftInner, leftOuter);    // Should be negative for hunter eyes
      
      // Calculate average tilt angle (normalized)
      // A "perfect" hunter eye tilt is around 5-8 degrees upwards.
      const avgTilt = ((rightInner.y - rightOuter.y) + (leftInner.y - leftOuter.y)) / 2;
      
      let eyesScore = 50 + (avgTilt * 2); // Base 50, +points for positive tilt
      if (eyesScore > 99) eyesScore = 99;
      if (eyesScore < 10) eyesScore = 10;


      // --- 2. JAWLINE SCORE ---
      // Bizygomatic width (Cheekbones): 234 (Right) to 454 (Left)
      // Bigonial width (Jaw): 132 (Right) to 361 (Left)
      const rightCheek = keypoints[234];
      const leftCheek = keypoints[454];
      const rightJaw = keypoints[132];
      const leftJaw = keypoints[361];

      const cheekWidth = distance(rightCheek, leftCheek);
      const jawWidth = distance(rightJaw, leftJaw);

      // Ratio of jaw width to cheek width (Ideal male is often > 0.85)
      const jawRatio = jawWidth / cheekWidth;
      
      let jawScore = (jawRatio - 0.70) * 300; // Normalize: 0.70 -> 0, 0.85 -> 45, 1.0 -> 90
      if (jawScore > 99) jawScore = 99;
      if (jawScore < 10) jawScore = 10;


      // --- 3. SYMMETRY SCORE ---
      // Center line defined by Nose bridge (8) and Chin (152)
      const noseBridge = keypoints[8];
      const chin = keypoints[152];

      // Measure deviation of pairs from center line
      const rightCheekDist = distanceToLine(rightCheek, noseBridge, chin);
      const leftCheekDist = distanceToLine(leftCheek, noseBridge, chin);
      const cheekDiff = Math.abs(rightCheekDist - leftCheekDist);

      const rightJawDist = distanceToLine(rightJaw, noseBridge, chin);
      const leftJawDist = distanceToLine(leftJaw, noseBridge, chin);
      const jawDiff = Math.abs(rightJawDist - leftJawDist);

      const totalDiff = (cheekDiff + jawDiff) / cheekWidth; // Normalized by face size

      let symScore = 100 - (totalDiff * 500); 
      if (symScore > 99) symScore = 99;
      if (symScore < 10) symScore = 10;


      // --- FINAL SCORE CALCULATION ---
      // Adding a slight random noise to make it feel "organic" but keeping it 95% realistic
      const noise = () => (Math.random() * 4) - 2;

      const finalEyes = Math.floor(eyesScore + noise());
      const finalJaw = Math.floor(jawScore + noise());
      const finalSym = Math.floor(symScore + noise());

      // Weighted Total (Jawline is very important in mogging, Symmetry is baseline)
      const total = Math.floor((finalEyes * 0.35) + (finalJaw * 0.45) + (finalSym * 0.20));

      let verdict = "DECENT";
      if (total >= 90) verdict = "CHAD";
      else if (total >= 80) verdict = "CHADLITE";
      else if (total >= 72) verdict = "HTN";
      else if (total >= 65) verdict = "MTN";
      else if (total >= 55) verdict = "LTN";
      else if (total >= 45) verdict = "SUB-5";
      else if (total >= 35) verdict = "SUB-3";
      else verdict = "IT'S OVER";

      return { 
        symmetry: Math.max(10, Math.min(99, finalSym)), 
        jawline: Math.max(10, Math.min(99, finalJaw)), 
        eyes: Math.max(10, Math.min(99, finalEyes)), 
        total: Math.max(10, Math.min(99, total)), 
        verdict, 
        error: false 
      };

    } catch (e) {
      console.error("Face landmarks detection failed", e);
    }
  }

  // Fallback in case of internal failure
  return {
    error: true,
    verdict: "EVALUATION FAILED",
    total: 0,
    symmetry: 0,
    jawline: 0,
    eyes: 0
  };
};
