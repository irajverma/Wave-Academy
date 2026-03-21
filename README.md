# 🌊 Wave Academy

> **Expert Coaching for Classes 5–12, NDA, CUET & Sainik School**

A full-stack educational platform for Wave Academy — featuring a public-facing website for students and a private admin panel for teachers to manage courses, enrollments, test results, faculty profiles, and testimonials.

---

## 🚀 Live Features

### Public Website
- **Home Page** — Hero, stats, courses overview, faculty section, testimonials, CTA
- **Courses Page** — Dynamically fetched from Supabase with category grouping
- **Student Results** — Look up test results by student name
- **Enroll** — Enrollment form that saves to Supabase
- **Contact** — Contact form with Supabase storage

### Admin Panel (`/admin`)
| Section | Features |
|---|---|
| Overview | Dashboard with key stats |
| Courses | Add / Edit / Delete courses with categories & features |
| Enrollments | View all student enrollments |
| Contacts | View all contact form submissions |
| Test Results | Add individual results + **Bulk Excel Upload** + Download Template |
| Testimonials | Add / Edit / Delete student testimonials shown on homepage |
| Faculty | Add teacher profiles with photo upload, qualifications & achievements |
| Banners | Manage homepage hero banners |
| Settings | Site-wide settings |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| Data Fetching | TanStack React Query |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime DB | Firebase Firestore (testimonials, faculty, banners) |
| Icons | Lucide React |
| Charts | Recharts |
| Excel | xlsx library |
| Notifications | Sonner |

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/wave-academy.git
cd wave-academy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example file and fill in your credentials:
```bash
cp .env.example .env
```

Open `.env` and add your Supabase keys:
```env
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ **Never commit `.env` to Git.** It is already in `.gitignore`.

### 4. Set up Firebase
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable **Firestore Database**
- Update your credentials in the `.env` file using the keys from `.env.example`. The app is configured to read these securely.

### 5. Run the development server
```bash
npm run dev
```
Visit [http://localhost:8080](http://localhost:8080)

---

## 🗄️ Supabase Tables

The following tables are used in Supabase:

| Table | Purpose |
|---|---|
| `courses` | Course catalog (title, category, price, features, is_active) |
| `enrollments` | Student enrollments (name, phone, course, class) |
| `contacts` | Contact form submissions |
| `test_results` | Individual student test results (name, subject, score, total) |

Run the SQL migrations in `/supabase/migrations/` in order to set up the schema.

---

## 🔥 Firebase Collections

| Collection | Purpose |
|---|---|
| `testimonials` | Student testimonials shown on homepage |
| `faculty` | Teacher profiles (name, subject, photo, achievements) |
| `banners` | Hero banner images and text |

---

## 📁 Project Structure

```
src/
├── assets/          # Static images
├── components/      # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom hooks (useAuth, etc.)
├── integrations/    # Supabase client setup
├── lib/             # Firebase client setup
├── pages/
│   ├── admin/       # All admin panel pages
│   └── *.tsx        # Public pages
├── scripts/         # One-time seed scripts
└── App.tsx          # Router & layout
```

---

## 🔐 Admin Access

The admin panel is at `/admin`. Only authenticated users with admin privileges can access it.

To create an admin account:
1. Sign up via Supabase Auth
2. In Supabase SQL Editor, run:
   ```sql
   INSERT INTO public.admin_users (user_id) VALUES ('<your-user-uuid>');
   ```

---

## 📊 Bulk Test Result Upload (Excel)

1. Go to Admin → Test Results
2. Click **Download Template** to get the correct Excel format
3. Fill in: `Name`, `Test`, `Subject`, `Score`, `Total`, `Date`
4. Click **Bulk Upload** and select your filled file

---

## 📄 License

MIT © Wave Academy
