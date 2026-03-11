# FullStack-Chat-App

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO, designed to deliver a secure and dynamic messaging experience with a modern, responsive UI.

## **Features**

### **Frontend**
- **React & Tailwind CSS:** Fully responsive and clean UI for an optimal user experience on all devices.
- **State Management:** Zustand for efficient and lightweight state management.
- **Theming:** DaisyUI integration with 30+ themes, stored in local storage for persistence.
- **Skeleton Loaders:** Enhanced loading experience with smooth transitions.
- **Notifications:** React Hot Toast for real-time notifications.
- **Socket.IO Client:** Real-time updates for messaging and user activity indicators.

### **Backend**
- **Authentication:**
  - JSON Web Tokens (JWT) for secure authentication, stored in cookies with a 7-day expiry.
  - Expiration handling for enhanced security.
- **Database:** MongoDB and Mongoose for data modeling and storage.
- **Data Security:** Passwords hashed using bcrypt following best practices.
- **File Storage:** Cloudinary for uploading and retrieving images.
- **Real-Time Communication:** Socket.IO for real-time chat functionality.
- **REST API:** Built with Express.js for robust backend functionality.

### **Key Functionalities**
1. **Authentication:**
   - Secure login and registration.
2. **Home Screen:**
   - Displays all registered users in a sidebar with live activity indicators (online/offline).
3. **Chat:**
   - Real-time messaging with support for text, images, or both.
4. **Profile Section:**
   - View profile details, update profile picture (instantly updated via Cloudinary).
5. **Settings:**
   - Choose from 30+ themes to customize the UI experience.
6. **Sidebar Toggle:**
   - Filter to show only online users.

## **Tech Stack**

### **Frontend**
- React
- Tailwind CSS
- DaisyUI
- Zustand
- Axios
- React Hot Toast
- Socket.IO Client

### **Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JSON Web Tokens (JWT)
- Bcrypt
- Cloudinary

## **Installation & Setup**

### **Prerequisites**
- Node.js and npm installed
- MongoDB running locally or a MongoDB Atlas connection string

### **Clone the Repository**
```bash
git clone https://github.com/trchitho/FullStack-Chat-App.git
cd FullStack-Chat-App
```

### **Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/chatapp
JWT_SECRET=supersecret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Frontend Setup**
```bash
cd frontend
npm install
```

### **Run the Application**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## How to Use
1) Register or log in to the app.
2) View users on the sidebar with live status indicators.
3) Click a user to start chatting in real-time.
4) Access settings to personalize the theme and profile to manage your details.

## Demo

### Login
![Home Page](demo/Screenshot%202026-03-11%20095129.png)

### Home  
![Profile Page](demo/Screenshot%202026-03-11%20095531.png)

### Settings
![Settings Page](demo/Screenshot%202026-03-11%20095554.png)

### Profile
![Signup Page](demo/Screenshot%202026-03-11%20095602.png)

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## Acknowledgments
- Cloudinary for image storage
- DaisyUI for themes
- Socket.IO for real-time communication


