import "./Map.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { locationIcon } from "./icons";
import { useState } from "react";

const Map = () => {
  const [locations, setLocation] = useState([
    [48.94831625381342, -56.73100121642103],
    [49.94831625381342, -56.83100121642103],
    [49.74831625381342, -56.83100121642103],
    [48.54831625381342, -57.83100121642103],
  ]);
  return (
    <div className="map-container">
      <MapContainer
        center={[48.94831625381342, -57.83100121642103]}
        zoom={15}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors -- <a href="https://www.flaticon.com/free-icons/route" title="route icons">Route icons created by Smashicons - Flaticon</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => {
          return <Marker icon={locationIcon} position={location} />;
        })}
        {/* <Marker
          icon={locationIcon}
          position={[48.94831625381342, -57.83100121642103]}
        ></Marker> */}
      </MapContainer>
    </div>
  );
};

export default Map;
