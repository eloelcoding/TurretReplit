from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

import uvicorn

# Get the project root directory (parent of backend)
PROJECT_ROOT = Path(__file__).parent.parent

app = FastAPI()


# Serve the index.html file as the default page
@app.get("/")
async def get_index():
    return FileResponse(PROJECT_ROOT / "index.html")


# Serve static files from the project root
app.mount("/", StaticFiles(directory=PROJECT_ROOT), name="static")


# Run the server
if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 3000))
    # Use reload=False in production/Docker, reload=True for development
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("server:app", reload=reload, host="0.0.0.0", port=port)

