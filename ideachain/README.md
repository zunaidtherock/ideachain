# IdeaChain - Idea Ownership & Collaboration Platform

IdeaChain is a full-stack Web Application where users can submit their ideas safely. The platform leverages AI Similarity Analysis using TF-IDF and Cosine Similarity to compare incoming idea descriptions against all existing ones to determine if it's a unique idea or highly similar to another. Also includes a Collaboration Portal for networking and team recruitment.

## Features
- **JWT Authentication**: Secure user registration and login.
- **Glassmorphism UI**: Beautiful, clean, responsive vanilla HTML/CSS frontend.
- **AI Idea Originality Validation**: Built-in TF-IDF NLP model checks for percentage similarity against all existing ideas in the SQLite Database and identifies Risk levels.
- **Cryptographic Timestamping (Conceptual)**: Ideas are saved with the exact UTC timestamp.
- **Collaboration & Recruitment Portal**: Send requests to other innovators or post recruitment calls.
- **In-App Notifications**: Real-time broadcast for recruitments and collab requests.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite, Scikit-learn (for TF-IDF API), JWT (python-jose), Passlib (bcrypt).
- **Frontend:** Vanilla HTML, CSS, JavaScript (Fetch API).

## Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Windows PowerShell (or any terminal)

### 2. Install Dependencies Globally
Open your terminal inside the `ideachain` folder and install the required packages:

```powershell
pip install -r requirements.txt
```

### 3. Run the Application
Start the Uvicorn ASGI server natively in the folder:
```powershell
uvicorn main:app --reload
```

### 5. Open the Frontend
Visit the main application URL in your web browser:
**[http://localhost:8000/](http://localhost:8000/)**

For interactive API documentation, visit:
**[http://localhost:8000/docs](http://localhost:8000/docs)**
