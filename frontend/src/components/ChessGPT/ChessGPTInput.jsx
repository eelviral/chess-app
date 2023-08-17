import React, { useState } from "react";
import "./ChessGPTInput.css";
import { API_URL } from "../../config.js";

function ChessGPTInput({ currentFen }) {
  const [userTextInput, setUserTextInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleChange = (event) => {
    setUserTextInput(event.target.value);
  };

  const handleSubmit = async () => {
    const input = userTextInput;
    setUserTextInput(""); // Clear the input field

    // Handle empty message
    if (!input.trim()) {
      return;
    }

    // Append the user's message to the chat history
    setChatHistory([...chatHistory, { sender: "user", text: input }]);

    try {
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input, fen: currentFen }),
      });

      const data = await response.json();

      // Assuming the API sends back an object with a message property
      setChatHistory([
        ...chatHistory,
        { sender: "user", text: input },
        { sender: "chatGPT", text: data.message },
      ]);
    } catch (error) {
      console.error("Error fetching the response from ChatGPT:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="chatGPT-container">
      <div className="chatGPT-history">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chatGPT-message ${message.sender}`}
            data-previous-sender={
              index > 0 ? chatHistory[index - 1].sender : ""
            }
          >
            {message.text}
          </div>
        ))}
      </div>
      <input
        value={userTextInput}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        className="chatGPT-input"
        placeholder="Ask ChessGPT..."
      />
      <button onClick={handleSubmit}>SEND</button>
    </div>
  );
}

export default ChessGPTInput;
