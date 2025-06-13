// FILE: js/camera_control.js
'use strict';

let simulationContainer = null;
let zoomLevel = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_INCREMENT = 0.1;
let isUserScrolling = false;
let scrollTimeoutId = null;

let zoomInButton = null;
let zoomOutButton = null;

/**
 * Initializes camera controls with the simulation container and buttons.
 * @param {HTMLElement} container - The main simulation log container.
 * @param {HTMLElement} zInBtn - The zoom-in button.
 * @param {HTMLElement} zOutBtn - The zoom-out button.
 */
export function initializeCameraControls(container, zInBtn, zOutBtn) {
    simulationContainer = container;
    zoomInButton = zInBtn;
    zoomOutButton = zOutBtn;

    if (simulationContainer) {
        // Detect manual scroll
        simulationContainer.addEventListener('scroll', () => {
            isUserScrolling = true;
            clearTimeout(scrollTimeoutId);
            scrollTimeoutId = setTimeout(() => {
                isUserScrolling = false;
            }, 1000); // User is considered "done" scrolling after 1s of no scroll events
        });
    }

    if (zoomInButton) {
        zoomInButton.addEventListener('click', handleZoomIn);
    }
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', handleZoomOut);
    }
    updateZoomButtons();
}

/**
 * Enables camera controls.
 * @param {HTMLElement} container - The simulation container to apply controls to.
 */
export function enableCameraControls(container) {
    simulationContainer = container; // Ensure it's set if called standalone
    if (zoomInButton) zoomInButton.disabled = false;
    if (zoomOutButton) zoomOutButton.disabled = false;
    updateZoomButtons();
}

/**
 * Disables camera controls.
 */
export function disableCameraControls() {
    if (zoomInButton) zoomInButton.disabled = true;
    if (zoomOutButton) zoomOutButton.disabled = true;
}

/**
 * Resets camera zoom and scroll position.
 * @param {HTMLElement} container - The simulation container.
 */
export function resetCamera(container) {
    simulationContainer = container || simulationContainer;
    if (simulationContainer) {
        zoomLevel = 1.0;
        applyZoom();
        simulationContainer.scrollTop = 0; // Scroll to top
    }
    isUserScrolling = false;
    updateZoomButtons();
}

/**
 * Scrolls the simulation container to keep the latest message in view.
 * Only scrolls if the user is not currently manually scrolling.
 * @param {HTMLElement} container - The simulation container.
 * @param {HTMLElement} latestMessageElement - The newly added message element.
 */
export function focusOnLatestMessage(container, latestMessageElement) {
    simulationContainer = container || simulationContainer;
    if (simulationContainer && latestMessageElement && !isUserScrolling) {
        // Smooth scroll to the bottom or to the element
        // latestMessageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        // A simpler scrollTop for potentially better control with typewriter
        simulationContainer.scrollTop = simulationContainer.scrollHeight;
    }
}

/**
 * Handles zoom-in button click.
 */
function handleZoomIn() {
    if (zoomLevel < MAX_ZOOM) {
        zoomLevel = parseFloat((zoomLevel + ZOOM_INCREMENT).toFixed(2)); // toFixed to handle floating point issues
        zoomLevel = Math.min(zoomLevel, MAX_ZOOM);
        applyZoom();
    }
    updateZoomButtons();
}

/**
 * Handles zoom-out button click.
 */
function handleZoomOut() {
    if (zoomLevel > MIN_ZOOM) {
        zoomLevel = parseFloat((zoomLevel - ZOOM_INCREMENT).toFixed(2));
        zoomLevel = Math.max(zoomLevel, MIN_ZOOM);
        applyZoom();
    }
    updateZoomButtons();
}

/**
 * Applies the current zoom level to the simulation container.
 */
function applyZoom() {
    if (simulationContainer) {
        // It's often better to zoom a child content wrapper than the scroll container itself
        // to avoid issues with scrollbar calculations. Assuming a direct child or the container itself for now.
        simulationContainer.style.transformOrigin = 'top left'; // Or 'center center' depending on desired effect
        simulationContainer.style.transform = `scale(${zoomLevel})`;

        // If zooming the container itself, might need to adjust parent height or overflow
        // For simplicity, this example scales the container. A more robust solution might scale an inner div.
    }
}

/**
 * Updates the enabled/disabled state of zoom buttons based on current zoom level.
 */
function updateZoomButtons() {
    if (zoomInButton) {
        zoomInButton.disabled = zoomLevel >= MAX_ZOOM;
    }
    if (zoomOutButton) {
        zoomOutButton.disabled = zoomLevel <= MIN_ZOOM;
    }
}