import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import myImage from './main.png';

const HomePage = () => {
  const navigate = useNavigate(); // Use useNavigate here

  const findRoutes = async () => {
    try {
      const response = await fetch('http://localhost:3028/all-routes');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Use navigate to go to the new route and pass state
      navigate('/routes', { state: { routes: data.routes } });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div>
      <img src={myImage} style={{ height: '350px' }} />
      <div>
        <button onClick={findRoutes}>Find Routes</button>
        <button style={{ marginLeft: '5px' }}>Find Restaurants</button>
        <button style={{ marginLeft: '5px' }}>Find Restrooms</button>
      </div>
    </div>
  );
};

export default HomePage;
