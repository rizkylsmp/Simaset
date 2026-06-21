import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Canvas-based marker number renderer for performance
 * Renders numbers directly on map canvas instead of DOM elements
 * @param {Object} props
 * @param {Array} props.markers - Array of markers with position and number
 * @param {boolean} props.visible - Whether to show numbers
 */
export function MarkerNumberCanvas({ markers = [], visible = true }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!visible || !map) return;

    // Create canvas if not exists
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.className = "leaflet-marker-number-canvas";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "400";

      const container = map.getContainer();
      container.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match map
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw numbers
    markers.forEach(({ position, number }) => {
      if (!position || typeof number !== "number") return;

      const point = map.latLngToContainerPoint(position);

      // Draw circle background
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.fillStyle = "white";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(number), point.x, point.y);
    });
  }, [map, markers, visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  return null;
}
