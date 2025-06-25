# WellnessAI

[wellnessai.health](https://wellnessai.health)

**WellnessAI** is a privacy-focused medical AI assistant that combines local and cloud AI capabilities for personalized health conversations. Built on the foundation of [Zola](https://github.com/ibelick/zola), it transforms a general-purpose chat interface into a specialized medical consultation platform.

![WellnessAI Cover](./public/wellness-ai-cover.jpg)

## 🏥 Overview

WellnessAI is designed to be your personal health companion, offering medical guidance while maintaining complete privacy of your sensitive health information. It runs AI models locally on your computer for maximum privacy, with optional cloud enhancement for improved responses.

### Key Differentiators

- **Privacy-First Architecture**: Your health data never leaves your device when using local models
- **Medical-Focused AI**: Specialized prompts and safety features for health conversations
- **Hybrid Intelligence**: Seamlessly combines local and cloud AI for optimal performance
- **Emergency Detection**: Automatically recognizes medical emergencies and provides appropriate guidance
- **Comprehensive Audit Trail**: All medical conversations are logged for your records

## ✅ Current Features (Stage 1 Complete)

### 🤖 AI Capabilities
- **Local AI Integration**: Full support for LM Studio with OpenBioLLM-8B (recommended)
- **Multi-Model Support**: Inherited from Zola - supports OpenAI, Claude, Gemini, Mistral, and more
- **Streaming Responses**: Real-time AI responses with thinking process visibility
- **Model Switching**: Easy switching between local and cloud models

### 🏥 Medical Features
- **Medical Conversation Mode**: Specialized prompts for health-related discussions
- **Emergency Detection**: Automatic detection of emergency situations with immediate 911 prompts
- **Medical Disclaimers**: Version-controlled medical disclaimers with acceptance tracking
- **Health Context**: System prompts optimized for medical accuracy and safety
- **Conversation Export**: Export medical conversations for doctor visits

### 🔒 Security & Privacy
- **CSRF Protection**: All state-changing requests protected against CSRF attacks
- **Rate Limiting**: 10 requests/minute limit to prevent abuse
- **Session Management**: Secure 4-hour session timeout
- **Audit Logging**: Complete audit trail of all medical conversations
- **Encryption Ready**: Infrastructure for encrypting sensitive data at rest

### 💻 Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Themes**: Comfortable viewing in any lighting condition
- **File Uploads**: Support for uploading medical documents (future enhancement)
- **Supabase Integration**: Cloud database with Row Level Security (RLS)
- **TypeScript**: Full type safety throughout the application

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [LM Studio](https://lmstudio.ai) (for local AI)
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/vincenthopf/WholisticAI.git
cd WholisticAI/Wholistic

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
npm run dev
```

### Essential Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# Security (Required)
CSRF_SECRET=generate_32_char_string
ENABLE_MEDICAL_MODE=true

# LM Studio (Local AI)
LM_STUDIO_BASE_URL=http://localhost:1234/v1
```

For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md).

## 🗺️ Future Roadmap

### Stage 2: Cloud Integration with Privacy Layer (3-4 weeks)
- **Privacy Abstraction Layer**: Zero PII leakage to cloud services
- **OpenRouter Integration**: Access to advanced cloud models
- **Hybrid Orchestration**: Intelligent routing between local and cloud
- **Cost Optimization**: Smart model selection based on query complexity

### Stage 3: Medical Context & RAG System (3-4 weeks)
- **Personal Health Records**: Secure storage of medical history
- **Document Processing**: PDF parsing for test results and medical records
- **Vector Database**: Medical knowledge base with pgvector
- **Contextual Responses**: AI responses informed by your health history

### Stage 4: Enhanced Features (4-6 weeks)
- **Symptom Tracking**: Pattern recognition and trend analysis
- **Medication Management**: Reminders, interactions, and refill tracking
- **Nutrition Assistant**: Personalized meal planning and dietary guidance
- **Mental Health Support**: Mood tracking and wellness recommendations
- **Wearable Integration**: Connect with fitness trackers and health devices
- **Emergency Response**: Enhanced emergency detection and contact system

### Future Vision
- **Predictive Health Insights**: AI-powered health risk assessments
- **Clinical Trial Matching**: Find relevant research studies
- **Community Health**: Anonymous health insights from the community
- **Multi-language Support**: Healthcare access for diverse populations

## 📊 Development Status

| Stage | Status | Description |
|-------|--------|-------------|
| Stage 1 | ✅ Complete | Foundation & Basic Medical Chat |
| Stage 1C | 🔄 Pending | Automated Testing Suite |
| Stage 2 | 📅 Planned | Cloud Integration with Privacy |
| Stage 3 | 📅 Planned | Medical Context & RAG |
| Stage 4 | 📅 Planned | Enhanced Features |

## 📖 Documentation

- [QUICK_START.md](./QUICK_START.md) - Detailed setup instructions
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Database migration guide
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Testing approach and scenarios
- [devplan.md](./devplan.md) - Comprehensive development roadmap
- [CLAUDE.md](./CLAUDE.md) - AI assistant integration guide

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui, Radix UI, motion-primitives
- **AI Integration**: Vercel AI SDK, LM Studio, OpenRouter
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Security**: Helmet.js, CSRF tokens, Rate limiting

## 🧪 Testing

The testing suite (Stage 1C) is currently being implemented. It will include:

- Security penetration testing
- Medical conversation quality assessment
- Load testing (10+ concurrent users)
- Performance benchmarking (26+ tokens/sec)
- Privacy verification tests

Run tests with:
```bash
npm run test
npm run test:health      # LM Studio health check
npm run test:lm-studio   # LM Studio model verification
```

## ⚠️ Important Disclaimers

### Medical Disclaimer
**WellnessAI is not a replacement for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

### Privacy Notice
- When using local models, your data stays on your device
- Cloud features (Stage 2+) will include privacy abstraction
- Use test data only during development
- Real health data requires proper security measures

### Development Status
This is a beta release. The codebase is actively evolving and may change significantly between versions.

## 🤝 Contributing

We welcome contributions! Please ensure:
- All medical features include appropriate disclaimers
- Security best practices are followed
- Privacy is maintained as the top priority
- Tests are written for new features

## 📜 License

Apache License 2.0 - See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built on [Zola](https://github.com/ibelick/zola) by [@ibelick](https://github.com/ibelick)
- [LM Studio](https://lmstudio.ai) for local AI capabilities
- [Supabase](https://supabase.com) for backend infrastructure
- [Vercel](https://vercel.com) for hosting and AI SDK

## 🔗 Links

- [Website](https://wellnessai.health) (coming soon)
- [Original Zola Project](https://github.com/ibelick/zola)
- [WholisticAI Organization](https://github.com/vincenthopf/WholisticAI)

---

<p align="center">
  <strong>Your Health. Your Privacy. Your AI Assistant.</strong>
</p>