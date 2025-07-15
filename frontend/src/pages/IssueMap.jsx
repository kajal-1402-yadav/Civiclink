import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../api";
import styles from "../styles/IssueMap.module.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "../components/Navbar";

// Fix Leaflet icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function IssueMap() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api
      .get("/api/public-issues/")
      .then((res) => {
        const withCoords = res.data.filter(
          (issue) => issue.latitude && issue.longitude
        );
        setIssues(withCoords);
      })
      .catch((err) => {
        console.error("Failed to load issues", err);
      });
  }, []);

  return (
    <div className={styles.mapWrapper}>
                  <Navbar />

      <h2 className={styles.heading}>Live Issue Map</h2>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className={styles.map}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
          >
            <Popup>
              <strong>{issue.title}</strong>
              <br />
              {issue.description}
              <br />
              <b>Status:</b> {issue.status}
              <br />
              <b>Category:</b> {issue.category}
              <br />
              <b>Upvotes:</b> {issue.upvotes} | <b>Downvotes:</b> {issue.downvotes}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default IssueMap;
