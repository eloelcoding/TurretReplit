from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

import uvicorn

# Get the project root directory (parent of backend)
PROJECT_ROOT = Path(__file__).parent.parent

app = FastAPI()


# Serve the index.html file as the default page with environment variable injection
@app.get("/")
async def get_index():
    # Read the HTML file
    html_path = PROJECT_ROOT / "index.html"
    html_content = html_path.read_text()
    
    # Get DEV_MODE environment variable (default to "false" for production)
    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    
    # Inject a script tag before the closing </head> tag to set the dev mode
    injection_script = f'<script>window.__DEV_MODE__ = {str(dev_mode).lower()};</script>'
    
    # Insert the script before </head>
    if "</head>" in html_content:
        html_content = html_content.replace("</head>", f"{injection_script}\n</head>")
    else:
        # Fallback: insert at the beginning of <head>
        html_content = html_content.replace("<head>", f"<head>\n{injection_script}")
    
    return HTMLResponse(content=html_content)


# Serve static files from the project root
app.mount("/", StaticFiles(directory=PROJECT_ROOT), name="static")


# Run the server
if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 3000))
    # Use reload=False in production/Docker, reload=True for development
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("server:app", reload=reload, host="0.0.0.0", port=port)

