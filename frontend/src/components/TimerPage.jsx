import React, { useState, useEffect, useRef, useCallback } from 'react';
import { randomScrambleForEvent } from "cubing/scramble";

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

const calculateAo5 = (times) => {
  if (times.length < 5) return null;
  const lastFive = times.slice(-5).sort((a, b) => a - b);
  const middleThree = lastFive.slice(1, 4);
  const sum = middleThree.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / 3);
};

const TimerPage = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [scramble, setScramble] = useState("Loading scramble...");
  const [sessionTimes, setSessionTimes] = useState([]);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  const generateScramble = useCallback(async () => {
    const newScramble = await randomScrambleForEvent("333");
    setScramble(newScramble.toString());
  }, []);

  useEffect(() => {
    generateScramble();
  }, [generateScramble]);
  
  // This single useEffect now handles all timer logic based on the isRunning state
  useEffect(() => {
    if (isRunning) {
      // When the timer starts, record the start time
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
    
    // The cleanup function runs when isRunning becomes false or the component unmounts
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      // When stopping, add the current time to the session and generate a new scramble
      setSessionTimes(prevTimes => [...prevTimes, time]);
      generateScramble();
    } else {
      // When starting, reset the time display to zero before the timer starts
      setTime(0);
    }
    // Toggle the running state, which will trigger the useEffect above
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    // Stop the timer and reset all states
    setIsRunning(false);
    setTime(0);
    setSessionTimes([]);
    generateScramble();
  };
  
  // This useEffect handles the spacebar press
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
  }, [isRunning, time]); // We include 'time' here to ensure the session update has the latest value

  // Calculate session stats
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