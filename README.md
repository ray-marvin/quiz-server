# Real-Time Quiz Game Backend
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://quiz-server-vbvm.onrender.com)

This project is a **real-time quiz game backend** where two players compete against each other.  
Each player answers the **same 6 questions** independently, and the player with the highest score wins.

---

## **Tech Stack**

- **Node.js** + **Express.js** (Backend)
- **MongoDB** (Database)
- **Socket.IO** (Real-time communication)
- **Docker** (Containerization)
- **Kubernetes** + **Minikube** + **Render** (Deployment)

---

## **Features**

- Two-player match making
- Real-time quiz gameplay
- Score calculation
- Dockerized setup
- Kubernetes deployment ready
- Deployed on Render (**LIVE**)

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

### **3. Environment Variables**

Create a .env file in the root directory with below secrets

**For Local**

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/quizgame
JWT_SECRET=yourSuperSecretKey123
```

**For Docker**

```bash
PORT=3000
MONGO_URI=mongodb://mongo:27017/quizgame
JWT_SECRET=yourSuperSecretKey123
```

**For Minikube**

```bash
PORT=3000
MONGO_URI=mongodb://mongo-service:27017/quizgame
JWT_SECRET=yourSuperSecretKey123
```

**For current production deploy in Render (connected to mongodb Atlas)**

```bash
PORT=3000
MONGO_URI=mongodb+srv://ray:ray@testing.bf2atqa.mongodb.net/?retryWrites=true&w=majority&appName=Testing
JWT_SECRET=yourSuperSecretKey123
```

### **4. Setup database and seed sample questions**

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

For sample register and later login (can register with a new email & password and proceed)

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

Go to src/kube/server.yaml
```bash
image: <your-docker-username>/quiz-server:latest  # Replace with your Docker Hub username
```
Run these commands

```bash
minikube start
docker login
docker build -t <your-docker-username>/quiz-server:latest .
docker push <your-docker-username>/quiz-server:latest

kubectl delete secret quiz-server-env || true
kubectl create secret generic quiz-server-env --from-env-file=.env

kubectl apply -f src/kube/mongo.yaml
kubectl apply -f src/kube/server.yaml
```

To check pods and services status after applying both server and mongo manifests

```bash
kubectl get pods
kubectl get services
```

To run quiz-server service on minikube

```bash
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

- Github code base deployed on Render and database connected to mongodb Atlas

- Live Demo URL -- https://quiz-server-vbvm.onrender.com
