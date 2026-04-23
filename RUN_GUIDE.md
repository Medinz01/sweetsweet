# SweetSweet Project: Execution Guide

This guide provides step-by-step instructions to set up the environment, run the production build, and execute the full E2E test suite.

## Prerequisites
- Docker Desktop (Running)
- Node.js (v20+)
- VNC Viewer (Optional, or use browser at port 7900)

---

## Phase 1: Environment Setup

### 1. Start Infrastructure Containers
Start the database and Selenium containers using Docker Compose:
```bash
docker-compose up -d
```
*This starts MySQL, MongoDB, Redis, Postgres, and the Selenium Chrome Standalone container.*

### 2. Verify Containers are Running
```bash
docker ps
```
Ensure `sweetsweet_selenium` and the database containers are `Up`.

---

## Phase 2: Application Setup

### 3. Build the Application (Production)
Generate the optimized production build for maximum performance:
```bash
npm run build
```

### 4. Seed the Database
Initialize the database with test data (Users, Products, Orders):
```bash
npm run seed
```

### 5. Start the Production Server
Launch the application on port 3006:
```bash
npm run start
```
*Note: If you already have a process on port 3006, you must stop it first.*

---

## Phase 3: Testing & Presentation

### 6. Open the Visual Test Monitor
To watch the tests running in real-time, open your browser to:
**[http://localhost:7900](http://localhost:7900)**
*(Click "Connect" to view the Selenium desktop)*

### 7. Run End-to-End Tests
Execute the full suite sequentially:
```bash
npm run test:e2e
```
*Watch the Chrome window appear in the VNC monitor. The tests will perform the following:*
- *Seller registration & product management*
- *Buyer shopping & checkout lifecycle*
- *Negative security flows (invalid login, etc.)*

---

## Phase 4: Teardown

### 8. Stop the Application
Press `Ctrl+C` in the terminal where `npm run start` is running.

### 9. Stop Infrastructure Containers
```bash
docker-compose down
```

---

## Summary of Ports
- **App:** [http://localhost:3006](http://localhost:3006)
- **Selenium VNC:** [http://localhost:7900](http://localhost:7900)
- **Selenium Hub:** [http://localhost:4444](http://localhost:4444)
