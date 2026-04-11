# 🐂 Bull Margin (Margin Apex) - User Frontend

A modern, responsive, mobile-first trading platform interface built with Vue 3, Vite, and Pinia.

## 🚀 Features

*   **Modern UI/UX Design**: Uses a clean, glassmorphism-inspired aesthetic with intuitive mobile-first styling and robust responsive layouts.
*   **Centralized Dark Mode Engine**: Intelligent unified theming system syncing `body.dark` and `[data-theme="dark"]` across the application utilizing localStorage.
*   **Advanced Market Data System**: Real-time ticker and market updates mapped to custom, colorful, intuitive Market Cards showcasing percentage changes and P&L logic.
*   **Comprehensive Trade Modules**: Fully functional frontend structural views for Orders, Watchlists, and Position Management.
*   **State Management via Pinia**: Robust stores for user profiles, secure wallet tracking, real-time ticket sockets, and order handling.
*   **Custom Notifications & Modals**: Branded, platform-integrated custom popups replacing rigid browser prompts for logic like exiting trades and logging out.

## 🛠️ Technology Stack

*   **Framework**: [Vue 3](https://vuejs.org/) (Composition API / `<script setup>`)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **State Management**: [Pinia](https://pinia.vuejs.org/)
*   **Routing**: [Vue Router](https://router.vuejs.org/)
*   **Styling**: Tailwind CSS + Custom Scoped Vanilla CSS
*   **Icons**: Font Awesome 6

## 💿 Project Setup

Make sure you have Node.js installed in your system.

### Install Dependencies
```sh
npm install
```

### Compile and Hot-Reload for Development
```sh
npm run dev
```

### Compile and Minify for Production
```sh
npm run build
```
