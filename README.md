# DataMind AI

An intelligent data science assistant designed for the ABB EngineeredX 2.0 (Problem Statement 8). DataMind AI helps users of all expertise levels (Beginner, Intermediate, Expert) analyze datasets, recommend machine learning models, and generate complete, runnable Python pipelines.

## Features

- **Automated Data Analysis**: Upload any CSV or Excel file, and DataMind will automatically detect the dataset's shape, data types, missing values, and suggest the appropriate machine learning task (Classification, Regression, Clustering, or Time-Series).
- **Intelligent Model Recommendation**: Based on the dataset's characteristics, DataMind recommends the top 3 best-suited machine learning models with detailed explanations of its choices.
- **Pipeline Generation**: Automatically generates a complete, runnable Python script for data preprocessing, training, and evaluation.
- **Model Training & Evaluation**: Trains the recommended model on the uploaded dataset and provides comprehensive performance metrics (e.g., accuracy, F1 score, RMSE, Silhouette score).
- **LLM-Powered Explanations**: Integrates with the Groq API (Llama 3) to explain complex data science concepts, model choices, and evaluation results in plain English, adapting to the user's expertise level.

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Django, Django REST Framework
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, Numpy, Scipy
- **LLM API**: Groq API (Llama3-8b)

## Project Structure

- `/backend` - Django project containing the API, ML engine, and LLM integration.
- `/frontend` - React application providing the user interface.

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js (v18+)
- A free Groq API Key (from https://console.groq.com)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables by creating a `.env` file in the `backend/` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   DEBUG=True
   SECRET_KEY=your_django_secret_key
   ```
5. Apply migrations and start the server:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Upload a dataset (CSV or Excel).
3. Select your expertise level (Beginner, Intermediate, Expert).
4. Follow the interactive steps to analyze data, view recommended models, train a model, and generate code pipelines.
5. Use the Chat Assistant for additional questions or explanations.

## License

This project is created for the ABB EngineeredX 2.0 hackathon.
