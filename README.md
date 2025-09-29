A beginner-friendly social media web app built with plain HTML, CSS, JavaScript, and a tiny Node.js + Express backend. It shows a feed, a simple profile, lets you create posts (with random images), and like posts.

Features
- Feed: Posts with image, caption, likes, timestamp
- Profile: Basic user info and their posts grid
- Create Post: Pick a user, add a caption (random image auto-assigned)
- Like: Increment likes for a post

Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express
- IDs: uuid

Dependencies
Installed with `npm install`:
- `express` – Web server
- `uuid` – Generate unique IDs

API (Minimal)
- `GET  /api/posts`                 → All posts (feed)
- `GET  /api/users`                 → All users
- `GET  /api/users/:id`             → User by id
- `GET  /api/users/:id/posts`       → Posts for a user
- `POST /api/posts`                 → Create post (JSON: `{ userId, caption }`)
- `POST /api/posts/:id/like`        → Like a post

Notes:
- New posts use a random image from `picsum.photos` (no uploads).
- Data resets on server restart (in‑memory storage).

Using the App
- **Feed** loads by default. Click the heart to like.
- **Create** lets you select a user and add a caption; a random image is assigned.
- **Profile** shows the first user’s info and posts.

Learn From This Project
- Minimal Express server with REST endpoints
- Fetch API, DOM updates, simple state in JS
- Structuring a tiny full‑stack app