import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000");

function App() {
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("sales"); // Example department
  const [departments, setDepartments] = useState(["sales", "hr", "it"]); // Example departments

  useEffect(() => {
    // Join the department room
    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveNotification");
    };
  }, []);

  const joinDepartment = (dept) => {
    socket.emit("joinDepartment", dept);
    setDepartment(dept);
  };

  const leaveDepartment = (dept) => {
    socket.emit("leaveDepartment", dept);
    setDepartment("");
  };

  const sendNotification = () => {
    if (department) {
      const data = { department, message };
      socket.emit("sendNotification", data);
      setMessage("");
    } else {
      alert("Please join a department first.");
    }
  };

  return (
    <div>
      <h1>Admin Notification System</h1>
      <div>
        <h2>Departments</h2>
        {departments.map((dept) => (
          <button key={dept} onClick={() => joinDepartment(dept)}>
            Join {dept}
          </button>
        ))}
        {department && (
          <button onClick={() => leaveDepartment(department)}>
            Leave {department}
          </button>
        )}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter notification message"
      />
      <button onClick={sendNotification}>Send Notification</button>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
