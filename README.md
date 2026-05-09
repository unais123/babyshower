# 👶 Premium Baby Shower Voting App

A high-end, real-time voting application designed for baby shower events. Guests can scan a QR code, predict the baby's gender, and watch results update live on a big screen with cinematic animations.

## ✨ Features

- **Mobile-First Voting**: Optimized for guests to vote quickly from their smartphones.
- **Real-time Live Results**: Dynamic split-screen "VS" view for projectors, featuring live percentage updates and confetti bursts.
- **Admin Dashboard**: Full control over votes, guest list, data export (CSV), and the "Grand Reveal" celebration trigger.
- **Device Fingerprinting**: Prevents duplicate votes from the same device.
- **Premium Aesthetics**: Glassmorphism UI, smooth Framer Motion animations, and custom luxury typography.

## 🚀 Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Backend**: Supabase (Real-time PostgreSQL)
- **Icons**: Lucide React
- **Celebration**: Canvas Confetti

## 🛠️ Setup Instructions

### 1. Supabase Backend
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase_setup.sql`.
3. Enable **Realtime** for the `votes` table in Database > Replication.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
npm run dev
```

## 📱 Pages

- `/` : **Voting Page** (The QR landing page for guests).
- `/live` : **Live Results** (The projection screen for the venue).
- `/admin` : **Admin Dashboard** (Management and Grand Reveal control).

## 📄 License
MIT
