import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Papa from "papaparse";
import "maplibre-gl/dist/maplibre-gl.css";

// Define the base styles for different map styles
const baseLayers = {
  Satellite: {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      labels: {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
    },
    layers: [
      { id: "satellite", type: "raster", source: "satellite" },
      { id: "labels", type: "raster", source: "labels" },
    ],
  },

  Terrain: {
    version: 8,
    sources: {
      terrain: {
        type: "raster",
        tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          "Map data: © OpenStreetMap contributors, SRTM | Tiles: © OpenTopoMap",
      },
    },
    layers: [{ id: "terrain", type: "raster", source: "terrain" }],
  },

  Streets: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  },
};

export default function SchoolsMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [schools, setSchools] = useState([]);
  const [filterCity, setFilterCity] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [pupilsMax, setPupilsMax] = useState(4000);
  const [pupilsMin, setPupilsMin] = useState(0);
  const [grade5Max, setGrade5Max] = useState(100);
  const [rankMin, setRankMin] = useState(1);
  const [rankMax, setRankMax] = useState(200);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  // NEW: Track current map style
  const [mapStyle, setMapStyle] = useState("Satellite");

  const COLORS = {
    total: "#2a9d8f",
    resource: "#e9c46a",
    capital: "#f4a261",
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };

  // Initialize the map with the selected style
  useEffect(() => {
    if (map.current) return;

    // Initialize with a default style (e.g. Satellite)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: baseLayers["Satellite"],
      center: [-1, 52.5],
      zoom: 6,
    });

    // Optional fullscreen handler
    map.current.on("click", (e) => {
      const clickedElement = e.originalEvent.target;

      // Only toggle fullscreen if background map is clicked
      const isMapCanvas = clickedElement.classList.contains("maplibregl-canvas");

      if (isMapCanvas) {
        const container = map.current.getContainer();
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch((err) =>
            console.error(`Error enabling fullscreen: ${err.message}`)
          );
        } else {
          document.exitFullscreen();
        }
      }
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right"); 
    return () => {
      if (map.current?.markers) {
        map.current.markers.forEach((m) => m.remove());
        map.current.markers = [];
      }
      map.current?.remove();
    };
  }, []); // ✅ no dependency on mapStyle


  // UPDATE map style when mapStyle state changes (live update)
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(baseLayers[mapStyle]);
  }, [mapStyle]);

  useEffect(() => {
    setLoading(true);
    Papa.parse("/data/top700schools.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          rank: parseInt(row["Rank"], 10),
          name: row["SCHNAME"],
          address: row["ADDRESS"],
          city: row["TOWN"],
          pupilsKS4: parseInt(row["TOTPUPS"], 10),
          grade5Plus: parseFloat(row["PTL2BASICS_94"]) || 0,
          latitude: parseFloat(row["Latitude"]),
          longitude: parseFloat(row["Longitude"]),
          gender: row["EGENDER"],
          ageRange: row["AGERANGE"],
          progress8Score: row["P8PUP"],
          progress8Description: row["P8_BANDING"],
          NFTYPE: row["NFTYPE"],
        }));

        setSchools(data);
        setUniqueCities([...new Set(data.map((s) => s.city).filter(Boolean))]);
        setUniqueTypes([...new Set(data.map((s) => s.NFTYPE).filter(Boolean))]);
        setRankMax(Math.max(...data.map((s) => s.rank || 0)));
        setLoading(false);
      },
      error: (err) => {
        setError("Failed to load CSV data: " + err.message);
        setLoading(false);
      },
    });
  }, []);

  const filteredSchools = schools.filter((school) => {
    if (filterCity !== "All" && school.city !== filterCity) return false;
    if (filterType !== "All" && school.NFTYPE !== filterType) return false;
    if (
      searchName.trim() !== "" &&
      !school.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false;
    if (school.pupilsKS4 > pupilsMax || school.pupilsKS4 < pupilsMin) return false;
    if (school.grade5Plus > grade5Max) return false;
    if (school.rank < rankMin || school.rank > rankMax) return false;
    return true;
  });


  const schoolsWithCoords = filteredSchools.filter(
    (s) => !isNaN(s.latitude) && !isNaN(s.longitude)
  );
  const schoolsMissingCoords = filteredSchools.length - schoolsWithCoords.length;

  const getMarkerColor = (rank) => {
    if (rank <= 100) return "#1a9850";
    if (rank <= 300) return "#fee08b";
    return "#d73027";
  };

  useEffect(() => {
    if (!map.current) return;

    if (map.current.markers) {
      map.current.markers.forEach((m) => m.remove());
    }
    map.current.markers = [];

    schoolsWithCoords.forEach((school) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${school.name}</strong><br/>
         <b>Rank:</b> ${school.rank}<br/>
         <b>Gender:</b> ${school.gender}<br/>
         <b>Age Range:</b> ${school.ageRange}<br/>
         <b>City:</b> ${school.city}<br/>
         <b>Type:</b> ${school.NFTYPE}<br/>
         <b>Address:</b> ${school.address}<br/>
         <b>Pupils:</b> ${school.pupilsKS4}<br/>
         <b>Grade 5+ %:</b> ${school.grade5Plus}<br/>
         <b>Progress 8:</b> ${school.progress8Score} (${school.progress8Description})`
      );

      const marker = new maplibregl.Marker({ color: getMarkerColor(school.rank) })
        .setLngLat([school.longitude, school.latitude])
        .setPopup(popup)
        .addTo(map.current);

      map.current.markers.push(marker);
    });
  }, [schoolsWithCoords]);

  // function sanitizeRankInput(value, fallback, min, max) {
  //   let val = value.toString().replace(/[^\d]/g, "");
  //   if (val === "") return fallback;
  //   let intVal = parseInt(val, 10);
  //   if (isNaN(intVal)) intVal = fallback;
  //   if (intVal < min) intVal = min;
  //   if (intVal > max) intVal = max;
  //   return intVal;
  // }

  return (
    <div style={{ background: "#f9f9fc", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", color: "#264653", marginBottom: "1rem" }}>
          The UK Schools Map
        </h2>

        <div style={{ textAlign: "center", marginBottom: "2rem", padding: "0 10px" }}>
          <p style={{ fontSize: 14, color: COLORS.total, marginBottom: 12 }}>
            Data sourced from&nbsp;
            <a
              href="https://www.gov.uk/government/organisations/department-for-education"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.resource }}
            >
              the UK Department for Education
            </a>.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label>City:</label>
            <select
              style={inputStyle}
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            >
              <option value="All">All</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Type:</label>
            <select
              style={inputStyle}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Search Name:</label>
            <input
              type="text"
              placeholder="Search by school name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Pupils (min - max):</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                min={0}
                max={4000}
                step={50}
                value={pupilsMin}
                onChange={(e) => setPupilsMin(Number(e.target.value))}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="number"
                min={0}
                max={4000}
                step={50}
                value={pupilsMax}
                onChange={(e) => setPupilsMax(Number(e.target.value))}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>


          <div>
            <label>Grade 5+ % max:</label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={grade5Max}
              onChange={(e) => setGrade5Max(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ fontSize: 12 }}>{grade5Max}</div>
          </div>

          <div>
            <label>Rank (min - max):</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                min={1}
                max={rankMax}
                value={rankMin}
                onChange={(e) => setRankMin(Number(e.target.value))}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="number"
                min={rankMin}
                max={200}
                value={rankMax}
                onChange={(e) => setRankMax(Number(e.target.value))}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>

          {/* MAP STYLE SWITCHER DROPDOWN */}
          <div>
            <label>Map Style:</label>
            <select
              style={inputStyle}
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
            >
              <option value="Satellite">Satellite</option>
              <option value="Terrain">Terrain</option>
              <option value="Streets">Streets</option>
            </select>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: "600px",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "1rem",
            boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            ref={mapContainer}
            style={{ width: "100%", height: "100%" }}
            aria-label="Map of UK schools"
          />
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(255,255,255,0.8)",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#555",
              }}
            >
              Loading data...
            </div>
          )}
          {error && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(255,200,200,0.9)",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#900",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {showList && (
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowList(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "14px",
                color: COLORS.resource,
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Hide list of schools
            </button>
            <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
              {filteredSchools.map((school) => (
                <li
                  key={school.rank}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "0.5rem 0",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (!map.current) return;
                    map.current.flyTo({
                      center: [school.longitude, school.latitude],
                      zoom: 14,
                    });
                  }}
                >
                  <strong>{school.rank}. {school.name}</strong> ({school.city})
                </li>
              ))}
            </ul>
          </div>
        )}
        {!showList && (
          <button
            onClick={() => setShowList(true)}
            style={{
              background: "none",
              border: "none",
              fontSize: "14px",
              color: COLORS.resource,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Show list of schools
          </button>
        )}
        {/* {schoolsMissingCoords > 0 && (
          <div style={{ marginBottom: "1rem", fontSize: "14px", color: "#333" }}>
            <p><strong>{filteredSchools.length}</strong> schools match filters</p>
            {schoolsMissingCoords > 0 && (
              <p><strong>{schoolsMissingCoords}</strong> missing coordinates</p>
            )}
            <p><strong>{schoolsWithCoords.length}</strong> schools shown on the map</p>
            <p>
              <strong>
                {filteredSchools.reduce((total, s) => total + (s.pupilsKS4 || 0), 0)}
              </strong>{" "}
              pupils in displayed schools
            </p>
          </div>
        )} */}
      <div style={{ marginBottom: "1rem", fontSize: "14px", color: "#333" }}>
            <p><strong>{filteredSchools.length}</strong> schools match filters</p>
            {schoolsMissingCoords > 0 && (
              <p><strong>{schoolsMissingCoords}</strong> missing coordinates</p>
            )}
            <p><strong>{schoolsWithCoords.length}</strong> schools shown on the map</p>
            <p>
              <strong>
                {filteredSchools.reduce((total, s) => total + (s.pupilsKS4 || 0), 0)}
              </strong>{" "}
              pupils in displayed schools
            </p>
          </div>


      {showDescription && (
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowDescription(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "14px",
                color: COLORS.total,
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Hide description
            </button>
            <div style={{ margin: "0 auto" }}>
              <p style={{ textAlign: "center", fontSize: 14, color: COLORS.total, lineHeight: "1.6" }}>
                Most parents think carefully about their children's education — how to give them the best possible opportunities.
                This service helps simplify that task a little by clearly showing the situation with local schools,
                whether around your current location or in an area you're considering moving to.
                <br /><br />
                I originally created this page for myself and my wife, to better understand the quality of education
                our children are currently receiving — and what other options might be available.
                <br /><br />
                Rank according with "Attainment 8"
This score is based on how well pupils in a school have performed in up to 8 qualifications, which include English, maths, 3 English Baccalaureateopens in a new window qualifications including sciences, computer science, history, geography and languages, and 3 other additional approved qualificationsopens in a new window.
              </p>
            </div>
          </div>
        )}
        {!showDescription && (
          <button
            onClick={() => setShowDescription(true)}
            style={{
              background: "none",
              border: "none",
              fontSize: "14px",
              color: COLORS.total,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Show description
          </button>
        )}
      
        


      </div>
       
       
       
       
       
    </div>
  );
}
