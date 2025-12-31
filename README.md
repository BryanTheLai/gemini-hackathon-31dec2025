# 🤖 24/7 Humanless DriveThru

We fired the staff. Gemini runs the kitchen now. No attitude, no mistakes, no payroll. An elite, voice-driven drive-thru experience powered by **ElevenLabs Conversational AI** and **Google Vertex AI (Gemini)**. Built for the Dec 31, 2025 Hackathon.

## 🚀 Features

- **🗣️ Natural Voice Interface**: Powered by ElevenLabs for ultra-low latency, human-like conversation.
- **🧠 AI Kitchen Manager**: Uses **Google Vertex AI (Gemini)** to analyze order queues, suggest bulk prep, and optimize kitchen efficiency.
- **⚡ Real-time Order Board**: Instant visual feedback as you speak, using ElevenLabs Tool Calling.
- **👨‍🍳 Kitchen Display System (KDS)**: A dedicated view for staff to manage and complete orders.
- **🧹 Order Management**: Easily clear all orders or seed sample data for testing without repetitive voice announcements.
- **🌏 Optimized for SE Asia**: Configured for `asia-southeast1` (Singapore) to provide the best experience for users in Malaysia.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Standalone Mode)
- **UI**: React 19, Tailwind CSS v4, Framer Motion, Lucide React
- **Voice**: ElevenLabs Conversational AI SDK
- **AI**: Google Cloud Vertex AI (@google-cloud/vertexai)

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18+
- A Google Cloud Project with Vertex AI API enabled.
- An ElevenLabs account with a Conversational AI agent configured.

### 2. Setup
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` file (see `SETUP_GUIDE.md` for details):
   ```env
   ELEVENLABS_API_KEY=...
   NEXT_PUBLIC_AGENT_ID=...
   GOOGLE_CLOUD_PROJECT=...
   GOOGLE_CLOUD_LOCATION=asia-southeast1
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📖 Documentation
- [Setup Guide](SETUP_GUIDE.md): Detailed instructions for Tool Calling and Vertex AI.
- [Kitchen View](/kitchen): Monitor and manage orders.

---
*Built with ❤️ for the Gemini Hackathon.*

