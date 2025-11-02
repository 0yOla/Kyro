# Kyro - Social AI Agent 🤖

## Overview

Kyro is a **serverless** and **autonomous Social AI Agent** designed to post on **Instagram** and **Twitter/X**. It can be trained using various content sources, making it a versatile assistant for content creators, influencers, and businesses. Kyro runs **locally** or can be **deployed online**, ensuring flexibility in usage based on your needs. 🚀

## Features ✨

- 📢 **Autonomous Social Posting**: Generates and posts content on Instagram & Twitter/X.
- 🎥 **AI Training from Videos**: Learn from YouTube videos by providing a URL.
- 🎙️ **Audio Processing**: Extracts insights and learns from audio files.
- 🌐 **Website & Portfolio Training**: Improves Kyro’s knowledge by crawling website content.
- 📄 **File-Based Training**: Supports various document formats for learning.
- 🧠 **Continuous Learning**: The more data you provide, the smarter Kyro gets.
- 🔥 **Engagement Optimization**: Analyzes trends for better social media performance.
- ☁️ **Serverless & Deployable**: Runs locally or can be deployed online for 24/7 operation.
- ⚙️ **Custom Configuration**: Operates based on set parameters to match your needs.

## Supported File Formats 📂

- **Documents**: PDF, DOC, DOCX, TXT
- **Audio**: MP3, WAV.

---

## Getting Started 🚀

### 1️⃣ Installation

```sh
# Clone the repository
git clone https://github.com/david-patrick-chuks/kyro.git

# Navigate to the project folder
cd kyro

# Install dependencies
npm install  # or yarn install
```

### 2️⃣ Environment Setup

Create a `.env` file in the root directory and configure the following:

```env
INSTAGRAM_API_KEY=your_instagram_api_key
TWITTER_API_KEY=your_twitter_api_key
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
```

### 3️⃣ Running Kyro Locally

```sh
# Start the server
npm run dev  # or yarn dev
```

### 4️⃣ Deploying Kyro Online

To keep Kyro running 24/7, deploy it using **Vercel, AWS Lambda, or Google Cloud Functions**.

```sh
# Deploy using Vercel
vercel deploy
```

---

## How to Train Kyro 🧠

### Using YouTube Video 🎥

```sh
POST /train
{
  "type": "video",
  "url": "https://www.youtube.com/watch?v=example",
}
```

### Using an Audio File 🎙️

```sh
POST /train
{
  "type": "audio",
  "file": "path/to/audio.mp3"
}
```

### Using a Website Link 🌐

```sh
POST /train
{
  "type": "website",
  "url": "https://example.com"
}
```

### Using a Document 📄

```sh
POST /train
{
  "type": "document",
  "file": "path/to/document.pdf"
}
```

---

## API Endpoints 📡

### 🔹 Post on Instagram

```sh
POST /post/instagram
{
  "content": "Your Instagram post content",
  "image": "image_url"
}
```

### 🔹 Post on Twitter/X

```sh
POST /post/twitter
{
  "content": "Your Twitter post content"
}
```

### 🔹 Check Kyro's Training Data

```sh
GET /train/data
```

### 🔹 Delete Training Data

```sh
DELETE /train/data
{
  "type": "document"
}
```

---

## Future Enhancements 🌟

- ✅ **AI-generated captions & hashtags**
- ✅ **Multi-platform expansion (LinkedIn, Facebook, TikTok)**
- ✅ **Live engagement analytics dashboard**

---

## Contribution 🤝

Want to contribute? PRs are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push and create a PR.

---

## License 📜

Kyro is released under the **MIT License**.

---

## Contact 📧

💬 **Twitter/X**: [BugHunter.dev](https://twitter.com/davepatty5686)\
💬 **Email**: [davidchuksdev@gmail.com](mailto:davidchuksdev@gmail.com)

