import location from "../../Icons/location.png";
import L from "leaflet";
import "./icons.css";

var locationIcon = new L.Icon({
  shadowUrl: null,
  iconAnchor: new L.Point(10, 10),
  iconSize: new L.Point(30, 30),
  iconUrl: location,
  //iconSize: new L.Point(100, 57),
  // className: 'leaflet-div-icon'
});

export { locationIcon };
