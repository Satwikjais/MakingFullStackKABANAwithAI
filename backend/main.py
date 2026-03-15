from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse

app = FastAPI(title="Project Management Backend")

@app.post("/api/login")
async def login(data: dict):
    username = data.get("username")
    password = data.get("password")
    if username == "user" and password == "password":
        return {"message": "Login successful", "status": "success"}
    return {"message": "Invalid credentials", "status": "error"}

@app.post("/api/logout")
async def logout():
    return {"message": "Logout successful", "status": "success"}

# Mount static files for the frontend (after routes to allow /api)
app.mount("/", StaticFiles(directory="backend/static", html=True), name="static")