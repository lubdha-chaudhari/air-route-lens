GeoSense – Traffic & Environmental Impact: Geo-Intelligence Dashboard

A real-time platform that analyzes traffic patterns, mobility data, and environmental indicators to reveal how traffic affects air pollution, fuel wastage, and emissions — with correlations, forecasts, and eco-routing powered by TomTom.

🚀 Problem Statement

Traffic & Environmental Impact: Geo-Intelligence Dashboard (Code: 304 – Hard)
Build a platform that analyzes traffic patterns and mobility data to understand how traffic affects the environment, including air pollution, noise, and fuel consumption. Visualize correlations between congestion hotspots and environmental degradation. The project can be expanded with predictive analytics, sustainable mobility planning, and clean route optimization.

💡 What GeoSense Does

GeoSense connects TomTom traffic intelligence with global AQI datasets to deliver:

Real-time AQI, traffic congestion, CO₂ emissions, and fuel wastage

Dynamic analytics for any selected location

Correlation insights between traffic and pollution

Historical AQI trends

Environmental reports with PDF export

6-hour AQI prediction

Eco-Route planning based on pollution levels

This turns raw traffic behavior into environmental intelligence that helps citizens & city planners.

🗂 Project Structure
geosense/
│
├── frontend/                 # React + Vite frontend (UI, maps, charts)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  # Python backend (FastAPI/Flask)
│   ├── app.py                # Main API entrypoint
│   ├── services/
│   │   ├── tomtom_service.py
│   │   ├── waqi_service.py
│   │   ├── openaq_service.py
│   │   └── prediction_model.py
│   ├── requirements.txt
│   └── README.md
│
└── README.md                 # Main project documentation

🔧 Tech Stack
Frontend

React + Vite

TomTom Maps SDK

Recharts / Chart.js

Axios

TailwindCSS

Backend

Python (Flask or FastAPI)

TomTom Traffic API

WAQI API

OpenAQ API

Pandas, NumPy (data processing)

Scikit-learn / statsmodels (prediction)

🌍 APIs Used
🟦 TomTom (Primary source)

Traffic Flow API

Traffic Incidents API

Routing API

Maps SDK

Used for:
✔ Congestion %
✔ Traffic speed
✔ Incident overlays
✔ Route planning
✔ Navigation + map layers

🟩 WAQI (World Air Quality Index)

Used for:
✔ Current AQI
✔ PM2.5, PM10, NO₂
✔ Real-time pollutant values

🟧 OpenAQ

Used for:
✔ 24-hour pollutant history
✔ Trends & insights
✔ Hourly AQI charts

🖥 Features (Day 1 + Day 2)
✅ Dashboard (Completed)

User's live location

AQI markers (Good / Moderate / Unhealthy)

Traffic congestion %

Fuel wastage estimate

CO₂ emission estimate

Active alerts

Location search + dynamic updates

✅ Analytics (Completed)

Location-aware dashboard

AQI 24-hour trend

Congestion vs Fuel Wastage

Traffic speed vs CO₂

Auto-generated insights

Data from WAQI, OpenAQ & TomTom

🔄 EcoReport (In Progress)

Real-time AQI

Monthly summary

Correlation insights

Pollution hotspots

Recommendations

PDF export

🔮 Prediction (In Progress)

6-hour AQI forecast

Predicted alerts

Trend visualization

🛣 EcoRoute (In Progress)

Cleanest route

Traffic-aware AQI scoring

Emission-optimized routing

🏁 Getting Started
▶️ 1. Clone the repository
git clone https://github.com/your-username/geosense.git
cd geosense

🔧 Backend Setup (Python)

Navigate into the backend folder:

cd backend

📦 Install dependencies:
pip install -r requirements.txt

▶ Run the backend:
python app.py


Your backend will start at:
http://localhost:5000

(or whichever port your app uses)

🎨 Frontend Setup (React + Vite)

Navigate to frontend folder:

cd frontend

📦 Install dependencies:
npm install

▶ Run the development server:
npm run dev


Your frontend will start at:
http://localhost:5173

🔌 Connecting Frontend & Backend

In /frontend/src/utils/api.js (or equivalent):

export const BASE_URL = "http://localhost:5000";

🧪 Testing the APIs

Once backend is running, test endpoints:

Current AQI
GET /aqi?location=Bangalore

Traffic Congestion
GET /traffic?lat=12.9&lon=77.6

Analytics
GET /analytics?lat=...&lon=...

Prediction
GET /predict?lat=...&lon=...


If these return JSON, your setup is correct.

📊 Screenshots (Add once ready)
📸 Dashboard Preview  
📸 Analytics Page  
📸 EcoReport  
📸 EcoRoute  

🧭 Future Enhancements

Hotspot detection

Noise-level integration

City planning simulation

Time-series model upgrade (LSTM / XGBoost)

Real-time push notifications

🤝 Contributors

Team GeoSense
Lubdha Chaudhari
Nikita Salunke
Nirwani Adhau
Sanika Pawar
Sneha Khatave
