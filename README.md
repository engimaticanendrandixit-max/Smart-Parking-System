# Smart Parking System 🚗

## Overview

Smart Parking System is an IoT-based project developed using Arduino and a modern React + TypeScript frontend application. The system automates vehicle entry and exit management using RFID authentication, IR sensors, ultrasonic sensors, servo motors, and a real-time parking slot monitoring interface.

This project combines Embedded Systems, IoT, and Web Application Development to create an intelligent and efficient parking management solution.

---

## Features

### Hardware Features

* RFID-based vehicle entry authorization
* Automatic gate control using servo motors
* Entry and exit vehicle detection using IR sensors
* Ultrasonic sensor for exit confirmation
* Real-time parking slot tracking
* LCD display for available slots
* Buzzer alert system

### Application Features

* Modern React + TypeScript frontend
* Parking dashboard interface
* Slot availability visualization
* Parking reservation system
* QR scanner module
* User login & signup screens
* Parking map interface
* Responsive UI design

---

## Technologies Used

### Embedded / IoT

* Arduino Uno
* Embedded C / Arduino C++
* RFID RC522 Module
* IR Sensors
* HC-SR04 Ultrasonic Sensor
* Servo Motors
* LCD I2C Display
* Buzzer

### Frontend Application

* React
* TypeScript
* Vite
* HTML/CSS

### AI Assisted Development

* Google AI Studio
* AI-assisted frontend generation and customization

---

## Project Structure

```bash
Smart-Parking-System/
│
├── Arduino_Code/
│   └── smart_parking_system.ino
│
├── SmartParkingApp/
│   ├── components/
│   ├── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── ...
│
└── README.md
```

---

## Working Principle

### Vehicle Entry

1. User scans authorized RFID card
2. Entry gate opens automatically
3. IR sensor detects vehicle crossing
4. Entry gate closes
5. Parking slots are updated

### Vehicle Exit

1. Exit IR sensor detects vehicle
2. Exit gate opens automatically
3. Ultrasonic sensor confirms vehicle exit
4. Exit gate closes
5. Available slots increase automatically

---

## Frontend Application Modules

* Dashboard
* Parking Slot Grid
* Reservation Flow
* QR Scanner Module
* Login & Signup System
* Parking Map
* Success & Popup Views

---
## Application Usage

The Smart Parking frontend application is designed to provide users with an interactive and user-friendly parking management experience.

### Main Uses of the Application

#### User Authentication

* Users can create accounts using the Signup page
* Existing users can securely log in to access parking services

#### Dashboard Monitoring

* Real-time overview of parking slot availability
* Displays occupied and free parking spaces
* Quick access to parking controls and reservation options

#### Parking Slot Visualization

* Slot Grid module visually represents parking occupancy
* Helps users quickly identify available slots

#### Parking Reservation

* Users can reserve parking slots before arrival
* Reservation flow simplifies parking management

#### QR Scanner Integration

* QR scanner module can be used for smart vehicle verification or parking access

#### Parking Map

* Interactive parking map helps users navigate parking areas efficiently

#### Smart Notifications & Views

* Success screens and popup modals provide smooth user interaction and confirmations

#### Future Smart Integration

The application is designed to support future integration with:

* Real-time IoT hardware data
* Cloud databases
* Mobile app deployment
* Live parking analytics
* Smart payment systems

---
## Future Improvements

* Cloud database integration
* Mobile application support
* Live camera monitoring
* Number plate recognition
* Online payment integration
* Admin analytics dashboard

---

## Author

**Anendra Narayan Dixit**

---

## Acknowledgement

This project was developed as a learning and innovation project combining IoT hardware, embedded systems, and AI-assisted frontend development using Google AI Studio.
