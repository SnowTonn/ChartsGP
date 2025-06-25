import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Papa from "papaparse";
import "maplibre-gl/dist/maplibre-gl.css";

export default function SchoolsMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [schools, setSchools] = useState([]);
  //const [filterType, setFilterType] = useState("All"); // Assuming no 'Type' in new CSV, can remove or repurpose
  const [filterCity, setFilterCity] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [pupilsMax, setPupilsMax] = useState(2000);
  const [grade5Max, setGrade5Max] = useState(100);
  const [rankMin, setRankMin] = useState(1);
  const [rankMax, setRankMax] = useState(100);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map only once
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "esri-satellite": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
          "esri-labels": {
            type: "raster",
            tiles: [
              "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "esri-satellite",
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: "labels",
            type: "raster",
            source: "esri-labels",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-1, 52.5],
      zoom: 6,
    });

    return () => {
      if (map.current && map.current.markers) {
        map.current.markers.forEach((m) => m.remove());
        map.current.markers = [];
      }
      map.current?.remove();
    };
  }, []);

  // Load CSV once and set schools state
  useEffect(() => {
    setLoading(true);
    setError(null);

    Papa.parse("/data/top100schools.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Transform data as needed
        const data = results.data.map((row) => ({
          rank: parseInt(row["Rank"], 10),
          name: row["SCH0ME"],
          address: row["ADDRESS"],
          city: row["TOWN"],
          pupilsKS4: parseInt(row["TOTPUPS"], 10), // Using total pupils as approximation
          grade5Plus: parseFloat(row["PTL2BASICS_94"]) || 0, // Assuming PTL2BASICS_94 is % with Grade 5+ equiv
          latitude: parseFloat(row["Latitude"]),
          longitude: parseFloat(row["Longitude"]),
          gender: row["EGENDER"],
          ageRange: row["AGERANGE"],
          progress8Score: row["P8MEA"], // Just passing string, can parseFloat if needed
          progress8Description: row["P8_BANDING"],
        }));

        setSchools(data);

        // Extract unique cities
        const cities = [...new Set(data.map((s) => s.city).filter(Boolean))];
        setUniqueCities(cities);

        // Set max rank dynamically
        const maxRankInData = data.length
          ? Math.max(...data.map((s) => s.rank || 0))
          : 100;
        setRankMax(maxRankInData);

        setLoading(false);
      },
      error: (err) => {
        setError("Failed to load CSV data: " + err.message);
        setLoading(false);
      },
    });
  }, []);

  // Filter schools based on filter state
  const filteredSchools = schools.filter((school) => {
    if (filterCity !== "All" && school.city !== filterCity) return false;
    if (
      searchName.trim() !== "" &&
      !school.name.toLowerCase().includes(searchName.trim().toLowerCase())
    )
      return false;
    if (school.pupilsKS4 > pupilsMax) return false;
    if (school.grade5Plus > grade5Max) return false;
    if (school.rank < rankMin || school.rank > rankMax) return false;

    return true;
  });

  // Manage markers on map when filtered schools data changes
  useEffect(() => {
    if (!map.current) return;

    if (map.current.markers) {
      map.current.markers.forEach((m) => m.remove());
    }
    map.current.markers = [];

    filteredSchools.forEach((school) => {
      if (!school.latitude || !school.longitude) return;

      const lat = school.latitude;
      const lng = school.longitude;

      if (isNaN(lat) || isNaN(lng)) return;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${school.name}</strong><br/>
         <b>Rank:</b> ${school.rank}<br/>
         <b>Gender:</b> ${school.gender}<br/>
         <b>Age Range:</b> ${school.ageRange}<br/>
         <b>City:</b> ${school.city}<br/>
         <b>Address:</b> ${school.address}<br/>
         <b>Pupils:</b> ${school.pupilsKS4}<br/>
         <b>Grade 5+ English & Maths (%):</b> ${school.grade5Plus}<br/>
         <b>Progress 8 Score:</b> ${school.progress8Score} (${school.progress8Description})`
      );

      const marker = new maplibregl.Marker({ color: "#d33" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      map.current.markers.push(marker);
    });
  }, [filteredSchools]);

  function sanitizeRankInput(value, fallback, min, max) {
    let val = value.toString().replace(/[^\d]/g, "");
    if (val === "") return fallback;
    let intVal = parseInt(val, 10);
    if (isNaN(intVal)) intVal = fallback;
    if (intVal < min) intVal = min;
    if (intVal > max) intVal = max;
    return intVal;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "auto" }}>
      <h2>UK Schools Map</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {/* You can remove Type filter if not needed */}
        {/* <div>
          <label>Type:</label>
          <br />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Academy">Academy</option>
            <option value="Independent">Independent</option>
          </select>
        </div> */}

        <div>
          <label>City:</label>
          <br />
          <select
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
          <label>School Name:</label>
          <br />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <div>
          <label>Grade 5+ English & Maths Max (%):</label>
          <br />
          <input
            type="number"
            min={0}
            max={100}
            value={grade5Max}
            onChange={(e) => {
              const val = e.target.value;
              setGrade5Max(val === "" ? 0 : Math.min(100, Math.max(0, parseFloat(val))));
            }}
          />
        </div>

        <div>
          <label>Pupils Max:</label>
          <br />
          <input
            type="number"
            min={0}
            max={2000}
            value={pupilsMax}
            onChange={(e) => {
              const val = e.target.value;
              setPupilsMax(val === "" ? 0 : Math.min(2000, Math.max(0, parseInt(val))));
            }}
          />
        </div>

        <div>
          <label>Rank Range:</label>
          <br />
          <input
            type="number"
            min={1}
            max={rankMax}
            value={rankMin}
            onChange={(e) => {
              const val = sanitizeRankInput(e.target.value, 1, 1, rankMax);
              setRankMin(val);
            }}
            style={{ width: "60px", marginRight: "10px" }}
          />
          to
          <input
            type="number"
            min={rankMin}
            max={rankMax}
            value={rankMax}
            onChange={(e) => {
              const val = sanitizeRankInput(e.target.value, rankMax, rankMin, 1000);
              setRankMax(val);
            }}
            style={{ width: "60px", marginLeft: "10px" }}
          />
        </div>
      </div>

      {loading && <p>Loading schools data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        <strong>{filteredSchools.length}</strong> schools displayed
      </p>
      <p>
        <strong>
          {filteredSchools.reduce((total, school) => total + (school.pupilsKS4 || 0), 0)}
        </strong>{" "}
        Pupils in the schools displayed
      </p>
      <div
        ref={mapContainer}
        style={{ height: "600px", width: "100%", border: "1px solid #aaa" }}
      />
    </div>
  );
}
