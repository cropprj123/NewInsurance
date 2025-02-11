import React, { useState, useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const LocationFinder = () => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [radius, setRadius] = useState(null);
  const [isMarked, setIsMarked] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

  // GeoJSON circle creation function
  const createGeoJSONCircle = (center, radiusInMeters) => {
    const points = 64;
    const coords = {
      latitude: center[1],
      longitude: center[0],
    };

    const km = radiusInMeters / 1000;
    const ret = [];
    const distanceX =
      km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ret],
      },
    };
  };

  const handleClick = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        if (map.current) {
          map.current.setCenter([longitude, latitude]);
          if (marker.current) {
            marker.current.setLngLat([longitude, latitude]);
          } else {
            marker.current = new maptilersdk.Marker({ color: "#DD5746" })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      }
    );
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseFloat(e.target.value);
    if (!isNaN(newRadius) && newRadius > 0) {
      setRadius(newRadius);
      setIsMarked(false);
    }
  };

  const handleMarkRadius = () => {
    if (radius && lat && lng && map.current) {
      setIsMarked(true);

      // Remove existing layers and sources
      if (map.current.getLayer("circle-fill"))
        map.current.removeLayer("circle-fill");
      if (map.current.getLayer("circle-outline"))
        map.current.removeLayer("circle-outline");
      if (map.current.getSource("circle-source"))
        map.current.removeSource("circle-source");

      // Create new circle data
      const circleData = createGeoJSONCircle([lng, lat], radius);

      // Add new source and layers
      map.current.addSource("circle-source", {
        type: "geojson",
        data: circleData,
      });

      // Add fill layer
      map.current.addLayer({
        id: "circle-fill",
        type: "fill",
        source: "circle-source",
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.2,
        },
      });

      // Add outline layer
      map.current.addLayer({
        id: "circle-outline",
        type: "line",
        source: "circle-source",
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      // Fit map to circle bounds
      const bounds = new maptilersdk.LngLatBounds();
      circleData.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  useEffect(() => {
    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [0, 0],
        zoom: 2,
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Get Current Location</h1>
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: isLoading ? "#cccccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isLoading ? "Loading..." : "Get My Location"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>Error: {error}</div>
      )}

      {lat && lng && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Coordinates:</h2>
          <p>Latitude: {lat}</p>
          <p>Longitude: {lng}</p>

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="radius">Radius (in meters): </label>
            <input
              type="number"
              id="radius"
              value={radius || ""}
              onChange={handleRadiusChange}
              style={{ padding: "5px", fontSize: "16px" }}
            />
            <button
              onClick={handleMarkRadius}
              disabled={!radius || isMarked}
              style={{
                padding: "5px 10px",
                fontSize: "16px",
                backgroundColor: !radius || isMarked ? "#cccccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              {isMarked ? "Marked" : "Mark"}
            </button>
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        style={{
          height: "500px",
          width: "80%",
          margin: "20px auto",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default LocationFinder;
