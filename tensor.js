const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: 'mediapipe', // or 'tfjs'
  modelType: 'full'
};
detector = await handPoseDetection.createDetector(model, detectorConfig);

const video = document.getElementById('video');
const hands = await detector.estimateHands(video);

