import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import allRoutes from './routes.png';

const RoutesPage = () => {
  const location = useLocation();
  const [lifts, setLifts] = useState([]);
  const [slopes, setSlopes] = useState([]);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [level, setLevel] = useState('');
  const [nodes, setNodes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState([]); // State to hold fetched routes
  const [selectedPathIndex, setSelectedPathIndex] = useState(null); // Index of the selected path


  useEffect(() => {
    const { routes, nodes, levels } = location.state || {};
    if (routes) {
      processRoutes(routes);
    }
    if (nodes) {
      setNodes(nodes);
    }
    if (levels) {
      setLevels(levels);
    }
  }, [location.state]);

  const processRoutes = (routesData) => {
    const liftsData = routesData.filter(route => route.type).map(route => ({
      name: route.name,
      type: route.type,
      start: route.start,
      end: route.end,
      time: route.time
    }));

    const slopesData = routesData.filter(route => !route.type).map(route => ({
      name: route.name,
      level: route.level,
      start: route.start,
      end: route.end,
      distance: route.distance
    }));

    setLifts(liftsData);
    setSlopes(slopesData);
  };

  const tableStyle = {
    width: '80%',
    margin: '20px auto',
    borderCollapse: 'collapse',
  };

  const thTdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };

  const renderLiftsTable = () => (
    <table style={tableStyle}>
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
  );

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
        {slopes.map((slope, index) => (
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
      if (!startPoint) errorMessages.push('Start Point');
      if (!endPoint) errorMessages.push('End Point');
      if (!level) errorMessages.push('Level');
      setError(`Please select: ${errorMessages.join(', ')}`);
      return; // Exit the function if validation fails
    }
    setError(''); // Clear any previous errors
  
    const postData = {
      start: startPoint,
      end: endPoint,
      level: level
    };
    console.log("Sending POST request with body:", postData);
  
    try {
      const response = await fetch('http://localhost:3028/find-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startPoint, end: endPoint, level: level })
      });
      const data = await response.json();
      setRoutes(data.routes);
      setSelectedPathIndex(null); // Reset selection upon fetching new routes
    } catch (error) {
      console.error('Error during POST request:', error);
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
            <td>{route.path.map(segment => `${segment.start}-${segment.end}`).join(', ')}</td>
            <td>{route.path.map(segment => segment.name).join(', ')}</td>
            <td>{route.totalDistance}</td>
            <td>{route.totalTime.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPathDetails = () => {
    if (selectedPathIndex === null) return null;
    const selectedPath = routes[selectedPathIndex];

    return (
      <div>
        {selectedPath.path.map((segment, index) => (
          <p key={index}>
            Start from point {segment.start} to go to point {segment.end} via {segment.isLift ? 'lift' : 'slope'}: {segment.name} {segment.isLift && segment.type ? `(${segment.type})` : ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>All Available Routes</h1>
      <img src={allRoutes} alt="All Routes" style={{ height: '600px' }} />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <select value={startPoint} onChange={(e) => setStartPoint(e.target.value)}>
          <option value="">Select Start Point</option>
          {nodes.map((node, index) => (
            <option key={index} value={node}>
              {node}
            </option>
          ))}
        </select>
        <select value={endPoint} onChange={(e) => setEndPoint(e.target.value)}>
          <option value="">Select End Point</option>
          {nodes.map((node, index) => (
            <option key={index} value={node}>
              {node}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select Level</option>
          {levels.map((level, index) => (
            <option key={index} value={level}>
              {level}
            </option>
          ))}
        </select>
        <button onClick={handleRequestRoutes}>Request Routes</button>
        <div>
        <h2 style={{ textAlign: 'center' }}>Lifts</h2>
        {renderLiftsTable()}
      </div>
      <div>
        <h2 style={{ textAlign: 'center' }}>Slopes</h2>
        {renderSlopesTable()}
      </div>
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {routes.length > 0 ? renderRoutesTable() : null}
      {renderPathDetails()}
    </div>
  );

};

export default RoutesPage;