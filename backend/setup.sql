-- ============================================================
--  InvoTrack — Full Database Setup
--  Run this in phpMyAdmin → SQL tab, or via mysql CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS invoice_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE invoice_tracker;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('admin','staff','client') NOT NULL DEFAULT 'admin',
    company_name VARCHAR(255),
    phone        VARCHAR(20),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Auth tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    phone        VARCHAR(20),
    company_name VARCHAR(255),
    address      TEXT,
    gst_number   VARCHAR(20),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    client_id      INT NOT NULL,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    status         ENUM('draft','sent','partially_paid','paid','overdue') NOT NULL DEFAULT 'draft',
    issue_date     DATE NOT NULL,
    due_date       DATE NOT NULL,
    subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_percent    DECIMAL(5,2)  NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
    total          DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    terms          TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id  INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity    DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal    DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id  INT NOT NULL,
    amount      DECIMAL(12,2) NOT NULL,
    paid_at     DATETIME NOT NULL,
    method      ENUM('cash','bank_transfer','upi','cheque','card','other') NOT NULL DEFAULT 'bank_transfer',
    reference   VARCHAR(255),
    notes       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    category     VARCHAR(100) NOT NULL,
    amount       DECIMAL(12,2) NOT NULL,
    description  VARCHAR(500) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url  VARCHAR(500),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
--  DEMO DATA
-- ============================================================

-- Demo admin user (password: password)
INSERT INTO users (name, email, password, role, company_name, phone) VALUES
('Dhananjay Kumar', 'admin@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'DK Tech Solutions', '+91 7492057006'),
('Priya Sharma',    'staff@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff', NULL, NULL);

-- Demo clients
INSERT INTO clients (user_id, name, email, phone, company_name, address) VALUES
(1, 'Ravi Mehta',  'ravi@techcorp.in',    '+91 9876543210', 'TechCorp India', '101 BKC, Mumbai'),
(1, 'Sneha Patel', 'sneha@designhub.com', '+91 9123456789', 'Design Hub',     '22 Koramangala, Bangalore'),
(1, 'Ankit Gupta', 'ankit@startup.io',    '+91 9988776655', 'StartUp.io',     '5 Cyber City, Gurgaon'),
(1, 'Meera Joshi', 'meera@ecomstore.in',  '+91 9001234567', 'EcomStore',      '88 T Nagar, Chennai');

-- Demo invoices
INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_percent, tax_amount, total, notes, terms) VALUES
(1, 1, 'INV-2024-0001', 'paid',           DATE_SUB(CURDATE(),INTERVAL 60 DAY), DATE_SUB(CURDATE(),INTERVAL 30 DAY), 38135.59, 18, 6864.41, 45000, 'Thank you for your business.', 'Payment due within 30 days.'),
(1, 2, 'INV-2024-0002', 'sent',           DATE_SUB(CURDATE(),INTERVAL 20 DAY), DATE_ADD(CURDATE(),INTERVAL 10 DAY), 24152.54, 18, 4347.46, 28500, 'Thank you for your business.', 'Payment due within 30 days.'),
(1, 3, 'INV-2024-0003', 'overdue',        DATE_SUB(CURDATE(),INTERVAL 45 DAY), DATE_SUB(CURDATE(),INTERVAL 15 DAY), 52542.37, 18, 9457.63, 62000, 'Thank you for your business.', 'Payment due within 30 days.'),
(1, 4, 'INV-2024-0004', 'partially_paid', DATE_SUB(CURDATE(),INTERVAL 30 DAY), DATE_ADD(CURDATE(),INTERVAL 0 DAY),  15254.24, 18, 2745.76, 18000, 'Thank you for your business.', 'Payment due within 30 days.'),
(1, 1, 'INV-2024-0005', 'draft',          CURDATE(),                            DATE_ADD(CURDATE(),INTERVAL 30 DAY), 29661.02, 18, 5338.98, 35000, 'Draft invoice.',               'Payment due within 30 days.');

-- Demo invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal) VALUES
(1, 'Web Development Services', 1, 26694.92, 26694.92),
(1, 'UI/UX Design',             1, 11440.68, 11440.68),
(2, 'Web Development Services', 1, 16906.78, 16906.78),
(2, 'UI/UX Design',             1,  7245.76,  7245.76),
(3, 'Web Development Services', 1, 36779.66, 36779.66),
(3, 'UI/UX Design',             1, 15762.71, 15762.71),
(4, 'Web Development Services', 1, 10677.97, 10677.97),
(4, 'UI/UX Design',             1,  4576.27,  4576.27),
(5, 'Web Development Services', 1, 20762.71, 20762.71),
(5, 'UI/UX Design',             1,  8898.31,  8898.31);

-- Payments for paid and partially_paid invoices
INSERT INTO payments (invoice_id, amount, paid_at, method, reference) VALUES
(1, 45000, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'bank_transfer', 'TXN847291'),
(4,  9000, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'upi',           'UPI938471');

-- Demo expenses
INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES
(1, 'Software',   2999,  'VS Code + GitHub Pro subscription',  DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 'Travel',     4500,  'Client visit to Pune',               DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(1, 'Office',     1200,  'Printer cartridges',                 DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
(1, 'Utilities',   850,  'Internet bill — Jio Fiber',          DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
(1, 'Marketing',  5000,  'LinkedIn Ads campaign',              DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(1, 'Software',   1499,  'Canva Pro subscription',             DATE_SUB(CURDATE(), INTERVAL 35 DAY)),
(1, 'Travel',     3200,  'Mumbai local travel — client meetings', DATE_SUB(CURDATE(), INTERVAL 40 DAY)),
(1, 'Office',     2500,  'Desk accessories',                   DATE_SUB(CURDATE(), INTERVAL 50 DAY)),
(1, 'Software',   3500,  'Adobe XD annual license',            DATE_SUB(CURDATE(), INTERVAL 55 DAY)),
(1, 'Marketing',  8000,  'Google Ads — Q4 campaign',           DATE_SUB(CURDATE(), INTERVAL 60 DAY)),
(1, 'Utilities',  1100,  'Electricity bill',                   DATE_SUB(CURDATE(), INTERVAL 65 DAY)),
(1, 'Travel',     6000,  'Delhi client trip — train + hotel',  DATE_SUB(CURDATE(), INTERVAL 70 DAY));
