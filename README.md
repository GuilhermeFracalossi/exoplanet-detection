# Specttra: Exoplanet Detection using Machine Learning

Specttra is a full-stack web application designed to detect exoplanets from stellar light flux data. It utilizes a machine learning model to classify celestial objects as either exoplanet-hosting stars or non-exoplanet-hosting stars. The platform provides an interface for users to get predictions from a pre-trained model, and also allows for fine-tuning new models with custom datasets.

## Features

- **Exoplanet Classification:** Classify stars based on their light flux data using a pre-trained LightGBM model.
- **Model Fine-Tuning:** Upload your own dataset to train and fine-tune a new classification model.
- **Custom Model Prediction:** Use your own fine-tuned models to make predictions.
- **Interactive Dashboard:** Visualize classification results and model performance metrics.
- **Containerized Application:** Easily deployable using Docker.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend:** Python, FastAPI
- **Machine Learning:** Scikit-learn, LightGBM, Joblib, SHAP
- **Deployment:** Docker, Nginx
- **Data Analysis:** Jupyter Notebooks, Pandas

## Project Structure

```
/
├── frontend/         # React frontend application
├── specttra-api/     # FastAPI backend service for predictions and training
├── training_notebooks/ # Jupyter notebooks for data analysis and model experimentation
├── nginx/            # Nginx reverse proxy configuration
├── docker-compose.yml  # Docker orchestration for all services
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.

### Running the application

1.  Clone the repository:
    ```bash
    git clone https://github.com/GuilhermeFracalossi/exoplanet-detection.git
    cd exoplanet-detection
    ```
2.  Run the application using Docker Compose:
    ```bash
    docker-compose up -d
    ```
3.  The application will be available at `http://localhost:80`.

## Usage

- Navigate to the **Classificação** page to use the default model to classify exoplanet candidates. You can upload a CSV file with stellar data.
- Navigate to the **Fine-Tuning** page to train a new model with your own data or use a previously trained custom model for classification.

## Group

- Alan Fantin
- Guilherme Fracalossi
- Lorenzo Menegotto
- Ricardo Bregalda
- Matheus Tregnago
- Guilherme Poletti