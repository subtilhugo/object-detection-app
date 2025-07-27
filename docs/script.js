/*
 * script.js
 *
 * This file drives the TensorFlow.js object detection demo. It loads the
 * pre‑trained COCO‑SSD model, enables the user's webcam, and continuously
 * performs object detection on the live video stream. Results are rendered
 * as bounding boxes and labels layered over the video feed. See index.html
 * for the page structure and style.css for presentation details.
 */

// DOM references
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const enableWebcamButton = document.getElementById('webcamButton');

// Model variable in global scope to store the loaded COCO‑SSD model
let model;

// Array to hold the objects (DOM nodes) created in the previous frame so
// we can remove them before drawing new ones
const children = [];

// Check if the browser supports getUserMedia; return boolean
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Enable the webcam stream and start object detection
function enableCam() {
  // Only continue if the model is loaded
  if (!model) {
    return;
  }
  // Hide the button after it is clicked
  enableWebcamButton.classList.add('removed');
  // Set up constraints for video only
  const constraints = {
    video: true
  };
  // Activate webcam
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

// Main function to run predictions on each frame
function predictWebcam() {
  // Use the model to detect objects in the frame
  model.detect(video).then(predictions => {
    // Remove all previous highlighters and labels
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Loop through predictions and draw bounding boxes/labels for those
    // above a certain confidence threshold
    predictions.forEach(prediction => {
      if (prediction.score > 0.5) {
        // Create label element
        const p = document.createElement('p');
        p.innerText = `${prediction.class} - ${Math.round(prediction.score * 100)}%`;
        // Position the label relative to the bounding box (slightly above)
        p.style.left = `${prediction.bbox[0]}px`;
        p.style.top = `${Math.max(0, prediction.bbox[1] - 20)}px`;
        p.style.width = `${prediction.bbox[2]}px`;
        p.style.height = 'auto';

        // Create bounding box element
        const highlighter = document.createElement('div');
        highlighter.classList.add('highlighter');
        highlighter.style.left = `${prediction.bbox[0]}px`;
        highlighter.style.top = `${prediction.bbox[1]}px`;
        highlighter.style.width = `${prediction.bbox[2]}px`;
        highlighter.style.height = `${prediction.bbox[3]}px`;

        // Append elements to the live view and keep track of them
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    });

    // Schedule the next frame prediction when the browser is ready
    window.requestAnimationFrame(predictWebcam);
  });
}

// If the browser supports webcam access, attach the click handler to the button
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('Webcam not supported by this browser.');
  enableWebcamButton.innerText = 'Webcam not supported';
  enableWebcamButton.disabled = true;
}

// Load the COCO‑SSD model as soon as the page loads. Once loaded, enable
// the webcam button to indicate readiness to the user.
cocoSsd.load().then(loadedModel => {
  model = loadedModel;
  enableWebcamButton.disabled = false;
  enableWebcamButton.innerText = 'Start Webcam';
});
