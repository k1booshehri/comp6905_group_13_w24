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

  useEffect(() => {
    const routesData = location.state?.routes || [];
    processRoutes(routesData);
  }, [location]);

  const processRoutes = (routesData) => {
    const nodes = new Set();
    const links = [];
    const levelSet = new Set();

    routesData.forEach((route) => {
      nodes.add(route.start);
      nodes.add(route.end);
      if (route.level) {
        levelSet.add(route.level);
      }
      links.push({
        source: route.start,
        target: route.end,
        name: `${route.start}-${route.end}`,
        label: route.isLift ? (route.level ? `${route.level}, L` : 'L') : route.level,
      });
    });

    setStartPoints([...nodes]);
    setEndPoints([...nodes]);
    setLevels([...levelSet]);
    setGraphData({
      nodes: Array.from(nodes).map(id => ({ id })),
      links,
    });
  };

  const handleCalculateRoutes = async () => {
    // Build query string
    const queryParams = new URLSearchParams({
      start: selectedStart,
      end: selectedEnd,
      level: selectedLevel
    });

    try {
      const response = await fetch(`http://localhost:3028/`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();

      // Assuming 'path' contains the array of routes
      processRoutes(result.path);
    } catch (error) {
      console.error('There was an error fetching the routes:', error);
    }
  };

  return (
    <div>
      <h2>All Available Routes</h2>
      <div style={{ marginBottom: '20px' }}>
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
      <ForceGraph2D
        graphData={graphData}
        width={800}
        height={600}
        nodeCanvasObject={(node, ctx) => {
          const label = node.id;
          const fontSize = 12;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link, ctx) => {
          // Draw the line
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();

          // Draw the label if it exists
          if (link.label) {
            const textX = (link.source.x + link.target.x) / 2;
            const textY = (link.source.y + link.target.y) / 2;
            const fontSize = 4; // Adjust as needed
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(link.label).width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(textX - textWidth / 2, textY - fontSize / 2, textWidth, fontSize);
            ctx.fillStyle = 'black';
            ctx.fillText(link.label, textX, textY);
          }
        }}
      />
    </div>
  );
};

export default RoutesPage;
