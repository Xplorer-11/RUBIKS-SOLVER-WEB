import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

// Helper function to format WCA times (which are in hundredths of a second)
const formatWcaTime = (hundredths) => {
  if (!hundredths || hundredths <= 0) return 'N/A';
  const totalSeconds = hundredths / 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const remainingHundredths = hundredths % 100;

  let result = '';
  if (minutes > 0) {
    result += `${minutes}:`;
    result += `${seconds.toString().padStart(2, '0')}.`;
  } else {
    result += `${seconds}.`;
  }
  result += remainingHundredths.toString().padStart(2, '0');
  return result;
};


const StatisticsPage = () => {
  const [worldRecords, setWorldRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
        
        const records333 = {
          single: response.data.records['333'].single,
          average: response.data.records['333'].average
        };
        setWorldRecords(records333);

      } catch (err) {
        setError('Failed to fetch data from the backend API.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="page-content"><h2>Loading Statistics... ⏳</h2></div>;
  }

  if (error) {
    return <div className="page-content error"><h2>❌ Error</h2><p>{error}</p></div>;
  }

  return (
    <div className="page-content stats-page">
      <header>
        <h1>Cubing World Records 📊</h1>
        <p>Official 3x3x3 records from the World Cube Association.</p>
      </header>
      
      {worldRecords && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>3x3x3 Single</h3>
            <div className="stat-value">{formatWcaTime(worldRecords.single.result)}</div>
            <div className="stat-details">
              {worldRecords.single.person_name} at {worldRecords.single.competition_name} ({worldRecords.single.year})
            </div>
          </div>
          <div className="stat-card">
            <h3>3x3x3 Average</h3>
            <div className="stat-value">{formatWcaTime(worldRecords.average.result)}</div>
            <div className="stat-details">
              {worldRecords.average.person_name} at {worldRecords.average.competition_name} ({worldRecords.average.year})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;