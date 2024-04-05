import React, { useState, useEffect, useDebugValue } from "react";
import { useLocation } from "react-router-dom";
import allRoutes from "./routes.png";
import { Stage, Layer, Rect, Text, Circle, Line, Image } from "react-konva";
import axios from "axios";

const RoutesPage = () => {
  const location = useLocation();
  const [lifts, setLifts] = useState([]);
  const [slopes, setSlopes] = useState([]);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [level, setLevel] = useState("");
  const [nodes, setNodes] = useState([
    { x: 200, y: 300, name: "J" },
    { x: 280, y: 100, name: "B" },
    { x: 300, y: 170, name: "F" },
    { x: 400, y: 130, name: "G" },
    { x: 460, y: 250, name: "P" },
    { x: 550, y: 190, name: "P2" },
    { x: 580, y: 250, name: "P1" },
    { x: 650, y: 180, name: "D1" },
    { x: 730, y: 260, name: "B2" },
    { x: 590, y: 320, name: "R" },
    { x: 650, y: 350, name: "R1" },
    { x: 170, y: 340, name: "C" },
    { x: 970, y: 322, name: "V" },
    { x: 980, y: 390, name: "U3" },
    { x: 900, y: 250, name: "W" },
    { x: 930, y: 450, name: "U" },
    { x: 850, y: 422, name: "T" },
    { x: 950, y: 560, name: "W1" },
    { x: 70, y: 500, name: "D" },
    { x: 170, y: 120, name: "K" },
    { x: 780, y: 135, name: "A2" },
    { x: 700, y: 105, name: "A1" },
    { x: 70, y: 220, name: "A" },
    { x: 400, y: 400, name: "M" },
    { x: 455, y: 170, name: "Q" },
    { x: 345, y: 321, name: "O" },
    { x: 435, y: 300, name: "S" },
    { x: 928, y: 107, name: "X" },
    { x: 580, y: 580, name: "H" },
    { x: 800, y: 80, name: "P7" },
    { x: 689, y: 299, name: "Y" },
    { x: 735, y: 612, name: "N" },
    { x: 535, y: 612, name: "E2" },
  ]);
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");
  const [rawRoutes, setRawRoutes] = useState([]); // State to hold fetched routes
  const [rawRoutes2, setRawRoutes2] = useState([]); // State to hold fetched routes
  const [routes, setRoutes] = useState([]); // State to hold fetched routes
  const [routes2, setRoutes2] = useState([]); // State to hold fetched routes
  const [category, setCategory] = useState("All"); // State to hold fetched routes
  const [selectedPathIndex, setSelectedPathIndex] = useState(null); // Index of the selected path
  const [data, setData] = useState(null);

  useEffect(() => {
    const { routes, nodes, levels } = location.state || {};
    if (routes) {
      console.log(routes);
      processRoutes(routes);
    }
    // if (nodes) {
    //   console.log(nodes);
    //   setNodes(nodes);
    // }
    if (levels) {
      setLevels(levels);
    }
  }, [location]);

  useEffect(() => {
    console.log(rawRoutes);
    loadRoutes(rawRoutes);
  }, [rawRoutes]);
  useEffect(() => {
    findRoutes();
  }, []);

  const findRoutes = async () => {
    // axios.get("http://localhost:3028/all-routes").then((res) => {
    //   console.log(res);
    // });
    try {
      const response = await fetch("http://localhost:3028/all-routes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.routes);
      setRawRoutes(data.routes);
      // navigate("/all-routes", {
      //   state: { routes: data.routes, nodes: data.nodes, levels: data.levels },
      // });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  // useEffect(() => {
  //   loadRoutes();
  // }, [rawRoutes]);

  const processRoutes = (routesData) => {
    const liftsData = routesData
      .filter((route) => route.type)
      .map((route) => ({
        name: route.name,
        type: route.type,
        start: route.start,
        end: route.end,
        time: route.time,
      }));

    const slopesData = routesData
      .filter((route) => !route.type)
      .map((route) => ({
        name: route.name,
        level: route.level,
        start: route.start,
        end: route.end,
        distance: route.distance,
      }));

    setLifts(liftsData);
    setSlopes(slopesData);
  };

  const tableStyle = {
    width: "80%",
    margin: "20px auto",
    borderCollapse: "collapse",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  };

  const loadRoutes = (routesData) => {
    console.log(routesData);
    // console.log(routesCopy);
    if (routesData) {
      for (let i = 0; i < routesData.length; i++) {
        const edge = routesData[i];
        let start = nodes.filter((node) => {
          return node.name === edge.start;
        });
        let end = nodes.filter((node) => {
          return node.name === edge.end;
        });
        let e = {
          start: edge.start,
          start_x: start[0]?.x,
          start_y: start[0]?.y,
          end: edge.end,
          end_x: end[0]?.x,
          end_y: end[0]?.y,
          // weight: edge?.distance,
          strokeWidth: 1,
          midx: (start[0]?.x + end[0]?.x) / 2,
          midy: (start[0]?.y + end[0]?.y) / 2,
          type: edge.type ? edge.type : undefined,
          fill:
            edge.level === "Easy" && edge.type === undefined
              ? "blue"
              : edge.level === "Intermediate"
              ? "red"
              : edge.level === "Difficult"
              ? "black"
              : edge.type
              ? "green"
              : "purple",

          name: edge.name,
        };
        routesData[i] = e;
      }
      console.log(routesData);
      setRoutes2(routesData);
    }
  };

  // const renderLiftsTable = () => (

  // );

  const renderSlopesTable = () => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thTdStyle}>Name</th>
          <th style={thTdStyle}>Level</th>
          <th style={thTdStyle}>Start Point</th>
          <th style={thTdStyle}>End Point</th>
          <th style={thTdStyle}>Distance (meters)</th>
        </tr>
      </thead>
      <tbody>
        {slopes?.map((slope, index) => (
          <tr key={index}>
            <td style={thTdStyle}>{slope.name}</td>
            <td style={thTdStyle}>{slope.level}</td>
            <td style={thTdStyle}>{slope.start}</td>
            <td style={thTdStyle}>{slope.end}</td>
            <td style={thTdStyle}>{slope.distance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const handleRequestRoutes = async () => {
    if (!startPoint || !endPoint || !level) {
      let errorMessages = [];
      if (!startPoint) errorMessages.push("Start Point");
      if (!endPoint) errorMessages.push("End Point");
      if (!level) errorMessages.push("Level");
      setError(`Please select: ${errorMessages.join(", ")}`);
      return; // Exit the function if validation fails
    }
    setError(""); // Clear any previous errors

    const postData = {
      start: startPoint,
      end: endPoint,
      levels: level,
    };
    console.log("Sending POST request with body:", postData);

    try {
      const response = await fetch("http://localhost:3028/find-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // setRawRoutes(data.routes);
        setRawRoutes2(data.routes);
        setRoutes(data.routes);
        setSelectedPathIndex(null); // Reset selection upon fetching new routes
        setError(""); // Make sure to clear any previous error messages
      } else {
        // Set the message from the response as an error or informational message
        setError(data.message || "No routes found.");
        routes([]); // Clear previous routes
      }
    } catch (error) {
      console.error("Error during POST request:", error);
      setError("No routes found.");
    }
  };

  const renderRoutesTable = () => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th>Select Path</th>
          <th>Path</th>
          <th>Name</th>
          <th>Total Distance (meters)</th>
          <th>Total Time (minutes)</th>
          <th>Categories</th> {/* Add a header for the new Categories column */}
        </tr>
      </thead>
      <tbody>
        {routes.map((route, index) => (
          <tr key={index}>
            <td>
              <input
                type="radio"
                name="pathSelection"
                checked={selectedPathIndex === index}
                onChange={() => setSelectedPathIndex(index)}
              />
            </td>
            <td>
              {route.path
                .map((segment) => `${segment.start}-${segment.end}`)
                .join(", ")}
            </td>
            <td>{route.path.map((segment) => segment.name).join(", ")}</td>
            <td>{route.totalDistance}</td>
            <td>{route.totalTime.toFixed(2)}</td>
            <td>{route.categories.join(", ")}</td> {/* Display categories */}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const showSelectedPathOnGraph = () => {
    let selectedPath = routes[selectedPathIndex]?.path;
    console.log(routes[selectedPathIndex]);
    let routes2Copy = [...routes2];
    console.log(routes2Copy);
    console.log(selectedPath);
    for (let i = 0; i < routes2Copy?.length; i++) {
      routes2Copy[i].strokeWidth = 1;
    }
    for (let i = 0; i < routes2Copy.length; i++) {
      const route = routes2Copy[i];
      for (let j = 0; j < selectedPath?.length; j++) {
        const path = selectedPath[j];
        if (
          (path?.start === route.start &&
            path?.end === route.end &&
            path?.name === route.name) ||
          (path?.start === route.end &&
            path?.end === route.start &&
            path?.name === route.name &&
            path.type)
        ) {
          console.log(routes2Copy[i]);
          routes2Copy[i].strokeWidth = 10;
        }
      }
    }
  };

  const renderPathDetails = () => {
    showSelectedPathOnGraph();
    if (selectedPathIndex === null) return null;
    const selectedPath = routes[selectedPathIndex];

    return (
      <div>
        {selectedPath?.path?.map((segment, index) => (
          <p key={index}>
            Start from point {segment.start} to go to point {segment.end} via{" "}
            {segment.isLift ? "lift" : "slope"}: {segment.name}{" "}
            {segment.isLift && segment.type ? `(${segment.type})` : ""}
          </p>
        ))}
      </div>
    );
  };

  const filterRoutesBasedOnCategory = (e) => {
    let routesCopy = [...rawRoutes2];
    setCategory(e.target.value);
    if (e.target.value === "All") {
      setRoutes(routesCopy);
      return;
    } else {
      setCategory(e.target.value);
      console.log(e.target.value);
      routesCopy = routesCopy.filter((route) =>
        route.categories.includes(e.target.value)
      );
      if (routesCopy.length === 0) {
        setCategory("All");
      }
      // routesCopy.filter((route) => console.log(route));
      console.log(routesCopy);
      setRoutes(routesCopy);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div>
      <div>
        <div style={{ color: "#991b1b" }}>
          1.Enter Starting and Ending points using dropdown menu below the
          graph.
        </div>
        <div style={{ color: "#991b1b" }}>
          2.Select Difficulty from menu.To select multiple hold ctrl or cmnd.
        </div>
        <div style={{ color: "#991b1b" }}>3.Click on request routes.</div>
        <div style={{ color: "#991b1b" }}>
          4.You will see all possible routes.Then you can choose criteria from
          the new dropdown menu that appears.
        </div>
        <div style={{ color: "#991b1b" }}>
          5.Select your favourite path from the radio buttons beside routes.You
          will see details written below routes and highlighted on map.
        </div>
        <div style={{ color: "#991b1b" }}>
          6.Click on reset to calculate new one.
        </div>
      </div>
      <div className="graph">
        <Stage width={1450} height={650}>
          <Layer>
            {nodes?.map((node, index) => {
              return (
                <div key={index}>
                  <Text
                    x={node.x - 20}
                    y={node.y - 30}
                    text={node.name}
                    fontSize={15}
                    fill="black"
                  />
                  <Circle x={node.x} y={node.y} radius={6} fill="black" />
                </div>
              );
            })}
            {routes2?.map((route, index) => {
              return (
                <div key={index}>
                  <div data-tooltip-id={route.name}>
                    <Line
                      strokeWidth={route.strokeWidth}
                      points={
                        route.type
                          ? [
                              route.start_x,
                              route.start_y,
                              route.end_x,
                              route.end_y,
                            ]
                          : route.fill === "red"
                          ? [
                              route.start_x,
                              route.start_y,
                              route.midx,
                              route.start_y,
                              route.end_x,
                              route.end_y,
                            ]
                          : route.fill === "black"
                          ? [
                              route.start_x,
                              route.start_y,
                              route.midx - 100,
                              route.start_y,
                              route.end_x,
                              route.end_y,
                            ]
                          : [
                              route.start_x,
                              route.start_y,
                              route.midx,
                              route.end_y,
                              route.end_x,
                              route.end_y,
                            ]
                      }
                      stroke={route.fill}
                      tension={0.5}
                    />
                  </div>
                </div>
              );
            })}
          </Layer>
        </Stage>
      </div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <select
          value={startPoint}
          onChange={(e) => setStartPoint(e.target.value)}
        >
          <option value="">Select Start Point</option>
          {nodes?.map((node, index) => (
            <option key={index} value={node.name}>
              {node.name}
            </option>
          ))}
        </select>
        <select value={endPoint} onChange={(e) => setEndPoint(e.target.value)}>
          <option value="">Select End Point</option>
          {nodes?.map((node, index) => (
            <option key={index} value={node.name}>
              {node.name}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) =>
            setLevel(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          multiple
        >
          <option value="">Select Level</option>
          {levels?.map((level, index) => (
            <option key={index} value={level}>
              {level}
            </option>
          ))}
        </select>
        <button onClick={handleRequestRoutes}>Request Routes</button>
        <button onClick={handleReset}>Reset</button>
        {error && (
          <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
            {error}
          </div>
        )}
        {routes.length > 0 && (
          <select
            value={category}
            onChange={(e) => filterRoutesBasedOnCategory(e)}
          >
            <option value="All">All Criteria</option>
            <option value="Easiest">Easiest</option>
            <option value="Shortest">Shortest</option>
            <option value="Fastest">Fastest</option>
            <option value="Minimum Lift Usage">Minimum Lift Usage</option>
          </select>
        )}
        {/* Display the routes table only if routes are available */}
        {routes.length > 0 ? renderRoutesTable() : null}

        {selectedPathIndex !== null && renderPathDetails()}

        <div>
          <h2 style={{ textAlign: "center" }}>Lifts</h2>
          <table style={tableStyle}>
            {console.log(lifts)}
            <thead>
              <tr>
                <th style={thTdStyle}>Name</th>
                <th style={thTdStyle}>Type</th>
                <th style={thTdStyle}>Start Point</th>
                <th style={thTdStyle}>End Point</th>
                <th style={thTdStyle}>Time (minutes)</th>
              </tr>
            </thead>
            <tbody>
              {lifts.map((lift, index) => (
                <tr key={index}>
                  <td style={thTdStyle}>{lift.name}</td>
                  <td style={thTdStyle}>{lift.type}</td>
                  <td style={thTdStyle}>{lift.start}</td>
                  <td style={thTdStyle}>{lift.end}</td>
                  <td style={thTdStyle}>{lift.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 style={{ textAlign: "center" }}>Slopes</h2>
          {renderSlopesTable()}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;
