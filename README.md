# Bullivants AI Fluency Workshop Survey

A professional pre-workshop survey app with real-time results dashboard.

## Quick Start (15-20 minutes total)

### Step 1: Create a Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) and sign up/log in (free tier is fine)
2. Click **New Project**
3. Name it something like `bullivants-survey`
4. Set a database password (save this somewhere)
5. Choose a region close to you (Sydney)
6. Click **Create new project** and wait ~2 minutes

### Step 2: Create the Database Table (3 min)

1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this SQL and click **Run**:

```sql
-- Create the survey responses table
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Survey questions
  copilot_frequency TEXT,
  copilot_use_cases TEXT,  -- JSON array stored as text
  used_chatgpt TEXT,
  prompt_knowledge TEXT,
  ai_mistakes TEXT,
  hallucination_knowledge TEXT,
  learning_interest TEXT,  -- JSON array stored as text
  barriers TEXT,
  department TEXT
);

-- Enable Row Level Security but allow public inserts (anonymous survey)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit survey)
CREATE POLICY "Allow public inserts" ON survey_responses
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anyone to read (for dashboard - we protect with app password)
CREATE POLICY "Allow public reads" ON survey_responses
  FOR SELECT TO anon
  USING (true);
```

4. You should see "Success" message

### Step 3: Get Your API Keys (1 min)

1. In Supabase, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (under Project API keys)

### Step 4: Deploy to Vercel (5 min)

#### Option A: Via GitHub (Recommended)

1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your GitHub repo
5. Before deploying, click **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
6. Click **Deploy**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# In this project folder
vercel

# Add environment variables when prompted, or add them in the Vercel dashboard after
```

### Step 5: Test It!

- **Survey**: Go to your Vercel URL (e.g., `https://bullivants-survey.vercel.app`)
- **Dashboard**: Go to `/dashboard` or add `#dashboard` to the URL
  - Password: `bullivants2024` (change this in `App.jsx` line 22 if needed)

---

## URLs to Share

| Purpose | URL |
|---------|-----|
| Survey (for attendees) | `https://your-app.vercel.app` |
| Dashboard (for you) | `https://your-app.vercel.app#dashboard` |

---

## Customization

### Change Dashboard Password
Edit `App.jsx` line 22:
```javascript
const DASHBOARD_PASSWORD = 'your-new-password';
```

### Add/Edit Questions
Edit the `questions` array in `App.jsx` starting at line 12.

### Change Branding Colors
Edit `index.css` CSS variables at the top:
```css
:root {
  --primary: #1e3a5f;      /* Main brand color */
  --accent: #e67e22;       /* Accent/highlight color */
  /* ... */
}
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Then edit .env with your actual values

# Run locally
npm run dev
```

---

## Troubleshooting

**Survey submissions aren't saving:**
- Check browser console for errors
- Verify your Supabase URL and key are correct in Vercel env vars
- Make sure the SQL table was created successfully

**Dashboard shows 0 responses:**
- Make sure you've submitted at least one test survey
- Check that the Supabase read policy was created

**Can't access dashboard:**
- Use the correct URL: `yoursite.vercel.app#dashboard`
- Password is `bullivants2024` (case-sensitive)

---

## Data Export

To export responses as CSV:
1. Go to Supabase Dashboard → Table Editor → survey_responses
2. Click the **Export** button (top right)
3. Choose CSV format

Or run this SQL in the SQL Editor:
```sql
SELECT * FROM survey_responses ORDER BY created_at DESC;
```
Then click "Download CSV"
