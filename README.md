# MessageBoard

A full-stack web messaging application built with HTML, CSS, vanilla JavaScript, and Node.js/Express.

## Features

- Post messages with a username
- Browse all messages in real time
- Delete individual messages
- Light / dark theme toggle
- Configurable server URL — point the UI at any compatible back-end

---

## Project Structure

```
messageboard/
├── index.js          ← Node.js / Express server
├── package.json      ← dependencies
└── public/
    ├── index.html    ← page structure
    ├── style.css     ← styling
    └── script.js     ← client-side logic (AJAX, DOM)
```

---

## Running Locally

**Prerequisites:** Node.js installed ([nodejs.org](https://nodejs.org))

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## API Routes

| Route | Description |
|---|---|
| `GET /msg/getAll` | Returns all messages |
| `GET /msg/get/:id` | Returns a single message by ID |
| `GET /msg/post/:text?pseudo=:name` | Posts a new message |
| `GET /msg/del/:id` | Deletes a message |
| `GET /msg/nber` | Returns the number of messages |
| `GET /cpt/query` | Returns the current counter value |
| `GET /cpt/inc` | Increments the counter by 1 |
| `GET /cpt/inc?v=N` | Increments the counter by N |

---
