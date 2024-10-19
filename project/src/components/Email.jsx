import React, { useState } from "react";

const EmailComponent = () => {
  const [from, setFrom] = useState("kavinmpm24@gmail.com");
  const [to, setTo] = useState("mygamil@gmail.com");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendEmail = async () => {
    const response = await fetch("http://localhost:8081/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(","),
        subject,
        body,
      }),
    });

    if (response.ok) {
      alert("Email sent!");
    } else {
      alert("Error sending email");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder="From email"
      />
      <input
        type="text"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Enter emails separated by commas"
      />
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Email body"
      />
      <button onClick={sendEmail}>Send Email</button>
    </div>
  );
};

export default EmailComponent;
