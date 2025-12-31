# 24/7 Humanless DriveThru: AI & Tool Calling Setup Guide

This guide explains how to set up **Tool Calling** with ElevenLabs and how to integrate **Google Gemini** (via Vertex AI or the GenAI SDK) for advanced kitchen logic.

## 1. ElevenLabs Tool Calling (Voice-to-Action)

Tool calling allows your voice agent to perform actions in your app (like updating the order board).

### How it works:
1. **Define the Tool**: In the ElevenLabs Dashboard, you define a JSON schema for your tool (e.g., `update_order_board`).
2. **Client-side Implementation**: In your React code, you provide a `clientTools` object to the `useConversation` hook.
3. **Execution**: When the AI decides to call a tool, the ElevenLabs SDK executes your local function.

### Tool 1: `update_order_board`
Paste this into the **JSON Mode** editor in the ElevenLabs dashboard:

```json
{
  "type": "client",
  "name": "update_order_board",
  "description": "Updates the visual order board with the current items. Call this whenever the customer adds, removes, or modifies an item.",
  "expects_response": false,
  "response_timeout_secs": 1,
  "parameters": [
    {
      "id": "items",
      "type": "string",
      "description": "A JSON string representing the array of items. Each item must have 'name' (string), 'quantity' (number), and 'price' (number). Example: [{\"name\": \"Gemini Classic\", \"quantity\": 1, \"price\": 5.99}]",
      "dynamic_variable": "",
      "required": true,
      "constant_value": "",
      "value_type": "llm_prompt"
    }
  ],
  "execution_mode": "immediate"
}
```

### Tool 2: `submit_order`
Paste this into the **JSON Mode** editor:

```json
{
  "type": "client",
  "name": "submit_order",
  "description": "Finalizes the order and sends it to the kitchen. Call this only when the customer confirms they are finished.",
  "expects_response": false,
  "response_timeout_secs": 1,
  "parameters": [],
  "execution_mode": "immediate"
}
```

### Tool 3: `end_call` (System Tool)
You do not need to paste JSON for this. Instead:
1. In the ElevenLabs Dashboard, go to the **Tools** tab.
2. On the right side under **System tools**, find **End conversation** (or `end_call`).
3. Toggle it **ON**.
4. The agent will now automatically hang up when the conversation is finished.

---

## 2. Google Vertex AI Integration (Hackathon Requirement)

We use **Google Vertex AI** for real-time kitchen analysis.

### Step 1: Enable Vertex AI API
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project.
3. Search for **"Vertex AI API"** and click **Enable**.

### Step 2: Authentication
Since `gcloud` is not installed on your system, you have two options:

#### Option A: Install Google Cloud CLI (Recommended)
1. Download and install the **[Google Cloud CLI Installer for Windows](https://cloud.google.com/sdk/docs/install#windows)**.
2. After installation, open a **new** terminal and run:
   ```bash
   gcloud auth application-default login
   ```

#### Option B: Use a Service Account Key (Faster for Hackathons)
1. In Google Cloud Console, go to **IAM & Admin > Service Accounts**.
2. Create a new Service Account (e.g., `gemini-burgers-sa`).
3. Grant it the **Vertex AI User** role.
4. Click on the account -> **Keys** tab -> **Add Key** -> **Create new key** (JSON).
5. Save the file as `service-account.json` in your project root.
6. Add this to your `.env` file:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account.json"
   ```

### Step 3: Environment Variables
Add these to your `.env` file:
```env
GOOGLE_CLOUD_PROJECT=gemini-burgers-482816
GOOGLE_CLOUD_LOCATION=us-central1
```
*Note: `us-central1` (Iowa) is the default region for most GCP services and ideal for US-based judges.*

---

## 3. Deployment

Deploy to Vercel or any Node.js hosting provider. Ensure environment variables are set.

---

## 4. Final Production Audit Checklist

- [x] **Vertex AI**: API enabled and region set to `asia-southeast1`.
- [x] **ElevenLabs**: Tools `update_order_board` and `submit_order` configured.
- [x] **ElevenLabs**: `end_call` system tool enabled.
- [x] **Stale Closures**: Fixed using `useRef` in `conversation.tsx`.
- [x] **Latency**: Optimized for SE Asia (asia-southeast1).
