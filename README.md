*This project has been created as part of the 42 curriculum by mbiagi, lparolis, edraccan, alerusso, mfanelli*

# ft_transcendence <img src="https://42cv.dev/api/badge/cmocr0rwf00040ko9gjxazgmo/project/5017350" align="right"/>

## Description

***ft_transcendence*** is a project that reinterprets traditional chess, expanding its basic logic: each piece has a unique special ability, which can be activated by spending skill points earned by capturing opposing pieces during the game. This introduces an additional level of strategy compared to classical chess, where the player must balance traditional moves with the tactical use of special abilities.

The project is set in a dark fantasy aesthetic, with an original character/piece design that reinforces the game's visual identity.

### Goals

- Offer a renewed and more dynamic chess experience, maintaining familiar ground rules but introducing mechanics that reward tactical aggression and long-term planning.
- Allow real-time multiplayer matches between remote users, with reconnection management.
- Offer a elo system and leaderboards, to give players long-term goals beyond a single game.
- Build a comprehensive infrastructure (secure authentication, user profiles, friendship system, real-time notifications) that makes ChessZ a true gaming platform.
- Apply full-stack development skills, containerized infrastructure management, and structured teamwork to a real-world project.

## Instructions

The following requirements are required to get the project started:
- **Docker** (recent version, compatible with compose v2)
- **Docker Compose** (not the docker-compose version)
- **Git** (to clone the repo locally)
- **Internet connection** (for downloading Docker images on first launch and cloning repo)
- **Make** (recommended, so you don't have to run docker compose commands manually)
- Free port **8000** on the host
- **.env file** (configured from *env.example* file)

**Note:** *Node.js*, *PostgreSQL*, *Redis*, or other locally installed runtimes are not required — everything runs containerized via *Docker Compose*.

Start all containers in the background:
```bash
make
```

Stops all containers:
```bash
make down
```

View running containers:
```bash
docker ps
```

Accessing a container:
```bash
docker exec -it <container_name> sh     # bash is not installed
```

Reading logs from a container:
```bash
docker logs <container_name>
```

## Resources
For this project, we have used the following resources:

### Backend
- [Esercizi Javascript](https://github.com/AlbertoOlla/esercizi-di-programmazione-javascript "github.com/AlbertoOlla/esercizi-di-programmazione-javascript")
- [Javascript tutorial w3school](https://www.w3schools.com/js/ "Javascript tutorial w3school")
- [Socket.io docs](https://socket.io/docs/v4/ "Socket.io docs")
- [Web Socket](https://www.youtube.com/watch?v=pnj3Jbho5Ck "How WebSocket work")

### AI
- [Minimax and alpha-beta pruning](https://www.youtube.com/watch?v=l-hh51ncgDI "Minimax and alpha-beta pruning")
- [Zobrist hash](https://youtu.be/QYNRvMolN20?is=TnUvxDBb8HBCAOBB "Zobrist hash")

### Database
- [Prisma ORM docs](https://www.prisma.io/docs/orm "Prisma ORM docs")

### Frontend
- [Vue Components](https://vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats "Vue Components")
  - [Vue Component Registration](https://vuejs.org/guide/components/registration.html "Vue Component Registration")
  - [Vue Components Props](https://vuejs.org/guide/components/props.html "Vue Components Props")
  - [Vue Component Slots](https://vuejs.org/guide/components/slots.html "Vue Component Slots")
  - [Vue Components Event](https://vuejs.org/guide/components/events.html "Vue Components Event")
- [Vue v-for](https://it.vuejs.org/api/built-in-directives.html#v-for "Vue v-for")
- [Vue v-bind](https://it.vuejs.org/api/built-in-directives.html#v-bind "Vue v-bind")
- [Vue Style Guide](https://vuejs.org/style-guide/ "Vue Style Guide")
- [Vue Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html "Vue Reactivity Fundamentals")
  - [Vue Computed Properties](https://vuejs.org/guide/essentials/computed.html "Vue Computed Properties")
  - [Vue Lifecycle Hooks](https://vuejs.org/guide/essentials/lifecycle.html "Vue Lifecycle Hooks")
  - [Vue Teleport](https://vuejs.org/guide/built-ins/teleport.html "Vue Teleport")
- [Vue Router](https://router.vuejs.org/guide/ "Vue Router")
- [Pinia](https://pinia.vuejs.org/core-concepts/ "Pinia")
- [Vue I18n](https://vue-i18n.intlify.dev/guide/ "Vue I18n")
- [Socket.IO client API](https://socket.io/docs/v4/client-api/ "Socket.IO client API")
- [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API "MDN - HTML Drag and Drop API")
  - [DataTransfer.setDragImage()](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage "MDN - DataTransfer.setDragImage()")
- [HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement "MDN - HTMLAudioElement")
- [Window.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage "MDN - Window.sessionStorage")
- [Floating UI](https://floating-ui.com/docs/computePosition "Floating UI")
- [Tailwind docs](https://tailwindcss.com/docs/installation/using-vite "Tailwind docs")

### Infrastructure & Deployment
- [HashiCorp Vault docs](https://developer.hashicorp.com/vault/docs/configuration "HashiCorp Vault docs")
- [HashiCorp CoreRule Set](https://owasp.org/www-project-modsecurity-core-rule-set/ "HashiCorp CoreRule Set")
- [Nginx configuration](https://projects.intra.42.fr/projects/inception "42 Project Inception")
- [ModSecurity WAF](https://www.getpagespeed.com/server-setup/nginx/install-modsecurity-nginx-linux "ModSecurity WAF")
- [Docker](https://youtu.be/3c-iBn73dDE?si=GZAfuvLYFyp2kX4Z "Docker from zero")

## Team Information

| Intra   | Roles | Responsibilities |
|-|-|-|
| **mfanelli** | Project Manager + Developer | Coordinates the team, organizes meetings and planning, tracks progress and deadlines, manages risks and blocks; develops assigned features. |
| **mbiagi** | Product Owner + Developer | Defines the product vision, manages the backlog and priorities, validates completed work, serves as a reference for evaluators/peers; develops assigned features. |
| **edraccan** | Technical Lead / Architect + Developer | Defines the technical architecture, chooses the technology stack, ensures code quality and best practices, reviews critical changes, and develops assigned features. |
| **lparolis** | Developer | Implement assigned features, participate in code reviews, test and document your work. |
| **alerusso** | Developer | Implement assigned features, participate in code reviews, test and document your work. |

## Project Management
The team organized the work through an initial phase of *task distribution*, followed by in-person meetings aimed at defining the project, coordinating activities, and *defining the main objectives and priorities*. During development, the group maintained a constant comparison on the progress of work, reviewing and updating tasks and objectives when necessary.

Project management, documentation, and information and goal sharing were centralized within a **Notion** workspace shared, organized, and maintained collaboratively by all team members. This has made it possible to have documentation that is always up-to-date, consistent and easily accessible.

Regarding communication and collaboration, several tools were used. **Slack** was primarily used for file and folder sharing and daily communication, while **GitHub** was used for hosting and project management, thanks to a multi-branch structure that enabled collaborative development and change tracking. Finally, **Discord** has been used primarily for remote collaboration, facilitating coordination of activities between team members in different locations.

## Technical Stack

| Level | Technology | Reason |
|-|-|-|
| ***Frontend*** | *Vue.js* | Progressive frontend framework based on reusable components, with responsiveness system for automatically updating the UI based on state changes. |
|  | *Tailwind* | Utility-first CSS framework that allows you to stylize components directly in markup using predefined classes, without writing separate custom CSS. |
| ***Backend*** | *Node.js* | V8-based server-side JavaScript runtime, used to run JS code outside the browser (HTTP server, filesystem/OS access, scripting). |
|  | *Express* | Minimal framework for Node.js that simplifies routing, HTTP requests/responses, and middleware management  |
| ***Database*** | *PostgreSQL* | Relational database with SQL syntax, native support for advanced data types like JSONB, arrays, and custom data types, allowing for great database scalability, optimization of complex queries |
| ***Other technologies and libraries*** | *Prisma* | ORM for Node.js, used to interact with the PostgreSQL database via a type-safe client automatically generated from the schema imported from the database (`schema.prisma`). Chosen for security on types under development and regarding SQL Injection, integrated migration management and query readability compared to writing raw SQL, reducing the risk of errors such as malformed queries or type mismatches between code and database. |
|  | *Redis* | In-memory key-value database, used for quick-access temporary data. Chosen to save and manage refresh JWT tokens (logout invalidation), the OTPs for 2FA with automatic expiration (TTL). Use cases where disk persistence is not needed and read/write speed is a priority. |
|  | *HashiCorp Vault* | Tool for centralized and secure secret management (DB credentials, JWT secret, etc.), with encrypted storage and controlled access. |
|  | *JWT* | Stateless authentication that avoids database requests or caches for each request, the information is contained and signed in the token itself. It can be used with any RFC-compliant language and framework. Implemented in combination with refresh token, which when the JWT expires is used to request a new JWT + refresh pair. |
|  | *nginx* | Web server used as the only public entry point to the cpsi stack for other services to remain isolated on the internal Docker network. Routes requests to the appropriate containers (Vite frontend, Express backend, Socket.IO) and handles encrypted communication via TLS protocol. Chosen for its reliability in managing reverse proxies and HTTPS, and for the ability to directly serve static files (e.g. media/avatar) without going through the backend. |
|  | *Vite* |  It has been used to create a fast and responsive workspace for the frontend. Thanks to it we used tools like Tailwind, which need to be compiled, and many others. |
|  | *Vue I18n* |  A Vue plugin which implement a lightweight and simple translation module with dynamic JSON storage. |
|  | *Pinia Store* |  A simple and reacting store for sharing multiple variable states thought all of the frontend. It was used o manage the authentication for the users, for the socket and notification  management. |


## Database Schema

[Schema Database](docs/db_diagram.png)

The database is composed of 10 tables with the following relationships:

### users

| Type | Table | As |
|------|-------|-----|
| N:1 | *preferences* | `id_preference` |
| 1:N | *friendships* | `id_user1`, `id_user2`, `sender` |
| 1:N | *notifications* | `id_user`, `id_sender` |
| 1:N | *tournament_players* | `id_user` |
| 1:N | *tournaments* | `created_by` |
| 1:N | *users_matches* | `id_user` |


### friendships

| Type | Table | As |
|------|-------|-----|
| N:1 | *users* | `id_user1` |
| N:1 | *users* | `id_user2` |
| N:1 | *users* | `sender` |


### matches

| Type | Table | As |
|------|-------|-----|
| N:1 | *tournaments* | `id_tournament` |
| 1:N | *users_matches* | `id_match` |


### users_matches

| Type | Table | As |
|------|-------|-----|
| N:1 | *users* | `id_user` |
| N:1 | *matches* | `id_match` |


### tournaments

| Type | Table | As |
|------|-------|-----|
| N:1 | *users* | `created_by` |
| 1:N | *matches* | `id_tournament` |
| 1:N | *tournament_players* | `id_tournament` |


### tournament_players

| Type | Table | As |
|------|-------|-----|
| N:1 | *tournaments* | `id_tournament` |
| N:1 | *users* | `id_user` |


### pieces

| Type | Table | As |
|------|-------|-----|
| N:1 | *abilities* | `id_ability` |


### abilities

| Type | Table | As |
|------|-------|-----|
| 1:N | *pieces* | `id_ability` |


### notifications

| Type | Table | As |
|------|-------|-----|
| N:1 | *users* | `id_user` |
| N:1 | *users* | `id_sender` |


### preferences

| Type | Table | As |
|------|-------|-----|
| 1:N | *users* | `id_preference` |

## Feature List

Feature list:

| Feature | Description | Team Member(s) |
|-|-|-|
| User Registration | User can create an account with username, email, and password | edraccan, mfanelli |
| Login and Authentication | User can log in via username/email and password | edraccan, mfanelli |
| User Information Management | Allows you to edit user information, including profile picture and theme preferences | edraccan, mfanelli |
| Google Authentication | Allows users, registered and unregistered, to register/log in with Google's OAuth service | edraccan, mbiagi |
| Send and receive notifications for real-time friendships and rank promotion | Allows the user to receive notifications about ranking position and friendships in real time | edraccan, mfanelli |
| Friendship Management | Allows the user to send, accept, and reject friendship requests | edraccan, mfanelli |
| Offline Matches (vs AI) | Allows the user to play offline against an AI implemented to play ChessZ | mbiagi, alerusso, lparolis |
| Online Matchmaking | Allows the user to play online against other players | mbiagi, alerusso, lparolis |
| Online PvP Chessboard | Chessboard generation (orientation, colors, page design), drag & drop, highlighting legal squares, invalid moves. Buttons UI to buy abilities, activate them, send draw requests, power up previews. InGame Chat, In game reactive tutorials and mini chessboard info generation. Custom designed reactive chessPieces. Personalized audio design | mbiagi, alerusso, lparolis |
| Guide book (Codex) | Allows the user to consult a game guide that explains the movements of each piece, their abilities, and their historical background | edraccan, mfanelli, mbiagi |
| User Search | Allows the user to search for other users registered with the application | edraccan, mfanelli |
| 2FA | Allows the user to receive a one-time code on their email at login to authenticate | edraccan, mfanelli |
| Language Change | Allows the user to change the application language | mfanelli |


## Modules

### Summary

| Module | Type | Points | Team Member(s) |
|-|-:|-:|-:|
| Use a **framework** for both the frontend and backend. | Major | 2 | all team members |
| Implement real-time features using WebSockets or similar technology. | Major | 2 | all team members |
| Allow users to interact with other users. The minimum requirements are: **basic chat**, **profile** and **friends** systems. | Major | 2 | lparolis, edraccan, mfanelli |
| Standard user management and authentication. | Major | 2 | edraccan, mfanelli |
| Introduce an AI Opponent for games. | Major | 2 | mbiagi, alerusso |
| Implement a complete web-based game where users can play against each other. | Major | 2 | all team members |
| Remote players — Enable two players on separate computers to play the same game in real-time. | Major | 2 | all team members |
| Cybersecurity — Configure strict ModSecurity/WAF and manage secrets in Vault | Major | 2 | edraccan |
| Implement a complete 2FA (Two-Factor Authentication) system for the users. | Minor | 1 | edraccan |
| Use an **ORM** for the database. | Minor | 1 | edraccan, mbiagi, alerusso |
| Custom-made design system with reusable components, including a proper color palette, typography, and icons | Minor | 1 | mfanelli, lparolis |
| Game statistics and match history (requires a game module). | Minor | 1 | all team members |
| Implement remote authentication with OAuth 2.0. | Minor | 1 | mbiagi, edraccan |
| Support for additional browsers. Full compatibility with at least 2 additional browsers. | Minor | 1 | mfanelli, lparolis |
| Gamification (XP/level, badge, leaderboard) | Minor | 1 | all team members |

***Total points:*** 23

## Module Implementations

### Use a framework for both the frontend and backend. (Major - 2pt)

#### Reason of using
Vue.js was chosen because it is recommended for 2D games and because it is beginner friendly, Express.js because it is simple, fast and optimally manages routes with middleware.

#### Implementation
The two frameworks were used for the entire frontend and backend implementation respectively

---

### Implement real-time features using WebSockets or similar technology. (Major - 2pt)

#### Reason of using
To instantly send the user changes within the application and to make it possible to play between two players live

#### Implementation
We used web sockets to receive notifications, update friends' online status, search for a match, and the match itself between two players

---

### Allow users to interact with other users. The minimum requirements are: **basic chat**, **profile** and **friends** systems. (Major - 2pt)

#### Reason of using

To create a living environment, where users can interact and communicate with each other through the friendship system and the chat during matches

#### Implementation

- **Chat**: A basic in game chat that allows both players in the match to send messages to each other and see the server logs. It's a vue component that is basically a simple array that gets filled with messages sent by the game server through websocket. The payload from the server is composed of a js object with the message and the author of the message. The representation dynamically changes according to the author.
- **Profile**: Every user has their own private page with all of theirs info (friendlist, matchlist...), and their public one that can be seen by everyone. It's made by different components that simply show all the information that the frontend fetch from the back about the user.
- **Friends system**: Each user can ask, accept or reject friend requests from other users. The whole system operates through requests to the backend about the logged-in user's information each time they receive a friendship notification. This way all components of this system (such as FriendList.vue, FriendButton.vue, and FriendRequest.vue) can change dynamically without page reload.

---

### Standard user management and authentication. (Major - 2pt)

#### Reason of using
To made the players have an identity in the game allowing them to track their improvement, customise their profile and have interactions with other users through the friendship system

#### Implementation
**UI/UX**:
- **User page**: every user has it's own private page at '/me' and their public page at "/:username"
- **Login and register page**: complete with errors and the possibility of loggin in using a Google account
- **User setting and editing**: a editing page dedicated to the updating the users infos including the avatar, name, surname and others preferences
- **Dinamic friendship system**: at every friendship request the user pages are updated accordingly

**Architecture**:
- **Auth and friend notifications stores**: managing the authentication and the notifications of the user thrught a Pinia store
- **User authentication**: every user is authenticated through an hashed password and their email or username

---

### Introduce an AI Opponent for games. (Major - 2pt)

#### Reason of using
To provide single-player gameplay experience and allow users to practice

#### Implementation

**Architecture:**
- **Server-side execution**: AI runs on the backend using Node.js subprocesses to prevent blocking the main server process
- **Isolation**: Each AI game instance runs in a separate subprocess

**AI Algorithm:**
- **Minimax algorithm**: Core decision-making algorithm (it does not evaluate the moves itself)
- **Zobrist hashing**: Efficient position caching and transposition table management to optimize search depth and memory usage
- **Eval**: Personalized chessboard evaluation function based on the AI profile

**AI Profiles:**
Multiple configurable AI personalities, each with:
- **Dedicated memory**: Per-profile transposition tables and evaluation caches
- **Custom eval function**: Different eval function 
- **Personalized messages**: AI-specific in-game messages and responses based on profile
- **Adjustable depth**: Minimax search depth varies per profile to control difficulty level

**Technical Flow:**
0.	When starts, backend spawns 5 subprocess
1.	Player requests match vs. AI
2.	Backend finds the least busy subprocess
3.	Player selects the move
	1. The server validates the player socket
	2. The server sends the move to the correct subprocess
	3. The subprocess updates the match state, checks the checkmate
	4. The subprocess sends the data to the server. The server sends the data to the player 
	5. AI evaluates position using Minimax + Zobrist, then choose its move
	6. Repeat 3 and 4
	7. The server waits for new moves from the player

---

### Implement a complete web-based game where users can play against each other. (Major - 2pt)

#### Reason of using
To provide a complete interactive and challenging gaming experience

#### Implementation

**Game Choice:** Chess

**State Management:**
- **Dynamic JavaScript objects**: Game state represented as mutable objects that respond to multiple input types
- **Multi-source input handling**: State transitions driven by:
  - **HTTP requests**: RESTful API calls (only for debug)
  - **WebSocket events**: Real-time state synchronization between players
  - **Keyboard input**: Using terminal for rendering and input (only for debug)
  - **File-based restoration**: Chess notation files (history json, database record) for match state recovery and replay

**Rendering Architecture:**
- **Backend responsibility**: Logic, validation, state management via Express.js
- **Frontend responsibility**: All visual rendering via Vue.js components

---

### Remote players — Enable two players on separate computers to play the same game in real-time. (Major - 2pt)

#### Reason of using
To enable competitive multiplayer

#### Implementation

**Technology:** Socket.io WebSocket library for real-time bidirectional communication

**Connection Management:**
- **Initial connection**: Player joins game room via WebSocket handshake
- **Active gameplay**: Moves transmitted instantly between players and server
- **State synchronization**: Authoritative server maintains single source of truth for board state

**Disconnection & Reconnection Protocol:**
1. **Disconnection detected**: Client socket disconnects (network failure, browser close, etc.)
2. **Reconnection timer initiated**: Server-side timeout begins (duration configurable)
3. **Timer expiration**: If reconnection doesn't occur within time window, disconnected player loses
4. **Successful reconnection**: Player reconnects before timer expires
   - Timer resets
   - Game state resynchronized to reconnecting player
   - Gameplay resumes normally
   - Player can continue without penalty

---

### Configure strict ModSecurity/WAF and manage secrets in Vault (Major - 2pt)

#### Reason of using

To protect the application from common web attacks and prevent sensitive credentials from being exposed in the source code or configuration files.

#### Implementation

**Web Application Firewall:** Nginx is the only publicly accessible service and acts as a reverse proxy for the frontend and backend. ModSecurity, configured with the OWASP Core Rule Set, inspects incoming HTTP requests and blocks common attacks such as SQL injection, cross-site scripting, path traversal, and malicious payloads.
**Secret Management:** HashiCorp Vault is used to securely store sensitive values such as database credentials, JWT secrets, OAuth keys, and email credentials. The backend retrieves these secrets 
from the Vault container.
**Container Security:** PostgreSQL, the backend, and Vault are isolated inside the Docker network. Only Nginx exposes a public port with HTTPS protocol, reducing the attack surface of the application.

---

### Implement a complete 2FA (Two-Factor Authentication) system for the users. (Minor - 1pt)

#### Reason of using
An additional and optional security for the user which adds a security layer for authentication

#### Implementation
To send emails we used Nodemailer, to which is associated a Google account created specifically for this. A 6-digit code with a 5-minute TTL is randomly created and saved to Redis which, at the end of the TTL, automatically deletes the code that will become invalid for login.

**Technical Flow:**

- After the classic user login with email or username and password a temporary code (otp) is requested
- In the mean time the code is sent to the user's email
- The user enters the code received via email 
  - If it's correct, the users enters in their account normally
  - If it's incorrect, a maximum of 5 attempts are granted before requesting the username/password login again

---

### Use an **ORM** for the database. (Minor - 1pt)

#### Reason of using
To abstract database queries which prevent the use of SQL injection, improve code maintainability, provide type safety, and enable easy schema migrations.

#### Implementation

**ORM Choice:** Prisma

**Database:** PostgreSQL

**Benefits:**
- **Type-safe queries**: TypeScript integration prevents runtime query errors
- **Schema migrations**: Version-controlled database schema changes
- **Query builder**: Intuitive syntax for complex queries
- **Relation management**: Automatic foreign key and relationship handling
- **Performance**: Connection pooling and query optimization built-in

**Data Models (Example domains):**
- User (authentication, profiles)
- Game (chess matches, state history)
- Move (game actions, move sequences)
- GameStatistics (ratings, match history)
- Notification (user notifications)

---

### Custom-made design system with reusable components, including a proper color palette, typography, and icons (Minor - 1pt)

#### Reason of using
To ensure visual consistency across the application, improve development speed, and provide a cohesive user experience.

#### Implementation
**All the elements of the design:**
- **Color palettes and themes**: 4 dark themes base on the 4 basic colors (Red, Blue, Green, Yellow)
- **Icons and SVGs**: Every icon has its component which can dynamically react to the user's theme if needed
- **Personalized components**: More than 25 components made exclusively for this project
- **Custom made pieces design**: Every boosted chess piece was made by hand for this project

---

### Game statistics and match history (requires a game module). (Minor - 1pt)

#### Reason of using
To track player performance, provide competitive rankings

#### Implementation

**Database Schema:**
- Stores all completed games with timestamps
- Tracks moves in sequence (moveset history)
- Records player IDs, results, and game duration
- Enables filtering by date, opponent, result

**Frontend Display:**
- Paginated match history view
- Statistics dashboard (win/loss ratio, average game duration)

---

### Implement remote authentication with OAuth 2.0. (Minor - 1pt)

#### Reason of using
To allow users to authenticate via third-party identity providers and reduce friction in account creation.

#### Implementation
Using passport to manage Google's OAuth service and also user management and or creation. A login request is made to Google via passport, which, if all goes well, sends a request back to a callback function specifically created to receive Google's successful response

**Technical Flow:**

- At login we give the option to access your account through Google
  - If an account linked to that email doesn't exist, it's created with a generic username (e.g., username12345), without a password setted and the ID provided by Google. The user will then be notified on their settings page to set a password so they can log in to their account even without OAuth's service and for their security.
  - If, however, the user exists but it the first time the OAuth service it's used to login, the Google ID is associated with the user who is logging in.
  - Finally, if the user already exists and has already associated a Google ID, the users logs in their account normally.

---

### Support for additional browsers. Full compatibility with at least 2 additional browsers. (Minor - 1pt)

#### Reason of using
To ensure accessible gameplay across multiple browsers and reduce compatibility issues for players.

#### Implementation
**Primary browsers tested:**
- Chrome
- Brave
- Opera

---

### Gamification (XP/level, badge, leaderboard) (Minor - 1pt)

#### Reason of using
Encourage competitive play through ranking systems

#### Implementation

**Rating System:** ELO-based competitive ranking (library elo-rank used)

**ELO Formula:**
- Winner gains points proportional to opponent strength
- Loser loses points; steeper loss against weaker opponent
- Initial rating: 500 (or configurable baseline)

**Tier/Title System:**
Players advance through ranked tiers based on cumulative ELO:

```javascript
const EloTitle = {
  1: "Bastard",         // ELO 1–499
  500: "Valkyrie",      // ELO 500–799
  800: "Minotaurus",    // ELO 800–999
  1000: "Jester",       // ELO 1000–1199
  1200: "Champion",     // ELO 1200–1399
  1400: "King",         // ELO 1400–1599
  1600: "Emperor"       // ELO 1600+
}
```

**Tier advancement:**
- Automatic title assignment based on current ELO
- Title displayed on player profile and leaderboard
- Visual indicators (badges, ranks) in UI

**Leaderboard:**
- Ranked by ELO score (descending)
- Displays max top 10 players
---

