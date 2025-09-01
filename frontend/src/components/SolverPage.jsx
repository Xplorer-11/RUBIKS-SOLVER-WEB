import React, { useState } from 'react';
import axios from 'axios';

// Kociemba face order: U, R, F, D, L, B
const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
const FACE_NAMES = {
  U: 'Up (White)', R: 'Right (Red)', F: 'Front (Green)',
  D: 'Down (Yellow)', L: 'Left (Orange)', B: 'Back (Blue)',
};

// Instructions for each face
const INPUT_INSTRUCTIONS = {
  U: {
    title: "Up (White) Face",
    text: "Hold the cube with the ⬜ WHITE center facing you. Ensure 🟦 BLUE is on top and 🟩 GREEN is on the bottom."
  },
  R: {
    title: "Right (Red) Face",
    text: "Hold the cube with the 🟥 RED center facing you. Ensure ⬜ WHITE is on top and 🟨 YELLOW is on the bottom."
  },
  F: {
    title: "Front (Green) Face",
    text: "Hold the cube with the 🟩 GREEN center facing you. Ensure ⬜ WHITE is on top and 🟨 YELLOW is on the bottom."
  },
  D: {
    title: "Down (Yellow) Face",
    text: "Hold the cube with the 🟨 YELLOW center facing you. Ensure 🟩 GREEN is on top and 🟦 BLUE is on the bottom."
  },
  L: {
    title: "Left (Orange) Face",
    text: "Hold the cube with the 🟧 ORANGE center facing you. Ensure ⬜ WHITE is on top and 🟨 YELLOW is on the bottom."
  },
  B: {
    title: "Back (Blue) Face",
    text: "Hold the cube with the 🟦 BLUE center facing you. Ensure ⬜ WHITE is on top and 🟨 YELLOW is on the bottom."
  },
};


// Initial state with a solved cube
const initialCubeState = {
  U: Array(9).fill('U'), R: Array(9).fill('R'), F: Array(9).fill('F'),
  D: Array(9).fill('D'), L: Array(9).fill('L'), B: Array(9).fill('B'),
};

const ColorPicker = ({ selectedColor, onColorChange }) => (
  <div className="color-picker">
    {['U', 'R', 'F', 'D', 'L', 'B'].map((color) => (
      <div
        key={color}
        className={`color-box ${color} ${selectedColor === color ? 'selected' : ''}`}
        onClick={() => onColorChange(color)}
      >
        {color}
      </div>
    ))}
  </div>
);


const SolverPage = () => {
  const [cubeState, setCubeState] = useState(initialCubeState);
  const [selectedColor, setSelectedColor] = useState('U');
  const [activeFace, setActiveFace] = useState('U');
  const [solution, setSolution] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStickerClick = (face, index) => {
    const newCubeState = { ...cubeState };
    newCubeState[face][index] = selectedColor;
    setCubeState(newCubeState);
  };
  
  const isCubeSolved = (currentCubeState) => {
    for (const face of FACES) {
      const faceIsSolved = currentCubeState[face].every(sticker => sticker === face);
      if (!faceIsSolved) { return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isCubeSolved(cubeState)) {
      setError('');
      setSolution('The cube is already solved');
      return;
    }

    setIsLoading(true);
    setSolution('');
    setError('');

    const cubeString = FACES.map(face => cubeState[face].join('')).join('');

    try {
      // --- THIS IS THE UPDATED LINE FOR DEPLOYMENT ---
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/solve`, {
        cube_string: cubeString,
      });
      setSolution(response.data.solution);
    } catch (err)      {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetCube = () => {
    setCubeState(initialCubeState);
    setSolution('');
    setError('');
    setActiveFace('U');
  }

  return (
    <div className="page-content">
      <header>
        <h1>Rubik's Cube Solver 🧠</h1>
        <p>Click a color, then paint the stickers. Click a face to see its orientation instructions.</p>
      </header>
      
      <div className="main-content">
        <div className="input-panel">
          <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
          <div className="cube-input-grid">
            {FACES.map(face => (
              <div
                key={face}
                className={`face-container ${activeFace === face ? 'active' : ''}`}
                onClick={() => setActiveFace(face)}
              >
                <h3>{FACE_NAMES[face]}</h3>
                <div className="face-grid">
                  {cubeState[face].map((color, index) => (
                    <div
                      key={index}
                      className={`sticker ${color}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStickerClick(face, index);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="instructions-panel">
          <h3>➡️ Orientation Instructions</h3>
          <div className="instructions-content">
            <h4>For the {INPUT_INSTRUCTIONS[activeFace].title}</h4>
            <p>{INPUT_INSTRUCTIONS[activeFace].text}</p>
          </div>

          <hr />
          <div className="notation-guide">
            <h4>Solution Notation Guide</h4>
            <h5>The Basic Moves (The Letters)</h5>
            <p>Each letter corresponds to one of the six faces of the cube:</p>
            <ul>
              <li><code>F</code>: <strong>Front</strong> (the face looking at you)</li>
              <li><code>B</code>: <strong>Back</strong> (the face opposite the front)</li>
              <li><code>U</code>: <strong>Up</strong> (the top face)</li>
              <li><code>D</code>: <strong>Down</strong> (the bottom face)</li>
              <li><code>L</code>: <strong>Left</strong> (the left face)</li>
              <li><code>R</code>: <strong>Right</strong> (the right face)</li>
            </ul>
            <h5>The Turn Modifiers</h5>
            <p>The symbol after the letter tells you how to turn the face:</p>
            <ul>
                <li><strong>Just a letter</strong> (e.g., <code>F</code>): A 90° <strong>clockwise</strong> turn.</li>
                <li><strong>Apostrophe '</strong> (e.g., <code>F'</code>): A 90° <strong>counter-clockwise</strong> turn.</li>
                <li><strong>Number 2</strong> (e.g., <code>F2</code>): A <strong>180°</strong> turn (a half turn).</li>
            </ul>
          </div>
        </div>
      </div>
        
      <div className="controls">
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Solving...' : 'Solve Cube'}
          </button>
          <button onClick={resetCube} className="reset-btn">Reset</button>
      </div>

      <div className="results">
        {error && ( <div className="error"> <h2>❌ Error:</h2> <p>{error}</p> </div> )}
        {solution && (
          <div className="solution">
            {solution !== 'The cube is already solved' && (
               <div className="solve-instructions">
                <h4>➡️ Hold the Cube for Solving:</h4>
                <p>
                  Hold the cube with the ⬜ **WHITE** side on **TOP** and the 🟩 **GREEN** side facing **YOU**.
                  <br />
                  <small>(This means 🟥 RED is on your right and 🟦 BLUE is in the back).</small>
                </p>
              </div>
            )}
            <h2>✅ Solution:</h2>
            <p className="solution-text">{solution}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolverPage;