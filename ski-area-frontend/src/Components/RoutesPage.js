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
  const [routeSummary, setRouteSummary] = useState({
    path: '',
    totalTime: 0,
    totalDistance: 0,
  });

  useEffect(() => {
    const routesData = location.state?.routes || [];
    processRoutes(routesData);
  }, [location]);

  const processRoutes = (routesData) => {
    const nodes = new Set();
    const linksMap = new Map();
    const levelSet = new Set();

    routesData.forEach((route) => {
      const key = `${route.start}-${route.end}`;
      nodes.add(route.start);
      nodes.add(route.end);
      if (route.level) levelSet.add(route.level);

      // Combine labels for the same edge, avoiding duplicate 'L'
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
        linksMap.set(key, { labels: [levelLabel, liftLabel].filter(Boolean) });
      }
    });

    const links = Array.from(linksMap, ([name, data]) => {
      const [start, end] = name.split('-');
      const label = data.labels.join(', ');
      return { source: start, target: end, label };
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
    if (selectedStart && selectedEnd && selectedLevel) {
      const queryParams = new URLSearchParams({
        start: selectedStart,
        end: selectedEnd,
        level: selectedLevel
      });

      try {
        const response = await fetch(`http://localhost:3028/?${queryParams}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        processRoutes(result.path);
        setRouteSummary({
          path: result.path.map(route => `${route.start}-${route.end}`).join(', '),
          totalTime: result.totalTime,
          totalDistance: result.totalDistance,
        });
      } catch (error) {
        console.error('There was an error fetching the routes:', error);
      }
    } else {
      alert('Please select start point, end point, and level to calculate routes.');
    }
  };

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
          // Draw the line
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();

          // Draw the label if it exists
          if (link.label) {
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textX = (link.source.x + link.target.x) / 2;
            const textY = (link.source.y + link.target.y) / 2;
            const textWidth = ctx.measureText(link.label).width;
            const textHeight = fontSize * 1.2;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(textX - textWidth / 2 - 4, textY - textHeight / 2 - 4, textWidth + 8, textHeight + 8);

            ctx.fillStyle = 'black';
            ctx.fillText(link.label, textX, textY);
          }
        }}
      />
    </div>
  );
};

export default RoutesPage;
