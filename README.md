# LIFEOS X — Financial Digital Twin (Flask + SQLite)

This package keeps the existing LIFEOS X frontend and adds a local Python backend. The Flask server serves the HTML page, exposes JSON API routes, and persists editable form fields in a SQLite database.

## Run on Windows (recommended)

1. Install Python 3.10+ from https://www.python.org/downloads/ and enable **Add Python to PATH** during setup.
2. Extract this ZIP.
3. Open the extracted `LIFEOS_X_Backend_Project` folder in VS Code.
4. In VS Code, open **Terminal → New Terminal**.
5. Run these commands one by one:

   ```powershell
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   py app.py
   ```

   If PowerShell blocks activation, skip the activation command and run `py -m pip install -r requirements.txt` followed by `py app.py`.
6. Open **http://127.0.0.1:5000** in your browser. Do not use Live Server for this backend version.
7. Test **http://127.0.0.1:5000/api/health**; it should return JSON with `"ok": true`.

Alternative: double-click `run.bat` after Python is installed.

## What is included

- `app.py`: Flask backend and API routes.
- `templates/index.html`: your original dashboard with a small API bridge added.
- `lifeos_x.db`: created automatically on first run; saved input data lives here.
- `requirements.txt`: Python dependency list.
- `run.bat`: Windows helper script.

## API routes

- `GET /api/health` — server health check.
- `GET /api/state` — read saved form state.
- `PUT /api/state` — save form state as JSON.
- `GET /api/dashboard` — return calculated net worth and monthly cash flow from saved values.

## Notes

- The backend stores this local app's data in one local database; this version does not include accounts or multi-user login.
- This is a college/demo development server, not a production deployment. Do not expose it to the public internet.
- GELLO's browser voice features remain browser-based; no external AI service/API key is included or claimed to be connected.
- Keep financial data fictional while testing, or use this local demo only with data you are comfortable storing on your computer.
