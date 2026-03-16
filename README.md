# InvoTrack — Invoice & Expense Tracker (Core PHP + React)

Full-stack billing system. **No Laravel. No framework. Pure PHP + MySQL.**

---

## Tech Stack

| Part      | Technology                        |
|-----------|-----------------------------------|
| Backend   | Core PHP 8.1, PDO, no framework   |
| Database  | MySQL (via WAMP)                  |
| PDF       | TCPDF (1 composer package)        |
| Email     | PHPMailer (1 composer package)    |
| Frontend  | React 18 + Vite                   |
| Charts    | Recharts                          |

---

## Folder Structure

```
invoice-tracker/
├── backend/
│   ├── api/
│   │   ├── auth/        → register.php, login.php, me.php
│   │   ├── clients/     → index.php
│   │   ├── invoices/    → index.php, send.php, pdf.php
│   │   ├── payments/    → index.php
│   │   ├── expenses/    → index.php
│   │   ├── reports/     → index.php
│   │   └── dashboard/   → index.php
│   ├── config/
│   │   └── database.php ← EDIT THIS FILE (DB credentials)
│   ├── core/
│   │   ├── DB.php       ← PDO database helper
│   │   ├── Auth.php     ← Token authentication
│   │   ├── Request.php  ← Input handling
│   │   └── Response.php ← JSON responses
│   ├── helpers/
│   │   └── mailer.php   ← PHPMailer wrapper
│   ├── templates/
│   │   ├── pdf/invoice.php
│   │   └── email/invoice.php, overdue.php
│   ├── cron/
│   │   └── send_reminders.php
│   ├── bootstrap.php    ← CORS + autoloader
│   ├── composer.json
│   └── setup.sql        ← RUN THIS to create tables + demo data
└── frontend/
    ├── src/
    │   ├── pages/       ← All React pages
    │   ├── components/  ← Layout/Sidebar
    │   ├── context/     ← Auth state
    │   └── lib/api.js   ← Axios client
    ├── package.json
    └── vite.config.js
```

---

## SETUP — Step by Step

### Step 1 — Copy project into WAMP

Copy the entire `invoice-tracker` folder into:
```
C:\wamp64\www\invoice-tracker\
```

After this you should have:
```
C:\wamp64\www\invoice-tracker\backend\
C:\wamp64\www\invoice-tracker\frontend\
```

### Step 2 — Create the database

1. Start WAMP (click the WAMP icon in system tray → Start All Services)
2. Open your browser → go to `http://localhost/phpmyadmin`
3. Click **New** in the left sidebar
4. Database name: `invoice_tracker`
5. Collation: `utf8mb4_unicode_ci`
6. Click **Create**

### Step 3 — Run the SQL setup file

1. In phpMyAdmin, click `invoice_tracker` in the left sidebar
2. Click the **SQL** tab at the top
3. Open `backend/setup.sql` in Notepad, copy ALL the content
4. Paste it into the SQL text box in phpMyAdmin
5. Click **Go**

You should see all tables created and demo data inserted.

### Step 4 — Edit database config (if needed)

Open `backend/config/database.php` in Notepad or VS Code:

```php
define('DB_HOST',  'localhost');
define('DB_NAME',  'invoice_tracker');
define('DB_USER',  'root');
define('DB_PASS',  '');        // WAMP default is empty password
```

If your WAMP MySQL has a different username or password, change it here.

### Step 5 — Install PHP packages (Composer)

Open Command Prompt or PowerShell:

```powershell
cd C:\wamp64\www\invoice-tracker\backend
composer install
```

This installs 2 packages: PHPMailer and TCPDF.
Takes about 2-3 minutes. You'll see a `vendor/` folder appear.

### Step 6 — Install frontend packages (Node.js)

Open a NEW terminal window:

```powershell
cd C:\wamp64\www\invoice-tracker\frontend
npm install
```

Takes 1-3 minutes. You'll see a `node_modules/` folder appear.

### Step 7 — Start the frontend dev server

In the same terminal (frontend folder):

```powershell
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### Step 8 — Open the app

Open your browser and go to:
```
http://localhost:5173
```

Login with:
- **Admin:** admin@demo.com / password
- **Staff:** staff@demo.com / password

---

## Every time you want to run the project

1. Start WAMP (system tray → green icon → Start All Services)
2. Open terminal → `cd frontend` → `npm run dev`
3. Open browser → `http://localhost:5173`

WAMP (Apache + MySQL) handles the PHP backend automatically.
You only need `npm run dev` for the React frontend.

---

## Email Setup (Optional — for sending invoices)

1. Go to https://mailtrap.io → sign up free
2. Dashboard → Email Testing → My Inbox → Show Credentials
3. Open `backend/config/database.php` and fill in:

```php
define('MAIL_HOST', 'sandbox.smtp.mailtrap.io');
define('MAIL_PORT', 2525);
define('MAIL_USER', 'your_username');
define('MAIL_PASS', 'your_password');
```

4. Now when you click "Send to Client" on any invoice,
   the email will appear in your Mailtrap inbox.

---

## Cron Job — Automatic Overdue Reminders

Run this manually to test:
```powershell
cd C:\wamp64\www\invoice-tracker\backend
php cron/send_reminders.php
```

For production server (Linux), add to crontab:
```
0 9 * * * php /var/www/html/invoice-tracker/backend/cron/send_reminders.php
```

---

## Demo Credentials

| Role  | Email          | Password |
|-------|----------------|----------|
| Admin | admin@demo.com | password |
| Staff | staff@demo.com | password |

---

## Resume Bullet Point

> Built a full-stack Invoice & Expense Tracker using Core PHP (PDO, custom MVC-style architecture, token-based auth), MySQL, PHPMailer, TCPDF, and React with Recharts — featuring invoice CRUD with line items, PDF generation, client email dispatch, automatic overdue reminders via cron, role-based access control, and a revenue analytics dashboard.
