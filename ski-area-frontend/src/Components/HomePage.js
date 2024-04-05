import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import myImage from "./main.png";

const HomePage = () => {
  const navigate = useNavigate(); // Use useNavigate here

  const findRoutes = async () => {
    try {
      const response = await fetch("http://localhost:3028/all-routes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      navigate("/all-routes", {
        state: { routes: data.routes, nodes: data.nodes, levels: data.levels },
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div>
      <img src={myImage} style={{ height: "350px" }} />
      <div>
        <button onClick={findRoutes}>Calculate Route</button>
        <button style={{ marginLeft: "5px" }}>Search Restaurants</button>
        <button style={{ marginLeft: "5px" }}>Find Restrooms</button>
      </div>
    </div>
  );
};

export default HomePage;
