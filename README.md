# 🎓 SchoolGate — Student Arrival Alert System

A real-time school arrival tracking system that scans QR codes on students' bags/tags and instantly notifies parents via **WhatsApp** or **SMS** using Twilio.

---

## ✨ Features

- **QR Code Scanning** — Uses the device camera to scan student QR tags
- **Instant Parent Notifications** — WhatsApp messages and/or SMS via Twilio
- **Student Management** — Add, edit, and delete students with parent contacts
- **QR Code Generation & Download** — Print-ready QR codes for each student
- **Attendance Log** — Real-time log of all arrivals with notification status
- **Dashboard** — Live stats, arrival rate, and recent arrivals
- **Duplicate Prevention** — Won't send duplicate alerts for the same student on the same day

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd school-arrival-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_SMS_FROM=+1XXXXXXXXXX
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SCHOOL_NAME=Greenfield Academy
NOTIFICATION_CHANNEL=whatsapp
```

### 3. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📱 Setting Up Twilio

### SMS
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a phone number → copy it to `TWILIO_SMS_FROM`
3. Copy your **Account SID** and **Auth Token** from the Console dashboard

### WhatsApp (Sandbox for testing)
1. In Twilio Console → Messaging → Try WhatsApp
2. The sandbox number is `whatsapp:+14155238886`
3. Have parents send `join <word>` to the sandbox number to opt in
4. Set `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`

### WhatsApp (Production)
1. Apply for a WhatsApp Business Account via Twilio
2. Once approved, use your approved number as `TWILIO_WHATSAPP_FROM`

---

## 📋 How to Use

### Step 1: Add Students
- Go to **Students** → **Add Student**
- Fill in the student's name, grade, parent's name and phone number
- Choose notification channel (WhatsApp, SMS, or Both)

### Step 2: Print QR Codes
- On any student card, click **View QR Code**
- Click **Download** to save the QR code image
- Print and laminate — attach to the student's school bag or ID tag

### Step 3: Scan on Arrival
- Go to **Scan QR** (best done on a tablet/phone at the school gate)
- Point the camera at the student's QR code
- The system records the arrival and sends a notification to the parent automatically

### Step 4: Monitor Attendance
- **Dashboard** shows live stats and today's progress
- **Attendance** shows a detailed log of all arrivals with notification status

---

## 🏗️ Architecture

```
school-arrival-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── scanner/page.tsx      # QR Scanner
│   │   ├── students/page.tsx     # Student CRUD
│   │   ├── attendance/page.tsx   # Attendance log
│   │   └── api/
│   │       ├── students/         # CRUD API
│   │       ├── scan/             # Scan + notify API
│   │       ├── attendance/       # Attendance log API
│   │       └── qr/[id]/          # QR code PNG generator
│   ├── components/
│   │   ├── QRScanner.tsx         # Camera-based QR scanner
│   │   └── StudentForm.tsx       # Add/edit student modal
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── db.ts                 # JSON file-based data store
│       └── notify.ts             # Twilio notification service
└── .data/                        # Auto-created data directory
    ├── students.json
    └── attendance.json
```

---

## 🔧 Production Deployment

### Database
Replace `.data/*.json` with a real database. Recommended options:
- **PostgreSQL** with Prisma ORM
- **MongoDB** with Mongoose
- **PlanetScale** (MySQL-compatible, serverless)

### Hosting
- **Vercel** (recommended for Next.js) — `vercel deploy`
- **Railway** — supports persistent file storage
- **DigitalOcean App Platform**

> ⚠️ Note: The JSON file store won't work on serverless platforms (Vercel/Netlify). Switch to a database before deploying to production.

### Environment Variables
Set all `.env.local` variables in your hosting platform's dashboard.

---

## 🛡️ Security Notes

- Add authentication (e.g. NextAuth.js) to protect the admin interface
- Validate and sanitize all phone numbers before sending to Twilio
- Consider rate limiting the `/api/scan` endpoint
- Store sensitive env vars securely — never commit `.env.local`

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `html5-qrcode` | Camera-based QR code scanning |
| `qrcode` | Server-side QR code image generation |
| `twilio` | SMS and WhatsApp notifications |
| `uuid` | Unique student ID generation |
| `date-fns` | Date formatting |
| `lucide-react` | Icons |
