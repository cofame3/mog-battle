import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let model = null;
let _liveCanvas = null; // reusable offscreen canvas for getLiveFaces
let _liveCtx = null;

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

export const getLiveFaces = async (mediaElement) => {
  if (!model) await initModel();
  if (model && mediaElement) {
    try {
      const w = mediaElement.videoWidth || mediaElement.naturalWidth || 640;
      const h = mediaElement.videoHeight || mediaElement.naturalHeight || 480;
      if (w === 0 || h === 0) return null;

      // Reuse a single offscreen canvas to avoid GC pressure
      if (!_liveCanvas) {
        _liveCanvas = document.createElement('canvas');
        _liveCtx = _liveCanvas.getContext('2d');
      }
      if (_liveCanvas.width !== w) _liveCanvas.width = w;
      if (_liveCanvas.height !== h) _liveCanvas.height = h;

      _liveCtx.drawImage(mediaElement, 0, 0, w, h);
      return await model.estimateFaces(_liveCanvas);
    } catch (e) {
      return null;
    }
  }
  return null;
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
      const width = canvas.width;
      const height = canvas.height;


      // --- 1. EYES SCORE (Canthal Tilt) ---
      const rightOuter = keypoints[33];
      const rightInner = keypoints[133];
      const leftInner = keypoints[362];
      const leftOuter = keypoints[263];

      // Screen Y grows downwards
      const rightTiltVal = ((rightInner.y - rightOuter.y) / distance(rightOuter, rightInner) * 100);
      const leftTiltVal = ((leftInner.y - leftOuter.y) / distance(leftInner, leftOuter) * 100);
      const avgTiltPct = (rightTiltVal + leftTiltVal) / 2;

      // --- 2. JAWLINE CALCULATIONS ---
      const rightCheek = keypoints[454];
      const leftCheek = keypoints[234];
      const rightJaw = keypoints[361];
      const leftJaw = keypoints[132];

      const cheekWidth = distance(rightCheek, leftCheek);
      const jawWidth = distance(rightJaw, leftJaw);
      const jawRatio = jawWidth / cheekWidth;


      // --- BRUTAL FEATURES + EASY SYMMETRY ---

      // 1. Eyes: Back to Brutal (Base 25)
      let eyesScore = 25 + (avgTiltPct * 5);
      if (avgTiltPct < 0) eyesScore = 20 + (avgTiltPct * 20);
      if (eyesScore > 99) eyesScore = 99;
      if (eyesScore < 5) eyesScore = 5;

      // 2. Jaw: Back to Expert (0.86 threshold)
      let jawScore = (jawRatio - 0.86) * 600 + 20;
      if (jawScore > 99) jawScore = 99;
      if (jawScore < 5) jawScore = 5;

      // 3. Symmetry: STAY EASY (Base 98, low penalty)
      const noseBridge = keypoints[8];
      const chin = keypoints[152];

      const rightCheekDist = distanceToLine(rightCheek, noseBridge, chin);
      const leftCheekDist = distanceToLine(leftCheek, noseBridge, chin);
      const rightJawDist = distanceToLine(rightJaw, noseBridge, chin);
      const leftJawDist = distanceToLine(leftJaw, noseBridge, chin);

      const totalDiff = (Math.abs(rightCheekDist - leftCheekDist) + Math.abs(rightJawDist - leftJawDist)) / cheekWidth;

      const effectiveDiff = Math.max(0, totalDiff - 0.035);
      let symScore = 98 - (effectiveDiff * 150);
      if (symScore > 99) symScore = 99;
      if (symScore < 10) symScore = 10;

      // 4. Nose: Extreme penalty for wide nose (Expert Mode)
      const noseLeft = keypoints[102];
      const noseRight = keypoints[331];
      const noseWidth = distance(noseLeft, noseRight);
      const noseRatio = noseWidth / cheekWidth;

      let noseScore = 90 - (Math.abs(noseRatio - 0.27) * 1500);
      if (noseScore > 99) noseScore = 99;
      if (noseScore < 5) noseScore = 5;


      // --- FINAL SCORE CALCULATION ---
      const noise = () => (Math.random() * 2) - 1;

      const finalEyes = Math.floor(eyesScore + noise());
      const finalJaw = Math.floor(jawScore + noise());
      const finalSym = Math.floor(symScore + noise());
      const finalNose = Math.floor(noseScore + noise());

      // Weighted Total (Including Nose)
      // Eyes: 30%, Jaw: 30%, Sym: 20%, Nose: 20%
      const total = Math.floor(
        (finalEyes * 0.30) +
        (finalJaw * 0.30) +
        (finalSym * 0.20) +
        (finalNose * 0.20)
      );

      let verdict = "DECENT";
      if (total >= 90) verdict = "CHAD";
      else if (total >= 80) verdict = "CHADLITE";
      else if (total >= 72) verdict = "HTN";
      else if (total >= 65) verdict = "MTN";
      else if (total >= 55) verdict = "LTN";
      else if (total >= 45) verdict = "SUB-5";
      else if (total >= 35) verdict = "SUB-3";
      else verdict = "IT'S OVER";

      // Extra measurements for PSL report
      const jawRatioFinal = jawRatio.toFixed(2);
      const noseRatioFinal = noseRatio.toFixed(2);
      const rightCanthalTilt = ((rightInner.y - rightOuter.y) / distance(rightOuter, rightInner) * 100).toFixed(1);
      const leftCanthalTilt = ((leftInner.y - leftOuter.y) / distance(leftInner, leftOuter) * 100).toFixed(1);

      // Philtrum (nose tip to upper lip)
      const noseTipPt = keypoints[4];
      const upperLipPt = keypoints[0];
      const philtrumRatio = noseTipPt && upperLipPt ? (distance(noseTipPt, upperLipPt) / distance(noseBridge, chin)).toFixed(2) : null;

      return {
        symmetry: Math.max(10, Math.min(99, finalSym)),
        jawline: Math.max(10, Math.min(99, finalJaw)),
        eyes: Math.max(10, Math.min(99, finalEyes)),
        nose: Math.max(10, Math.min(99, finalNose)),
        total: Math.max(10, Math.min(99, total)),
        verdict,
        error: false,
        keypoints: keypoints.map(pt => ({
          x: pt.x / width,
          y: pt.y / height
        })),
        psl: {
          canthalTiltR: parseFloat(rightCanthalTilt),
          canthalTiltL: parseFloat(leftCanthalTilt),
          jawRatio: parseFloat(jawRatioFinal),
          noseRatio: parseFloat(noseRatioFinal),
          philtrumRatio: philtrumRatio ? parseFloat(philtrumRatio) : null,
          cheekWidth,
          jawWidth,
        }
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
