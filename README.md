# Xamaricash

Xamaricash is a premium cashbook and expense tracker web application built with a stunning glassmorphism design aesthetic. It enables users to manage multiple books/ledgers, track their daily incomes and expenses, and visualize their financial trends.

## Features
- **Authentication**: Secure login/registration through Supabase Auth.
- **Multi-Book System**: Mange multiple independent cashbooks with custom currencies.
- **Glassmorphic Design**: Modern, interactive UI using Tailwind CSS Backdrop utilities and gradients.
- **Dashboard & Analytics**: Track expense breakdown and weekly summaries using Recharts.
- **Cloud Sync**: Realtime synchronization to Supabase PostgreSQL database.
- **Data Export**: Export your entire financial data offline.

## Tech Stack
- React 18 (Vite)
- TypeScript
- Tailwind CSS & Headless UI
- Zustand (State management)
- Supabase (Auth, Postgres, Realtime)
- Recharts (Data visualization)
- React Hook Form + Yup (Validation)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Supabase Setup**
   - Head over to the Supabase Console and create a new project.
   - Open the **SQL Editor** in your Supabase dashboard.
   - Run the contents of the `supabase_schema.sql` file provided in this repository. This script will automatically create the required `users`, `books`, and `transactions` tables, along with all security policies (RLS).
   - Ensure you enable Email/Password authentication in the Auth settings.

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Deployment
The app is ready to be deployed to Vercel, Netlify, or your preferred hosting provider.
Ensure you add the environment variables in your hosting provider's dashboard before deploying.
