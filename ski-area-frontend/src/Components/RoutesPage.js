import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';

const RoutesPage = () => {
  const location = useLocation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [startPoints, setStartPoints] = useState([]);
  const [endPoints, setEndPoints] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedRouteDetails, setSelectedRouteDetails] = useState('');
  const [routeSummary, setRouteSummary] = useState({
    path: '',
    totalTime: 0,
    totalDistance: 0,
  });
  const [showTable, setShowTable] = useState(false); // New state variable to track if the table should be shown
  const [routeData, setRouteData] = useState([]); // State to hold the route data for the table

  useEffect(() => {
    const { routes, nodes, levels } = location.state || {};
    if (nodes && levels) {
      setStartPoints(nodes);
      setEndPoints(nodes);
      setLevels(levels);
    }
    if (routes) {
      processRoutes(routes); // Ensure this is the only place where graph data is set.
    }
  }, [location.state]);

  const processRoutes = (routesData) => {
    const nodes = new Set();
    const linksMap = new Map();
    const levelSet = new Set();

    routesData.forEach((route) => {
      const key = `${route.start}-${route.end}`;
      nodes.add(route.start);
      nodes.add(route.end);
      if (route.level) levelSet.add(route.level);

      const existingEntry = linksMap.get(key);
      const levelLabel = route.level || '';
      const liftLabel = route.isLift ? 'L' : '';

      if (existingEntry) {
        if (levelLabel && !existingEntry.labels.includes(levelLabel)) {
          existingEntry.labels.push(levelLabel);
        }
        if (liftLabel && !existingEntry.labels.includes(liftLabel)) {
          existingEntry.labels.push(liftLabel);
        }
      } else {
        linksMap.set(key, { source: route.start, target: route.end, labels: [levelLabel, liftLabel].filter(Boolean) });
      }
    });

    const links = Array.from(linksMap.values()).map(link => ({
      ...link,
      label: link.labels.join(', ')
    }));

    setGraphData({
      nodes: Array.from(nodes).map(id => ({ id })),
      links,
    });
  };

  const handleCalculateRoutes = async () => {
    if (selectedStart && selectedEnd && selectedLevel) {
      try {
        const response = await fetch(`http://localhost:3028/`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        // Parse the JSON response only once
        const result = await response.json();

        // Check if 'routes' key exists and is an array
        if (!result || !Array.isArray(result.routes)) {
          throw new Error('Unexpected response structure');
        }

        // Now we pass the routes data instead of result.path
        processRoutes(result.routes);

        setRouteSummary({
          path: result.routes.map(route => route.path.map(p => `${p.start}-${p.end}`).join(', ')).join('; '),
          totalTime: result.routes.reduce((acc, route) => acc + route.totalTime, 0),
          totalDistance: result.routes.reduce((acc, route) => acc + route.totalDistance, 0),
        });

        setShowTable(true);
        setRouteData(result.routes); // Saving the routes for rendering the table

      } catch (error) {
        console.error('There was an error fetching the routes:', error);
        setShowTable(false);
      }
    } else {
      alert('Please select start point, end point, and level to calculate routes.');
    }
  };

  // Function to handle the checkbox selection
  const handleRouteSelection = (index) => {
    const selectedRoute = routeData[index];
    const details = selectedRoute.path.map((segment) => {
      if (segment.isLift) {
        return `Take Lift from ${segment.start} to get to ${segment.end}`;
      } else {
        return `Using ${segment.level} slope go from ${segment.start} to ${segment.end}`;
      }
    }).join('. ') + '.';

    setSelectedRouteDetails(`Route Details: ${details}`);
  };


  // Function to process and return a string from the path array
  const processPath = (path) => path.map((p) => `${p.start}-${p.end}`).join(', ');

  // Function to render the table
  const renderTable = () => (
    <table>
      <thead>
        <tr>
          <th>Select Route</th> {/* Added Checkbox Column */}
          <th>Path</th>
          <th>Total Distance (meters)</th>
          <th>Total Time (minutes)</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {routeData.map((route, index) => (
          <tr key={index}>
            <td>
              <input
                type="checkbox"
                checked={selectedRouteDetails === route}
                onChange={() => handleRouteSelection(index)}
              />
            </td>
            <td>{processPath(route.path)}</td>
            <td>{route.totalDistance}</td>
            <td>{route.totalTime}</td>
            <td>{Array.isArray(route.category) ? route.category.join(', ') : route.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Conditionally render the table based on the showTable state
  if (showTable) {
    return (
      <div>
        <h2>Routes as per request</h2>
        {renderTable()}
        {selectedRouteDetails && <div><p>{selectedRouteDetails}</p></div>} {/* Display the selected route details */}
      </div>
    );
  }

  return (
    <div>
      <h2>All Available Routes</h2>
      <div style={{ marginBottom: '5px' }}>
        <label>
          Start Point:
          <select value={selectedStart} onChange={(e) => setSelectedStart(e.target.value)}>
            <option value="">Select Start</option>
            {startPoints.map((point) => (
              <option key={point} value={point}>
                {point}
              </option>
            ))}
          </select>
        </label>
        <label>
          End Point:
          <select value={selectedEnd} onChange={(e) => setSelectedEnd(e.target.value)}>
            <option value="">Select End</option>
            {endPoints.map((point) => (
              <option key={point} value={point}>
                {point}
              </option>
            ))}
          </select>
        </label>
        <label>
          Level:
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
            <option value="">Select Level</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleCalculateRoutes}>Calculate Routes</button>
      </div>
      <div className="route-summary">
        <p>Path: {routeSummary.path}</p>
        <p>Total Time for path: {routeSummary.totalTime} minutes</p>
        <p>Total Distance: {routeSummary.totalDistance} meters</p>
      </div>
      <ForceGraph2D
        graphData={graphData}
        width={800}
        height={400}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link, ctx, globalScale) => {
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();

          if (link.label) {
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textX = (link.source.x + link.target.x) / 2;
            const textY = (link.source.y + link.target.y) / 2;
            ctx.fillStyle = 'black';
            ctx.fillText(link.label, textX, textY);
          }
        }}
      />
    </div>
  );
};

export default RoutesPage;
