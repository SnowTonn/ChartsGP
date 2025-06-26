import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkStyle = {
    padding: "12px 24px",
    margin: "0 12px",
    textDecoration: "none",
    color: "white",
    backgroundColor: "#264653",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "1.1rem",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    display: "inline-block",
  };

  const activeStyle = {
    backgroundColor: "#2a9d8f",
    boxShadow: "0 4px 12px rgba(42, 157, 143, 0.6)",
    transform: "scale(1.05)",
  };

  return (
    <nav
      style={{
        padding: "16px 24px",
        textAlign: "center",
        background: "#1d3557",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <NavLink
        to="/"
        style={({ isActive }) =>
          isActive ? { ...linkStyle, ...activeStyle } : linkStyle
        }
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a5a73")}
        onMouseLeave={e =>
          (e.currentTarget.style.backgroundColor = e.currentTarget.getAttribute("aria-current") === "page" ? "#2a9d8f" : "#264653")
        }
      >
        NI Budget Dashboard
      </NavLink>

      <NavLink
        to="/upload"
        style={({ isActive }) =>
          isActive ? { ...linkStyle, ...activeStyle } : linkStyle
        }
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a5a73")}
        onMouseLeave={e =>
          (e.currentTarget.style.backgroundColor = e.currentTarget.getAttribute("aria-current") === "page" ? "#2a9d8f" : "#264653")
        }
      >
        Upload & Create Chart
      </NavLink>

      <NavLink
      
        to="/schools-map"
        style={({ isActive }) =>
          isActive ? { ...linkStyle, ...activeStyle } : linkStyle
        }
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a5a73")}
        onMouseLeave={e =>
          (e.currentTarget.style.backgroundColor = e.currentTarget.getAttribute("aria-current") === "page" ? "#2a9d8f" : "#264653")
        }
      >
        The best schools in England
        <span style={{ display: "block", fontSize: "0.5em" }}>
          (last update 27/06/2025, next update 03/07/2025)
        </span>
      </NavLink>


    </nav>
  );
};

export default Navbar;
