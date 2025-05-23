# Node.js Real-Time Chat Application

## About This Project

This is a basic real-time chat application built using Node.js, Express, and Socket.IO. It was developed primarily as a learning exercise to explore and solidify understanding of:

*   Server-side JavaScript with Node.js.
*   Building web applications with the Express framework.
*   Real-time, bi-directional communication using WebSockets via Socket.IO.
*   Fundamental programming logic for handling users, rooms, and messages.
*   Basic input sanitization and profanity filtering.

**Important Note:** This application is intended for educational and demonstration purposes only. It is a project to test programming logic and skills and is **not designed or recommended for real-life deployment or production use.**

## How It Works

The application follows a client-server model:

1.  **Server (`src/index.js`):**
    *   An **Express.js** server is set up to handle HTTP requests and serve the static client-side files (HTML, CSS, JavaScript from the `public` directory).
    *   **Socket.IO** is integrated with the HTTP server to enable WebSocket connections. WebSockets allow for persistent, two-way communication channels between the server and connected clients.
    *   When a new client connects:
        *   The server listens for a `join` event, where the client provides a username and room name.
        *   The user is added to the specified room (using helper functions in `src/utils/users.js`).
        *   A welcome message is sent to the joining user.
        *   A notification is broadcast to all other users in the room that a new user has joined.
        *   The updated list of users in the room is sent to all clients in that room.
    *   When a client sends a `sendMessage` event:
        *   The server retrieves the user's details.
        *   The message is trimmed and checked for profanity using the `bad-words` filter.
        *   If profane, a warning is sent back to the sender.
        *   Otherwise, the message (formatted by `src/utils/messages.js`) is broadcast to all users in the sender's room.
    *   When a client disconnects:
        *   The user is removed from their room.
        *   A notification is broadcast to the remaining users in the room.
        *   The updated user list is sent to the room.
    *   The server includes logging for connections, disconnections, join events, and messages for easier debugging and understanding the flow.

2.  **Client (Browser - files in `public/` folder):**
    *   The client-side HTML (`index.html`) provides the user interface for joining a room and chatting.
    *   Client-side JavaScript (`js/chat.js` - *you would typically have this file*) handles:
        *   Establishing a WebSocket connection to the server using Socket.IO.
        *   Emitting `join` events with the username and room.
        *   Emitting `sendMessage` events when the user sends a message.
        *   Listening for `message` events from the server to display new chat messages.
        *   Listening for `roomData` events to update the list of users in the room.

## File Structure and Roles

node-chat/ ├── public/ │ ├── index.html │ ├── css/ │ │ └── styles.css │ └── js/ │ └── chat.js ├── src/ │ ├── utils/ │ │ ├── messages.js │ │ └── users.js │ └── index.js ├── .gitignore ├── package-lock.json ├── package.json └── README.md

*   **`package.json`**: Defines project metadata, dependencies (like `express`, `socket.io`, `bad-words`), and scripts (e.g., `npm start`).
*   **`package-lock.json`**: Records the exact versions of installed dependencies, ensuring consistent setups.
*   **`src/`**: Contains the core server-side application logic.
    *   **`index.js`**: The main entry point for the server. It sets up Express, Socket.IO, and handles all WebSocket event logic (connections, joining rooms, message broadcasting, disconnections).
    *   **`utils/`**: Utility modules to help keep `index.js` cleaner.
        *   **`messages.js`**: Contains a function (`generateMessage`) to format chat messages, typically adding a username and timestamp.
        *   **`users.js`**: Manages user state – adding users to rooms, removing them, fetching user details, and getting a list of users in a specific room.
*   **`public/`**: Contains all static assets served to the client's browser.
    *   `index.html` (typically): The main HTML page for the chat interface.
    *   `css/styles.css` (typically): CSS rules for styling the chat interface.
    *   `js/chat.js` (typically): Client-side JavaScript to interact with the server via Socket.IO and manage the UI.

## Getting Started

Follow these steps to get the chat application running on your local machine.

**Prerequisites:**

*   **Node.js and npm:** Ensure you have Node.js installed. npm (Node Package Manager) comes bundled with Node.js. You can download it from nodejs.org.

**Installation & Setup:**

1.  **Clone or Download the Repository:**
    *   If you have Git: `git clone <repository-url>`
    *   Otherwise, download the ZIP file and extract it.

2.  **Navigate to the Project Directory:**
    Open your terminal or command prompt and change to the project's root directory:
    ```bash
    cd path/to/node-chat
    ```

3.  **Install Dependencies:**
    Run the following command to install all the necessary packages listed in `package.json`:
    ```bash
    npm install
    ```

**Running the Application:**

1.  **Start the Server:**
    Execute the start script (defined in `package.json`):
    ```bash
    npm start
    ```
    You should see a message in your terminal, like: `Server is listening on port 3000`.

2.  **Access the Chat in Your Browser:**
    Open your web browser and go to:
    ```
    http://localhost:3000
    ```

3.  **Using the Chat:**
    *   Enter a **Display Name** and a **Room** name.
    *   Click "Join".
    *   You can now send and receive messages in that room.
    *   To chat with others (or simulate it), open another browser tab/window, navigate to `http://localhost:3000`, and join the **same room name** with a different display name.

## Stopping the Server

To stop the server, go back to the terminal window where it's running and press `Ctrl + C`.

---

This project provides a good foundation for understanding how real-time web applications can be built. Feel free to explore the code, experiment with changes, and expand upon its features!
```
