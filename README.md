# Real-Time Quiz Game Backend

This project is a **real-time quiz game backend** where two players compete against each other.  
Each player answers the **same 6 questions** independently, and the player with the highest score wins.

---

## **Tech Stack**
- **Node.js** + **Express.js** (Backend)
- **MongoDB** (Database)
- **Socket.IO** (Real-time communication)
- **Docker** (Containerization)
- **Kubernetes** + **Minikube** (Deployment)

---

## **Features**
- Two-player match making
- Real-time quiz gameplay
- Score calculation
- Dockerized setup
- Kubernetes deployment ready

---

## **Local Setup**

### **1. Clone the Repository**
```bash
git clone https://github.com/ray-marvin/quiz-server.git
cd quiz-server
```

### **2. Install Dependencies**
```bash
npm install
```

### **2. Environment Variables**
Create a .env file in the root directory:
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/quizgame
JWT_SECRET=yourSuperSecretKey123
```
### **3. Setup database and seed sample questions**
Open terminal and create a database called **quizgame**
```bash
mongosh
use quizgame

```
Seed sample questions into db from scripts folder
```bash
node src/scripts/populateQuestions.js

```

## **APIs Endpoints**

1. Register a new user
```bash 
POST /auth/register
``` 

2. Login and receive JWT token
```bash
POST /auth/login
```
2. Start quiz game (will start when 2nd player joins)

```bash
POST /game/start
```

## **Test User Credentials**
For sample register and login (can register and login with any email & password)
```bash 
{
  "email": "testuser@example.com",
  "password": "Test@1234"
}
``` 

## **Run Locally**
```bash
npm start
```
## **With Docker**
```bash
docker-compose up
```

## **With Minikube (Kubernetes)**
```bash
kubectl apply -f src/kube/mongo.yaml
kubectl apply -f src/kube/server.yaml
minikube service quiz-server-service

```
## **Project Structure**
```bash
├──src/
    ├── controllers/
    ├── kube/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    ├── sockets/
├──server.js

```
## **Deployment**

- Dockerfile and docker-compose.yaml included

- Kubernetes manifests in src/kube