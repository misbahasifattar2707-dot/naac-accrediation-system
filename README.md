# NAAC Project Reorganization

This project has been restructured into a clean and professional folder structure following industry best practices.

## Folder Structure

```text
.
├── backend/                # Flask Backend
│   ├── models/             # SQLAlchemy Models
│   │   ├── __init__.py
│   │   └── models.py
│   ├── routes/             # API and UI Routes (Blueprints)
│   │   ├── __init__.py
│   │   ├── api_routes.py
│   │   └── routes.py
│   ├── scripts/            # Database Migrations and Seed Scripts
│   │   ├── __init__.py
│   │   ├── init_db.py
│   │   ├── seeds.py
│   │   └── migrate_*.py
│   ├── docs/               # Project Documentation and DB Diagrams
│   ├── static/             # React Build Output (CSS, JS, Images)
│   ├── templates/          # React Entry Point (index.html)
│   ├── instance/           # Local Database / Instance Files
│   ├── app.py              # Application Entry Point
│   ├── extensions.py       # Shared Extensions (db, bcrypt)
│   ├── config.py           # Configuration Settings
│   └── requirements.txt    # Python Dependencies
├── frontend/               # React Frontend Source
│   ├── src/
│   │   ├── assets/         # Static Assets (Styles, Images)
│   │   │   ├── styles/
│   │   │   └── images/
│   │   ├── api/            # API Service Layer
│   │   ├── components/     # Reusable React Components
│   │   ├── pages/          # Page Components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/             # Public Assets
│   ├── package.json        # Frontend Dependencies and Scripts
│   └── vite.config.js      # Vite Configuration
└── README.md               # This file
```

## How to Run

### Backend
1. Navigate to the `backend` folder.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run the application: `python app.py`.

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Run in development mode: `npm run dev`.
4. Build for production: `npm run build`.

## Improvements & Optimization
- **Separation of Concerns**: Models and Routes are now in their own subfolders, making the codebase more maintainable.
- **Asset Organization**: Frontend assets are properly categorized under `src/assets`.
- **Package Initialization**: Added `__init__.py` files to ensure subdirectories are treated as Python packages.
- **Clean Root**: The project root is now clean, containing only the main `frontend` and `backend` directories.
