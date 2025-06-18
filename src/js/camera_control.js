// FILE: js/camera_control.js
"use strict";

// Version 1.1: Null-Safety Pass

let simulationContainer = null;
let zoomLevel = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_INCREMENT = 0.1;
let isUserScrolling = false;
let scrollTimeoutId = null;

let zoomInButton = null;
let zoomOutButton = null;

export function initializeCameraControls(container, zInBtn, zOutBtn) {
    // container, zInBtn, zOutBtn can be null if IDs are not found in DOM
    simulationContainer = container;
    zoomInButton = zInBtn;
    zoomOutButton = zOutBtn;

    if (simulationContainer) {
        simulationContainer.addEventListener("scroll", () => {
            isUserScrolling = true;
            clearTimeout(scrollTimeoutId); // Clear existing timeout
            scrollTimeoutId = setTimeout(() => {
                isUserScrolling = false;
            }, 1000);
        });
    } else {
        // console.warn("Camera Control: Simulation container not provided for scroll listener.");
    }

    if (zoomInButton) {
        zoomInButton.addEventListener("click", handleZoomIn);
    } else {
        // console.warn("Camera Control: Zoom-in button not provided.");
    }
    if (zoomOutButton) {
        zoomOutButton.addEventListener("click", handleZoomOut);
    } else {
        // console.warn("Camera Control: Zoom-out button not provided.");
    }
    updateZoomButtons(); // Update button states initially
}

export function enableCameraControls(container) {
    if (container) simulationContainer = container; // Update container if a new one is passed
    
    if (zoomInButton) zoomInButton.disabled = false;
    if (zoomOutButton) zoomOutButton.disabled = false;
    updateZoomButtons();
}

export function disableCameraControls() {
    if (zoomInButton) zoomInButton.disabled = true;
    if (zoomOutButton) zoomOutButton.disabled = true;
}

export function resetCamera(container) {
    if (container) simulationContainer = container; // Update if new container passed

    if (simulationContainer) {
        zoomLevel = 1.0;
        applyZoom(); // applyZoom handles null simulationContainer
        simulationContainer.scrollTop = 0;
    }
    isUserScrolling = false; // Reset user scroll lock
    clearTimeout(scrollTimeoutId); // Clear any pending scroll timeout
    updateZoomButtons();
}

export function focusOnLatestMessage(container, latestMessageElement) {
    if (container) simulationContainer = container; // Update if new container passed

    if (simulationContainer && latestMessageElement && !isUserScrolling) {
        // Using scrollTop = scrollHeight is generally more reliable for "always scroll to bottom"
        simulationContainer.scrollTop = simulationContainer.scrollHeight;
    }
}

function handleZoomIn() {
    if (zoomLevel < MAX_ZOOM) {
        zoomLevel = parseFloat((zoomLevel + ZOOM_INCREMENT).toFixed(2));
        zoomLevel = Math.min(zoomLevel, MAX_ZOOM); // Ensure it doesn't exceed MAX_ZOOM
        applyZoom();
    }
    updateZoomButtons();
}

function handleZoomOut() {
    if (zoomLevel > MIN_ZOOM) {
        zoomLevel = parseFloat((zoomLevel - ZOOM_INCREMENT).toFixed(2));
        zoomLevel = Math.max(zoomLevel, MIN_ZOOM); // Ensure it doesn't go below MIN_ZOOM
        applyZoom();
    }
    updateZoomButtons();
}

function applyZoom() {
    if (simulationContainer) {
        // Ensure style object exists
        if (simulationContainer.style) {
            simulationContainer.style.transformOrigin = "top left";
            simulationContainer.style.transform = `scale(${zoomLevel})`;
        } else {
            // console.warn("Camera Control (applyZoom): simulationContainer.style is undefined.");
        }
    } else {
        // console.warn("Camera Control (applyZoom): simulationContainer is null.");
    }
}

function updateZoomButtons() {
    if (zoomInButton) {
        // Disable if zoomLevel is at or above MAX_ZOOM (allowing for floating point inaccuracies)
        zoomInButton.disabled = zoomLevel >= MAX_ZOOM - (ZOOM_INCREMENT / 2);
    }
    if (zoomOutButton) {
        // Disable if zoomLevel is at or below MIN_ZOOM
        zoomOutButton.disabled = zoomLevel <= MIN_ZOOM + (ZOOM_INCREMENT / 2);
    }
}