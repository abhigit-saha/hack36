# CareConnect AI: AI-Driven Remote Rehabilitation & Health Support System

**CareConnect AI** is an intelligent, hybrid healthcare platform designed to support patients **post-treatment** through AI-powered physiotherapy, real-time monitoring, voice-enabled symptom analysis, and smart doctor recommendations. Whether recovering from an injury or managing chronic pain, patients can now access guided rehab and doctor consultations from the comfort of their homes.

---

## ⚠️ Problem

- Post-treatment care is often neglected due to lack of access to physiotherapists or doctors, especially in rural or semi-urban areas.
- Patients tend to skip or incorrectly perform prescribed exercises, leading to delayed or improper recovery.
- In-person follow-up visits are costly, time-consuming, and sometimes unnecessary if early monitoring and alerts are available.
- There is a lack of affordable, patient-friendly tech for home-based rehabilitation that’s accurate and easy to use.

---

## ✅ Our Solution

- **AI-Powered Webcam Rehab:** Uses BlazePose to track joint movements via webcam and guide the patient with instant feedback.
- **Hardware Integration:** ESP32 with MPU6050 sensors accurately track joint angles in real-time to enhance precision.
- **Voice-Enabled Symptom Input:** Patients can describe their problems in natural language — **Gemini AI** interprets the input and recommends suitable doctors or treatment paths.
- **Automated Report Generation:** Each rehab session produces a structured report with progress analytics and correction history.
- **Doctor Dashboard:** Allows remote monitoring of patient rehab and test reports, enabling data-driven decisions and reduced follow-up load.
- **Real-Time Feedback Loop:** Using WebSockets and sensors, patients get live guidance — just like a personal physio session.

---

## 🧠 Tech Stack

### Frontend
- **Next.js** (React Framework)
- **BlazePose** (Google’s ML Pose Estimation)
- **Web Speech API** (Voice input)
- **TailwindCSS** (UI Styling)

### Backend
- **Node.js** with **Express.js**
- **JWT Authentication**
- **Gemini AI** (for symptom understanding, doctor matching, and report summarization)
- **Socket.IO** (Real-time sensor communication)
- **MongoDB** (Patient data, reports, and doctor records)

### Hardware
- **ESP32** Microcontroller
- **MPU6050** Gyroscope + Accelerometer
- **Arduino IDE** (Firmware programming)

---

## 🔮 Future Integrations

- EHR system integration for centralized medical records  
- Video call functionality for remote consultations  
- Multilingual voice assistants for broader accessibility  
- Wearable support for vitals tracking (heart rate, SpO2, etc.)  
- Blockchain-based health data storage  
- Gamified rehab experience for motivation  
- Smart alert system for doctors based on patient deviation

---

## 🎥 Demo Video

[Watch Demo](https://drive.google.com/drive/folders/1_ng2SGyAWnSGlaXBHQfELox7VwHTDfdJ?usp=drive_link)

---

## 📊 Presentation

[Click to View PPT](#) *(https://www.canva.com/design/DAGlIsY3brI/StDXKbf6dBfm88C0dxMBQQ/edit?utm_content=DAGlIsY3brI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)*

---

## ✨ Wow Factor

- Combines **computer vision + sensors** for maximum rehab accuracy
- Provides **real-time correction** and **progress reports**
- Uses **Gemini AI** to **understand natural language** and **recommend doctors/tests**
- Addresses a **rarely focused** space — **post-treatment rehabilitation**
- Built for **home use**, but smart enough for clinical monitoring

---

## 👨‍💻 Contributors

**Team Name:** *Cavalcades*

- **Abhijit Saha**
- **Vatsal Kumar**
- **Ayush Tiwari**
- **Chandan Yadav**

---

> “We built a system to heal others — now we just need some sleep ourselves!”  
> – Team Cavalcades, live from the hackathon trenches

---
