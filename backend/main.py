import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import kociemba

# Initialize the FastAPI application
app = FastAPI()

# Define the allowed origins for CORS (your React frontend)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add the CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic model for the /solve endpoint's request body ---
class CubeRequest(BaseModel):
    cube_string: str


# --- API Endpoint to solve the cube ---
@app.post("/solve")
def solve_cube_endpoint(request: CubeRequest):
    """
    Receives a 54-character cube string, validates it,
    and returns the solution from the kociemba library.
    """
    cube_string = request.cube_string.upper()
    try:
        solution = kociemba.solve(cube_string)
        return {"solution": solution}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"This cube configuration is not solvable. Error: {e}"
        )


# --- API Endpoint to get statistics from the local file ---
@app.get("/stats")
def get_wca_stats():
    """
    Reads WCA records from a local wca_records.json file 
    to bypass any potential network issues.
    """
    try:
        with open("wca_records.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="wca_records.json file not found in the backend directory.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading or parsing local JSON file: {e}")


# --- Root endpoint to confirm the API is running ---
@app.get("/")
def read_root():
    """
    A simple endpoint to check if the server is running.
    """
    return {"message": "Rubik's Cube Solver API is running."}