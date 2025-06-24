import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Papa from "papaparse";
import "maplibre-gl/dist/maplibre-gl.css";

export default function SchoolsMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [schools, setSchools] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [filterCity, setFilterCity] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [pupilsRange, setPupilsRange] = useState([0, 2000]);
  const [grade5Range, setGrade5Range] = useState([30, 100]);
  const [rankRange, setRankRange] = useState([1, 100]); // <-- Rank filter

  const parseCoordinate = (coord) => {
    if (!coord) return null;
    let value = parseFloat(coord);
    if (coord.includes("S") || coord.includes("W")) value *= -1;
    return value;
  };

  useEffect(() => {
    Papa.parse("/data/DataSchools10.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const cleaned = results.data
          .map((row) => {
            const lat = parseCoordinate(row["Latitude"]);
            const lng = parseCoordinate(row["Longitude"]);
            const progress = parseFloat(row["Progress 8 Score"]);
            const pupils = parseInt(row["Pupils KS4"]);
            const rank = parseInt(row["Rank"]); // <-- Parse Rank

            if (!lat || !lng) return null;
            return {
              rank,
              name: row["School Name"],
              type: row["Type"],
              city: row["City"],
              address: row["Address"],
              pupilsKS4: pupils,
              pupilsMeasured: row["Pupils Measured"],
              progress8Score: progress,
              progress8Description: row["Progress 8 Description"],
              enteringEBacc: row["Entering EBacc"],
              stayingInEducation: row["Staying in Education/Employment"],
              grade5Plus: row["Grade 5+ English & Maths (%)"],
              attainment8: row["Attainment 8"],
              ebaccScore: row["EBacc Avg Point Score"],
              lat,
              lng,
            };
          })
          .filter(Boolean);
        setSchools(cleaned);

        // Set default rankRange max based on data
        const maxRank = Math.max(...cleaned.map(s => s.rank));
        setRankRange([1, maxRank]);
      },
    });
  }, []);

  const uniqueCities = [...new Set(schools.map((s) => s.city).filter(Boolean))];
  const maxRank = Math.max(...schools.map(s => s.rank), 100);

  const filteredSchools = schools.filter((s) => {
    return (
      (filterType === "All" || s.type === filterType) &&
      (filterCity === "All" || s.city === filterCity) &&
      s.name.toLowerCase().includes(searchName.toLowerCase()) &&
      parseFloat(s.grade5Plus) >= grade5Range[0] &&
      parseFloat(s.grade5Plus) <= grade5Range[1] &&
      s.pupilsKS4 >= pupilsRange[0] &&
      s.pupilsKS4 <= pupilsRange[1] &&
      s.rank >= rankRange[0] &&
      s.rank <= rankRange[1]
    );
  });

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
  }, []);

  useEffect(() => {
    if (!map.current || !filteredSchools.length) return;

    if (map.current.markers) {
      map.current.markers.forEach((m) => m.remove());
    }
    map.current.markers = [];

    filteredSchools.forEach((school) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${school.name}</strong><br/>
         <b>Rank:</b> ${school.rank}<br/>
         <b>Type:</b> ${school.type}<br/>
         <b>City:</b> ${school.city}<br/>
         <b>Address:</b> ${school.address}<br/>
         <b>Pupils KS4:</b> ${school.pupilsKS4}<br/>
         <b>Pupils Measured:</b> ${school.pupilsMeasured}<br/>
         <b>Progress 8 Score:</b> ${school.progress8Score} (${school.progress8Description})<br/>
         <b>Entering EBacc:</b> ${school.enteringEBacc}<br/>
         <b>Staying in Education:</b> ${school.stayingInEducation}<br/>
         <b>Grade 5+ English & Maths:</b> ${school.grade5Plus}<br/>
         <b>Attainment 8:</b> ${school.attainment8}<br/>
         <b>EBacc Avg Point Score:</b> ${school.ebaccScore}`
      );

      const marker = new maplibregl.Marker({ color: "#d33" })
        .setLngLat([school.lng, school.lat])
        .setPopup(popup)
        .addTo(map.current);

      map.current.markers.push(marker);
    });
  }, [filteredSchools]);

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
        <div>
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
        </div>
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
          <label>Grade 5+ English & Maths (%):</label>
          <br />
          <input
            type="range"
            min="30"
            max="100"
            step="10"
            value={grade5Range[1]}
            onChange={(e) => setGrade5Range([30, parseInt(e.target.value)])}
          />
          <div>
            {grade5Range[0]}% to {grade5Range[1]}%
          </div>
        </div>
        <div>
          <label>Pupils KS4 Max:</label>
          <br />
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={pupilsRange[1]}
            onChange={(e) => setPupilsRange([0, parseInt(e.target.value)])}
          />
          <div>
            {pupilsRange[0]} to {pupilsRange[1]}
          </div>
        </div>

        {/* Rank filter inputs */}
        <div>
          <label>Rank Range:</label>
          <br />
          <input
            type="number"
            min={1}
            max={maxRank}
            value={rankRange[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              if (val <= rankRange[1]) setRankRange([val, rankRange[1]]);
            }}
            style={{ width: "60px", marginRight: "10px" }}
          />
          to
          <input
            type="number"
            min={1}
            max={maxRank}
            value={rankRange[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              if (val >= rankRange[0]) setRankRange([rankRange[0], val]);
            }}
            style={{ width: "60px", marginLeft: "10px" }}
          />
        </div>
      </div>
      <p><strong>{filteredSchools.length}</strong> schools displayed</p>
      <p>
        <strong>
          {filteredSchools.reduce((total, school) => total + (school.pupilsKS4 || 0), 0)}
        </strong>{" "}
        Pupils in the schools displayed
      </p>
      <div
        ref={mapContainer}
        style={{ height: "600px", width: "100%", borderRadius: "8px" }}
      />
    </div>
  );
}
