import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Papa from "papaparse";
import "maplibre-gl/dist/maplibre-gl.css";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Helmet } from "react-helmet";

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
  const [rankMax, setRankMax] = useState(367);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  
  const [filterAgeRange, setFilterAgeRange] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueAgeRanges, setUniqueAgeRanges] = useState([]);
  const [uniqueGenders, setUniqueGenders] = useState([]);

  const [sortColumn, setSortColumn] = useState("rank"); // default sorting by rank!!!
  const [sortDirection, setSortDirection] = useState("desc"); // ascending or descending!!!
  const [selectedFile, setSelectedFile] = useState("/data/top700schools.csv"); //Select file
 
  useEffect(() => { // Automatically set default sortColumn based on selected file
    if (selectedFile === "/data/top700schools.csv") {
      setSortColumn("attainment8");
    } else {
      setSortColumn("grade5Plus");
    }
  }, [selectedFile]);


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
      map.current = null;
    };
  }, []); 
  // UPDATE map style (live update)
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(baseLayers[mapStyle]);
  }, [mapStyle]);

  useEffect(() => {
    setLoading(true);
    //Papa.parse("/data/top700schools.csv", {
    Papa.parse(selectedFile, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          rank: Number.isNaN(parseInt(row["Rank"], 10)) ? null : parseInt(row["Rank"], 10),
          name: row["SCHNAME"] || null,
          address: row["ADDRESS"] || null,
          city: row["TOWN"] || null,
          pupilsKS4: Number.isNaN(parseInt(row["TOTPUPS"], 10)) ? null : parseInt(row["TOTPUPS"], 10),
          numboys: Number.isNaN(parseInt(row["NUMBOYS"], 10))  ? null : parseInt(row["NUMBOYS"], 10),
          numgirls: Number.isNaN(parseInt(row["NUMGIRLS"], 10))  ? null : parseInt(row["NUMGIRLS"], 10),
          grade5Plus: Number.isNaN(parseFloat(row["PTL2BASICS_94"])) ? 0 : parseFloat(row["PTL2BASICS_94"]),
          attainment8: Number.isNaN(parseFloat(row["ATT8SCR"])) ? 0 : parseFloat(row["ATT8SCR"]),
          latitude: Number.isNaN(parseFloat(row["Latitude"])) ? null : parseFloat(row["Latitude"]),
          longitude: Number.isNaN(parseFloat(row["Longitude"])) ? null : parseFloat(row["Longitude"]),
          gender: row["EGENDER"] || null,
          ageRange: row["AGERANGE"] || null,
          progress8Score: row["P8PUP"] || null,
          progress8Description: row["P8_BANDING"] || null,
          NFTYPE: row["NFTYPE"] || null,
          country: row["Country"] || (row["ADDRESS"]?.split(",").pop()?.trim() || null),
        }));
        
        setSchools(data);
        console.log([...new Set(data.map((s) => s.country))]); // show log
        setUniqueCities([...new Set(data.map((s) => s.city).filter(Boolean))].sort());
        setUniqueTypes([...new Set(data.map((s) => s.NFTYPE).filter(Boolean))]);
        setUniqueCountries([...new Set(data.map((s) => s.country).filter(Boolean))]);
        setUniqueAgeRanges([...new Set(data.map((s) => s.ageRange).filter(Boolean))].sort());
        setUniqueGenders([...new Set(data.map((s) => s.gender).filter(Boolean))]);
        setRankMax(Math.max(...data.map((s) => s.rank || 0)));
        setLoading(false);
      },
      error: (err) => {
        setError("Failed to load CSV data: " + err.message);
        setLoading(false);
      },
    });
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const value = e.target.value;
    setSelectedFile(value);
  };




  const sortedAllSchools = [...schools].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const rankedAllSchools = sortedAllSchools.map((school, index) => ({
    ...school,
    rank: index + 1,
  }));

  const filteredSchools = rankedAllSchools.filter((school) => {
    if (filterCity !== "All" && school.city !== filterCity) return false;
    if (filterType !== "All" && school.NFTYPE !== filterType) return false;
    if (filterCountry !== "All" && school.country !== filterCountry) return false;

    if (filterAgeRange !== "All" && school.ageRange !== filterAgeRange) return false;
    if (filterGender !== "All" && school.gender !== filterGender) return false;
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

  

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // const filteredSchoolsA = schools.filter((school) => {
  //   if (filterCity !== "All" && school.city !== filterCity) return false;
  //   if (filterType !== "All" && school.NFTYPE !== filterType) return false;
  //   if (filterCountry !== "All" && school.country !== filterCountry) return false;

  //   if (filterAgeRange !== "All" && school.ageRange !== filterAgeRange) return false;
  //   if (filterGender !== "All" && school.gender !== filterGender) return false;
  //   if (
  //     searchName.trim() !== "" &&
  //     !school.name.toLowerCase().includes(searchName.toLowerCase())
  //   )
  //     return false;
  //   if (school.pupilsKS4 > pupilsMax || school.pupilsKS4 < pupilsMin) return false;
  //   if (school.grade5Plus > grade5Max) return false;
  //   if (school.rank < rankMin || school.rank > rankMax) return false;
  //   return true;
  // });
  


  // const sortedSchools = [...filteredSchoolsA].sort((a, b) => {
  //   const aValue = a[sortColumn];
  //   const bValue = b[sortColumn];

  //   if (aValue === null || aValue === undefined) return 1;
  //   if (bValue === null || bValue === undefined) return -1;

  //   if (typeof aValue === 'string') {
  //     return sortDirection === 'asc'
  //       ? aValue.localeCompare(bValue)
  //       : bValue.localeCompare(aValue);
  //   } else {
  //     return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  //   }
  // });

  // const rankedSchools = sortedSchools.map((school, index) => ({
  //   ...school,
  //   rank1: index + 1,
  // }));
//!!!!!!!!!!!!!!!!!!!!!!!!!

  const schoolsWithCoords = filteredSchools.filter(
    (s) => !isNaN(s.latitude) && !isNaN(s.longitude)
  );
  
  //const numberOfSortedSchools = sortedSchools.length;


  const schoolsMissingCoords = filteredSchools.length - schoolsWithCoords.length;

  const getMarkerColor = (rank) => {
    if (rank <= 100) return "#2a9d8f";
    if (rank <= 200) return "#e9c46a";
    return "#f4a261";
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
         <b>Rank according metric:</b> ${school.rank}<br/>
         <b>Gender:</b> ${school.gender}<br/>
         <b>Age Range:</b> ${school.ageRange}<br/>
         <b>City/Town:</b> ${school.city}<br/>
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

  return (
    
    <div style={{ background: "#f9f9fc", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        <Tippy content={<span style={{ color: COLORS.capital }}> Currently showing the top 300 (by "Attainment 8") schools from England or 367 schools from England and Northern Ireland (by "Attainment 8" and "Grade 5+ %" (GCSE result). In the next release, I plan to include schools from Walse as well. </span>}
          placement="right"
          arrow={true}
      >
            <h2 style={{ textAlign: "center", color: "#264653", marginBottom: "1rem" }}>
              Best UK schools 2025
            </h2>
            
        </Tippy>
            <h1 style={{ textAlign: "center", color: "#264653", marginBottom: "1rem", fontSize: "1rem" }}>
               Top Schools in England (and Nothern Ireland) by GCSE Performance 
            </h1>
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

        {/* UI */}

        <div>
          <h3>Choose School Dataset</h3>
          <select value={selectedFile} onChange={handleFileChange}>
            <option value="/data/top700schools.csv">England Only</option>
            <option value="/data/top369schoolsNIandEng.csv">England + Northern Ireland (MVP)</option>
          </select>

          {loading && <p>Loading schools...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <p><strong>Total schools loaded:</strong> {schools.length}</p>
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
            <label>Sort By:</label>
            <select
              style={inputStyle}
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
            >
              {selectedFile === "/data/top700schools.csv" ? (
                <>
                  <option value="attainment8">Attainment 8</option>
                </>
              ) : (
                <>
                  <option value="grade5Plus">Grade 5+ %</option>
                  
                </>
              )}


              {/* Optional shared sort options */}
              {/* <option value="name">Name</option>
              <option value="city">City/Town</option> */}
            </select>

            <select
              style={{ ...inputStyle, width: "auto", marginLeft: "8px" }}
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            >
              <option value="desc">Best to ...</option>
              <option value="asc">... to best</option>
              
            </select>
          </div>


          
          
          
          <div>
            <label>City/Town:</label>
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
            <label>Grade 5+ %:</label>
            <input
              type="range"
              min={70}
              max={100}
              step={0.1}
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
                max={367}
                value={rankMax}
                onChange={(e) => setRankMax(Number(e.target.value))}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>  
          </div>
          <div>
              <label>Country:</label>
              <select
                style={inputStyle}
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="All">All</option>
                {uniqueCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Age Range in:</label>
              <select
                style={inputStyle}
                value={filterAgeRange}
                onChange={(e) => setFilterAgeRange(e.target.value)}
              >
                <option value="All">All</option>
                {uniqueAgeRanges.map((ar) => (
                  <option key={ar} value={ar}>{ar}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Gender:</label>
              <select
                style={inputStyle}
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="All">All</option>
                {uniqueGenders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

          {/* MAP STYLE SWITCHER DROPDOWN */}
          
        </div>
        
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
                fontSize: "19px",
                color: COLORS.resource,
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Hide list of schools
            </button>
            <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
              {filteredSchools
              .sort((a, b) => {
                let valA = a[sortColumn];
                let valB = b[sortColumn];

                // Handle null or undefined
                if (valA == null) return 1;
                if (valB == null) return -1;

                // If the column is string, use localeCompare
                if (typeof valA === "string" && typeof valB === "string") {
                  return sortDirection === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
                }

                // Otherwise, assume number
                return sortDirection === "asc" ? valA - valB : valB - valA;
              })

              .map((school) => (
                <li
                  key={school.rank}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "0.5rem 0",
                    fontSize: "19px",
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
                  <strong>{school.rank}. {school.name}</strong><br />
                  <span>{school.city}</span>
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
              fontSize: "19px",
              color: COLORS.resource,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Show list of schools
          </button>
        )}   
      <div style={{ marginBottom: "1rem", fontSize: "19px", color: "#333" }}>
            <p><strong>{filteredSchools.length}</strong> schools match filters</p>
            {schoolsMissingCoords > 0 && (
              <p><strong>{schoolsMissingCoords}</strong> missing coordinates</p>
            )}
            <p><strong>{schoolsWithCoords.length}</strong> schools shown on the map</p>
            <p>
              <>
                <strong>
                  <Tippy content={<span style={{ color: COLORS.capital }}>Extends beyond secondary education</span>}>
                    <span style={{ color: COLORS.total }}>
                      {filteredSchools.reduce((total, s) => total + (s.pupilsKS4 || 0), 0)}
                    </span>
                  </Tippy>
                </strong>{" "} pupils in displayed schools&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                <strong>
                  {filteredSchools.reduce((total, s) => total + (s.numgirls || 0), 0)}
                </strong>{" "} girls in displayed schools&nbsp;

                <Tippy content="Compared to the total number of pupils in 'girls' schools, this number may differ due to mixed sixth forms.">
                  <span style={{ textDecoration: "underline dotted", cursor: "help" }}>(?)</span>
                </Tippy>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                
                
                <strong> 
                  {filteredSchools.reduce((total, s) => total + (s.numboys || 0), 0)}                   
                </strong>{" "} 
                boys in displayed schools&nbsp;


                <Tippy content="Compared to the total number of pupils in 'boys' schools, this number may differ due to mixed sixth forms.">
                  <span style={{ textDecoration: "underline dotted", cursor: "help" }}>(?)</span>
                </Tippy>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 


                <Helmet>
                  <title>Top UK Schools 2025 | GCSE Rankings & Interactive Map</title>
                  <link rel="canonical" href="https://chartsgp-3.onrender.com/schools-map" />
                  <meta name="description" content="Explore the top UK (England and Northern Ireland) secondary schools based on GCSE results. Interactive map and detailed school rankings filtered by rank, type, and performance." />
                  <meta name="author" content="Denis K" />
                  <meta name="robots" content="index, follow" />
                  
                  <meta property="og:title" content="Top UK Schools 2025 | GCSE Rankings & Interactive Map" />
                  <meta property="og:description" content="Explore the top UK secondary schools based on GCSE results with our interactive map and rankings." />
                  <meta property="og:url" content="https://chartsgp-3.onrender.com/schools-map" />
                  <meta property="og:type" content="website" />
                  <meta property="og:image" content="https://chartsgp-3.onrender.com/og-image-schools-map.jpg" />
                  <meta property="og:image:width" content="1200" />
                  <meta property="og:image:height" content="630" />
                  
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="Top UK Schools 2025 | GCSE Rankings & Interactive Map" />
                  <meta name="twitter:description" content="Explore the top UK secondary schools based on GCSE results with our interactive map and rankings." />
                  <meta name="twitter:image" content="https://chartsgp-3.onrender.com/og-image-schools-map.jpg" />

                  <script type="application/ld+json">
                    {`
                      {
                        "@context": "https://schema.org",
                        "@type": "Dataset",
                        "name": "Top UK Schools GCSE Performance Data",
                        "description": "Interactive dataset showing GCSE results and school rankings across UK secondary schools.",
                        "url": "https://chartsgp-3.onrender.com/schools-map",
                        "datePublished": "2025-06-30",
                        "creator": {
                          "@type": "Person",
                          "name": "Denis K"
                        }
                      }
                    `}
                  </script>
                </Helmet>

                {/* The rest of your SchoolsMap JSX here */}





              </>
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
                fontSize: "19px",
                color: "#264653",
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Hide description
            </button>
            <div style={{ margin: "0 auto" }}>
              <p style={{ textAlign: "center", fontSize: 19, color: "#264653", lineHeight: "1.6" }}>
                Most parents think carefully about their children's education — how to give them the best possible opportunities.
                This service helps simplify that task a little by clearly showing the situation with local schools,
                whether around your current location or in an area you're considering moving to.
                <br /><br />
                I originally created this page for myself and my wife, to better understand the quality of education
                our children are currently receiving — and what other options might be available.
                <br /><br />
                Rank according with "Attainment 8"
                This score is based on how well pupils in a school have performed in up to 8 qualifications, which include English, maths, 3 English Baccalaureateopens in a new window qualifications including sciences, computer science, history, geography and languages, and 3 other additional approved qualificationsopens in a new window.
                <br /><br />
                Grade 5 or above in English & maths GCSEs - "Grade 5+ %:"
                This tells you the percentage of pupils who achieved grade 5 or above in English and maths GCSEsopens in a new window. Reformed GCSEs are graded 1 (low) to 9 (high). Grade 5 is a similar level of achievement to a high grade C or low grade B in the old grading.
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
              fontSize: "19px",
              color: "#264653",
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
