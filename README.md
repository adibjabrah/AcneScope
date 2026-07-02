# AcneScope – Acne Detection Dashboard Using YOLOv8

## Overview

AcneScope is a web-based acne detection application that utilizes a Deep Learning model based on YOLOv8 to identify acne on facial images. The application provides an interactive dashboard that allows users to upload images and view acne detection results directly through a user-friendly interface.

This project consists of two main components:

* **Frontend**: Built using modern web technologies for user interaction and visualization.
* **Backend**: Built with Flask and YOLOv8 for image processing and acne detection.

## Features

* Upload facial images for analysis
* Camera capture and realtime video detection via browser webcam
* Automatic acne detection using YOLOv8
* Bounding box visualization on detected acne areas
* Automatic Testing History logging (original image, result image, detected classes, confidence, inference time)
* Manual validation of detection results (correct / partial / incorrect, with false positive/negative counts)
* Evaluation Dashboard with accuracy statistics and charts (pie, bar, line)
* Simple and responsive web interface
* Fast inference through Flask API integration

---

## Project Structure

```text
AcneScope/
│
├── frontend/          # Frontend application
├── backend/           # Flask API and YOLOv8 model
├── README.md
└── requirements.txt
```

---

## Technologies Used

### Frontend

* React.js
* Vite
* JavaScript
* HTML/CSS

### Backend

* Python
* Flask
* Flask-CORS
* OpenCV
* Ultralytics YOLOv8
* NumPy
* Pillow

### Deep Learning

* YOLOv8
* Roboflow Dataset

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/adibjabrah/AcneScope.git
cd AcneScope
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If requirements.txt is unavailable:

```bash
pip install flask flask-cors ultralytics opencv-python pillow numpy
```

Run the backend server:

```bash
python app.py
```

---

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

---

## Running the Application

The application requires two terminals.

### Terminal 1 – Frontend

```bash
cd frontend
npm run dev
```

### Terminal 2 – Backend

```bash
cd backend
python app.py
```

After both services are running successfully, open the URL displayed in the frontend terminal (usually `http://localhost:5173`) by holding **Ctrl** and clicking the URL.

---

## Dataset

This project uses an acne detection dataset obtained from Roboflow:

https://universe.roboflow.com/acne-project-2auvb/acne-detection-v2/dataset/2

---

## Model

The acne detection model is trained using YOLOv8 and integrated into the Flask backend for real-time inference.

---

## Future Improvements

* User authentication system
* Migrate Testing History storage from JSON file to a relational database
* Mobile-responsive interface enhancement

---

## Author

**M. Adib Al Jabrah**
**Sessy Pressilia Isabella Simanungkalit**
**Vaqieh Muwavvaq**
Informatics Engineering Student
Politeknik Caltex Riau

---

## License

This project is developed for academic and research purposes.
