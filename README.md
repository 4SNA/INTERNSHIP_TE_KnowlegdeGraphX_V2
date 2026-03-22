# KnowledgeGraphX Neural Workspace 🧠🌐

KnowledgeGraphX is a next-generation SaaS platform that transforms unstructured organizational data into a high-fidelity, interactive knowledge graph. 

Built with a focus on real-time collaboration and advanced RAG (Retrieval-Augmented Generation) architectures, it allows teams to query their entire document corpus using a natural, AI-driven interface.

## 🚀 Tech Stack

### 🎨 Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0 (Custom Glassmorphism Engine)
- **Icons**: Lucide React
- **State**: React 19 Server Components & Client Hooks
- **Real-time**: Socket.IO Client

### ⚙️ Backend
- **Core**: Spring Boot 3.4 (Java 17+)
- **Security**: Spring Security + OAuth2 (Google/GitHub) + JWT
- **Real-time**: Spring WebSocket + Redis Pub/Sub
- **Database**: PostgreSQL (Structured Data) & FAISS (Vector Storage)
- **Caching**: Redis

## ✨ Key Features
- **Neural Dashboard**: Bento-grid metrics and live system monitoring.
- **Collaborative Workspace**: Real-time multi-user document analysis with AI assistance.
- **Source Citations**: AI responses with direct links to document page numbers and sections.
- **Interactive Knowledge Graph**: Visualize entity relationships and thematic clusters across your corpus.
- **Advanced Analytics**: Detailed engagement and performance metrics for organizational intelligence.

## 📂 Project Structure
- `/frontend`: Next.js application with a premium dark futuristic design system.
- `/backend`: Spring Boot core engine for document processing and AI orchestration.
- `docker-compose.yml`: Local infrastructure for PostgreSQL and Redis.

## 🛠️ Getting Started
1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

---
Designed for speed, intelligence, and a seamless collaborative future.
© 2026 KnowledgeGraphX Core Team
