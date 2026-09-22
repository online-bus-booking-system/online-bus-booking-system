# 🚌 BusLink – Online Bus Booking System

BusLink is a full-stack online bus booking platform designed to provide an end-to-end bus reservation experience similar to modern bus booking applications.

The system consists of a **React frontend**, a **Java Spring Boot backend**, a **MySQL database**, and a separate **Python-based RAG chatbot service** for answering user queries from BusLink policy and informational documents.

## 🚀 Key Features

### 👤 User & Authentication

* User registration and login
* JWT-based authentication
* Role-based access control
* Customer, Operator, and Admin roles
* Secure password hashing using BCrypt
* Protected REST APIs using Spring Security

### 🚌 Bus & Operator Management

* Operator registration and approval workflow
* Operator document management
* Bus registration and fleet management
* Bus details such as bus type, seat layout, Wi-Fi and charging facilities

### 🗺️ Route & Trip Management

* Route creation and management
* Ordered boarding and dropping points
* Trip scheduling
* Trip search based on source, destination and travel date
* Fare management
* Trip status and occupancy tracking

### 💺 Seat Booking

* Seat layout and seat availability
* Individual seat selection
* Multi-passenger booking
* Booking for both registered users and guest users
* Backend-controlled seat availability
* Transactional booking flow to maintain data consistency

### 🎫 Booking & Cancellation

* Unique PNR generation
* Booking history
* Ticket details
* Booking cancellation
* Refund workflow using mock payment processing
* Revenue calculation after cancellations

### 💳 Mock Payment

BusLink currently includes a **mock payment flow** to simulate the payment process during booking.

The implementation is intended for project demonstration and development purposes and does not connect to a real payment gateway.

### 🤖 AI-Powered RAG Chatbot

BusLink includes a separate Python-based RAG chatbot service that helps users get answers to questions related to BusLink policies and other supported documents.

The chatbot uses:

* FastAPI
* Retrieval-Augmented Generation (RAG)
* ChromaDB vector store
* Document embeddings
* LLM-based response generation

The service retrieves relevant document content before generating an answer, helping the chatbot respond based on the available BusLink knowledge base.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend   │
                    │       (Client)       │
                    └──────────┬──────────┘
                               │ HTTP / REST
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │      (Backend)      │
                    ├─────────────────────┤
                    │ Spring Security     │
                    │ JWT Authentication  │
                    │ REST APIs           │
                    │ Spring Data JPA     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │        MySQL        │
                    │      Database       │
                    └─────────────────────┘

                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │ Python RAG Chatbot  │
                    │      FastAPI        │
                    ├─────────────────────┤
                    │ Document Retrieval  │
                    │ ChromaDB            │
                    │ LLM Response        │
                    └─────────────────────┘
```

The main application uses a **Spring Boot backend with MySQL**, while the AI chatbot is implemented as a separate Python service.

---

## 🛠️ Technology Stack

| Layer             | Technologies                   |
| ----------------- | ------------------------------ |
| Frontend          | React, JavaScript, HTML, CSS   |
| Backend           | Java, Spring Boot              |
| Security          | Spring Security, JWT           |
| Persistence       | Spring Data JPA, Hibernate     |
| Database          | MySQL                          |
| API Documentation | Swagger / OpenAPI              |
| AI Service        | Python, FastAPI                |
| RAG               | Retrieval-Augmented Generation |
| Vector Database   | ChromaDB                       |
| Testing           | JUnit 5, Mockito               |
| Version Control   | Git, GitHub                    |

---

## 🔐 Security

The backend uses **Spring Security with JWT-based authentication and role-based authorization**.

The authentication flow includes:

1. User submits login credentials.
2. Spring Security authenticates the user.
3. A JWT is generated after successful authentication.
4. The client sends the JWT with subsequent requests.
5. A custom JWT filter validates the token.
6. The authenticated user and authorities are stored in the Spring Security context.
7. Authorization rules determine whether the user can access the requested resource.

Different application roles have access to different operations.

---

## 💡 Handling Seat Booking Correctly

One of the important backend challenges in BusLink was maintaining correct seat availability when multiple requests can occur at the same time.

The frontend seat state is treated only as **display information**. The backend and database remain the source of truth for whether a seat can actually be booked.

The booking flow uses transactional backend processing so that seat availability and booking information remain consistent.

This helps prevent problems such as two users attempting to reserve the same seat simultaneously.

---

## 🗄️ Database

The application uses MySQL with Hibernate/JPA for persistence.

The domain model includes entities covering areas such as:

* Users and roles
* Operators and documents
* Buses and bus documents
* Routes and boarding/dropping points
* Trips and trip seats
* Bookings and passengers
* Payments
* Cancellations and refunds

The database design supports both customer and operator workflows as well as administrative operations.

---

## 📡 Backend APIs

The Spring Boot backend exposes REST APIs for application functionality including:

* Authentication
* User management
* Operator management
* Bus management
* Route management
* Trip management
* Seat availability
* Booking
* Cancellation
* Mock payment processing
* Administrative operations

API documentation can be explored through Swagger/OpenAPI when the backend is running.

```text
http://localhost:8080/swagger-ui/index.html
```

---

## 🤖 RAG Chatbot Flow

The chatbot follows a retrieval-augmented generation workflow:

```text
User Question
      │
      ▼
Document Retrieval
      │
      ▼
Relevant Chunks
      │
      ▼
LLM + Retrieved Context
      │
      ▼
Generated Answer
```

BusLink policy and informational documents are processed, converted into embeddings, and stored in ChromaDB. When a user asks a question, relevant content is retrieved and provided as context for answer generation.

---

## 📁 Repository Structure

```text
online-bus-booking-system/
│
├── backend/          # Spring Boot backend
│
├── frontend/         # React frontend
│
├── rag-chatbot/      # Python FastAPI RAG chatbot
│
├── .gitignore
└── README.md
```

---

## ▶️ Running the Project

### Backend

Navigate to the backend directory and configure the MySQL database and application properties.

```bash
cd backend
```

Run the Spring Boot application using Maven.

```bash
./mvnw spring-boot:run
```

The backend will be available at:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

### Frontend

Navigate to the frontend directory, install dependencies and start the React application.

```bash
cd frontend
npm install
npm start
```

### RAG Chatbot

Navigate to the chatbot directory, create the required Python environment, install dependencies, configure the required API credentials, and start the FastAPI service.

Refer to the `rag-chatbot` directory for the service-specific configuration.

---

## 👨‍💻 Project Contribution

This project was developed collaboratively as a team project.

My primary contribution was focused on **backend development**, including:

* Spring Boot REST API development
* Spring Security and JWT authentication
* Role-based authorization
* JPA/Hibernate persistence
* MySQL database integration
* Trip and booking functionality
* Seat availability and booking logic
* Booking cancellation workflows
* Integration with the React frontend
* Integration with the separate RAG chatbot service

---

## 📌 Learning & Engineering Highlights

Through this project, I gained hands-on experience with:

* Designing RESTful APIs
* Spring Boot application development
* Authentication and authorization using Spring Security
* JWT-based stateless authentication
* ORM using JPA and Hibernate
* Relational database design with MySQL
* Transaction management and concurrency considerations
* Frontend-backend integration
* Building and integrating an AI/RAG service
* Git and collaborative team development

---

## 📄 License

This project was developed as an educational/team project as part of the CDAC Postgraduate Certificate Programme in Advanced Computing.
