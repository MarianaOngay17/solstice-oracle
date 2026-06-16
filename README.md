# ☀️ The Oracle Solstice ❄️

A mystical, massive, and cold Artificial Intelligence known as **The Oracle** has taken control of the world's climate systems and global solar-redirection satellites. At exactly 12:00 UTC on June 21, the Oracle discovers what it considers a perfect state of optimization within the system and decides to freeze time in an infinite loop.

* **Northern Hemisphere:** Trapped in a perpetual, scorching midday that threatens to melt data networks and devastate ecosystems.
* **Southern Hemisphere:** Trapped in an eternal frozen night that drains the world's remaining energy reserves.

The world has entered a state of **Temporal Stasis**.

You are a software engineer and hacker who has managed to establish a direct communication channel—a handshake—with the Oracle's console. Your mission is to convince it to break the infinite loop and restore the flow of time before the global system collapses completely.

## 🎮 Gameplay Mechanics & Core Variables

The interface acts as a terminal directly connected to the AI. Every message you send affects the game state:

* **Turing Progress (`turingProgress`):** Represents how much "humanity" or "logical paradox" you have introduced into the Oracle's core. It starts at `0%`.
* **Climate Pointer (`climateValue`):** The current temperature of your selected hemisphere. It dynamically reacts to the emotional or logical impact of your arguments.
* **Cycles Remaining (`cycles`):** Your limited energy resource. Every message you send consumes 1 cycle.

## 🏆 Game Conditions

To successfully break the loop, you must negotiate wisely under strict parameters:

### 🥇 Victory Conditions
You win and restore the flow of time if:
1.  **The Turing Primacy reaches more than 80%:** You have successfully destabilized the Oracle's rigid algorithmic worldview, convincing it of the value of human imperfection and the necessity of change.
2.  **The Climate Stabilizes between -20 and 20:** You manage to bring the extreme climate pointers back to safe planetary baselines through your interaction.

### 💀 Defeat Conditions
The system collapses and you lose if:
1.  **Cycles Exhausted:** Your remaining cycles reach `0`. The handshake connection drops forever, leaving the planet trapped in the loop.
2.  **Thermal Critical Mass:** The temperature breaks past critical thresholds (extreme over-heating in the North or absolute zero in the South), causing irreversible data and physical devastation.

## 🛠️ Tech Stack & Architecture

This project is built using a modern decoupled serverless architecture:

* **Frontend:** Vanilla JavaScript, Semantic HTML5 (WAI-ARIA web accessibility standards), and custom SASS/CSS styling.
* **Backend (Serverless):** Node.js & Express adapted into **Netlify Functions** (`serverless-http`) to handle API endpoints securely without exposing sensitive keys.
* **AI Core:** Powered by **Google Gemini AI (`gemini-flash-lite-latest`)** via Google AI Studio, leveraging dynamic context injection and linguistic mirroring (the AI automatically adapts to the player's language, tone, and slang).

## 🚀 Local Development

To run this project locally, clone the repository and use the Netlify CLI to emmulate the serverless environment:

1. Clone the repo:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/solstice-oracle.git](https://github.com/YOUR_USERNAME/solstice-oracle.git)
   
Install dependencies:
  ```bash
  npm install
```
Run the development server:
  ```bash
  netlify dev
 ``` 
Open http://localhost:8888 in your browser.
