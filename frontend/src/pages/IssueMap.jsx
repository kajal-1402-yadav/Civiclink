// // src/pages/AllIssues.jsx
// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import api from "../api";
// import "../styles/IssueMap.css";

// // Default Leaflet marker fix (needed when using React)
// import markerIconPng from "leaflet/dist/images/marker-icon.png";

// function AllIssues() {
//   const [issues, setIssues] = useState([]);

//   useEffect(() => {
//     fetchAllIssues();
//   }, []);

//   const fetchAllIssues = async () => {
//     try {
//       const res = await api.get("/api/all-issues/");
//       setIssues(res.data);
//     } catch (error) {
//       console.error("Failed to fetch issues:", error);
//     }
//   };

//   return (
//     <div className="all-issues-container">
//       <h2>All Reported Issues (Map View)</h2>

//       <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={true}>
//         <TileLayer
//           attribution='&copy; OpenStreetMap contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {issues.map((issue) => (
//           <Marker
//             key={issue.id}
//             position={[issue.location_lat, issue.location_lng]}
//             icon={L.icon({
//               iconUrl: markerIconPng,
//               iconSize: [25, 41],
//               iconAnchor: [12, 41],
//             })}
//           >
//             <Popup>
//               <strong>{issue.title}</strong><br />
//               Category: {issue.category} <br />
//               Status: {issue.status}
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }

// export default AllIssues;
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api"; // Your axios instance or direct fetch

// Fix Leaflet marker icon issue for Vite / React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function IssueMapPage() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get("/api/issues-map/");
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchIssues();
  }, []);

  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {issues.map((issue) => (
          <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
            <Popup>
              <strong>{issue.title}</strong><br />
              Category: {issue.category}<br />
              Status: {issue.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default IssueMapPage;

