import "./Map.css";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { locationIcon } from "./icons";
import { useState } from "react";

const Map = () => {
  const routeColor = { color: "orange" };
  const [locations, setLocation] = useState([
    [48.9494835325974, -57.83091895065246],
    [48.94682720740517, -57.82500746120248],
    [48.94818944311722, -57.835897047031395],
    [48.945737392059314, -57.830400398946324],
    [48.94260404035938, -57.83050410928755],
    [48.93654112743416, -57.83019297826386],
  ]);
  const [polyline, setPolyline] = useState([
    [48.9494835325974, -57.83091895065246],
    [48.94682720740517, -57.82500746120248],
    [48.94818944311722, -57.835897047031395],
    [48.945737392059314, -57.830400398946324],
    [48.94260404035938, -57.83050410928755],
    [48.93654112743416, -57.83019297826386],
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
        <Polyline pathOptions={routeColor} positions={polyline} />
        {/* <Marker
          icon={locationIcon}
          position={[48.94831625381342, -57.83100121642103]}
        ></Marker> */}
      </MapContainer>
    </div>
  );
};

export default Map;
