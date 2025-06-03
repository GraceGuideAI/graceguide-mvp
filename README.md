# GraceGuide MVP

This project is a small FastAPI service with a Vite/Vanilla JS frontend.

## Install Python dependencies

```bash
pip install -r requirements.txt
```

## Build the frontend

```bash
cd graceguide-ui
npm install
npm run build
```

## Environment variables

Set your OpenAI key so the API and database builder can access the model:

```bash
export OPENAI_API_KEY=your-openai-key
```

## Start the FastAPI server

Once the dependencies are installed and the database has been created with `python build_db.py`, run the API:

```bash
uvicorn app:app --reload --port 8000
```

The built UI in `graceguide-ui/dist` will be served automatically when the server is running.
