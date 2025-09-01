import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import axios from 'axios';
import { randomScrambleForEvent } from "cubing/scramble";
import { AuthContext } from '../context/AuthContext';
import '../App.css';

// Helper function to format WCA times (which are in milliseconds)
const formatTime = (time) => {
  if (time === null || time === undefined) return 'N/A';
  if (time <= 0) return '0.00';
  const totalSeconds = time / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.round((time % 1000) / 10);

  let result = '';
  if (minutes > 0) {
    result += `${minutes}:`;
    result += `${seconds.toString().padStart(2, '0')}.`;
  } else {
    result += `${seconds}.`;
  }
  result += milliseconds.toString().padStart(2, '0');
  return result;
};

// Helper function to calculate Average of 5
const calculateAo5 = (times) => {
  if (times.length < 5) return null;
  const lastFive = times.slice(-5).sort((a, b) => a - b); // Get last 5 and sort them
  const middleThree = lastFive.slice(1, 4); // Remove best and worst
  const sum = middleThree.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / 3);
};


const TimerPage = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [scramble, setScramble] = useState("Loading scramble...");
  const [sessionTimes, setSessionTimes] = useState([]);

  const { token } = useContext(AuthContext); // Get the auth token from context

  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  const generateScramble = useCallback(async () => {
    const newScramble = await randomScrambleForEvent("333");
    setScramble(newScramble.toString());
  }, []);

  // Generate the first scramble when the component loads
  useEffect(() => {
    generateScramble();
  }, [generateScramble]);
  
  // This useEffect hook is the core of the timer.
  // It starts/stops the interval based on the `isRunning` state.
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
    
    // Cleanup function runs when `isRunning` becomes false or the component unmounts
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      // --- STOPPING THE TIMER ---
      const finalTime = time; // Capture the time when stopped
      setSessionTimes(prevTimes => [...prevTimes, finalTime]);
      
      // Save solve to the database if the user is logged in
      if (token) {
        const solveData = {
          time_ms: finalTime,
          scramble: scramble,
        };
        axios.post('http://localhost:8000/solves', solveData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => {
          console.error("Failed to save solve:", err);
          // You could add logic here to handle expired tokens, e.g., logging the user out.
        });
      }
      
      generateScramble();
    } else {
      // --- STARTING THE TIMER ---
      setTime(0);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setSessionTimes([]);
    generateScramble();
  };
  
  // This useEffect handles the spacebar press for starting and stopping the timer
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleStartStop();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRunning, time, token, scramble]); // Dependencies ensure the function has the latest state

  // Calculate session stats for display
  const bestTime = sessionTimes.length > 0 ? Math.min(...sessionTimes) : null;
  const worstTime = sessionTimes.length > 0 ? Math.max(...sessionTimes) : null;
  const ao5 = calculateAo5(sessionTimes);

  return (
    <div className="page-content timer-page">
      <header>
        <h1>Stopwatch Timer ⏱️</h1>
      </header>

      <div className="timer-main-content">
        <div className="session-panel">
          <h3>Session Stats</h3>
          <div className="session-stats">
            <div><span>Solves:</span> {sessionTimes.length}</div>
            <div><span>Best:</span> {formatTime(bestTime)}</div>
            <div><span>Worst:</span> {formatTime(worstTime)}</div>
            <div><span>Ao5:</span> {formatTime(ao5)}</div>
          </div>
          <h3>Session Times</h3>
          <ol className="session-times-list">
            {sessionTimes.map((t, index) => (
              <li key={index}>{formatTime(t)}</li>
            )).reverse()}
          </ol>
        </div>

        <div className="timer-display-area">
          <div className="scramble-display">
            {scramble}
          </div>
          <div className="timer-display">
            {formatTime(time)}
          </div>
          <div className="timer-controls">
            <button onClick={handleStartStop} className={`timer-btn ${isRunning ? 'stop-btn' : 'start-btn'}`}>
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <button onClick={handleReset} className="timer-btn reset-btn">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerPage;