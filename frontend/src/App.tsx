import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000");

function App() {
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("receiveNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, []);

  const sendNotification = () => {
    const data = { department: "non-admin", message };
    socket.emit("sendNotification", data);
    setMessage("");
  };

  return (
    <div>
      <h1>Admin Notification System</h1>
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
