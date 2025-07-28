# 🛒 DevMart – The Developer Code Marketplace

**DevMart** is a modern, full-stack code marketplace where developers can **upload**, **sell**, and **buy** ready-to-use code snippets, tools, and full-stack applications. Built for creators who want to monetize their work and coders who need quick, reliable code solutions.

---

## 🚀 Features

- 🔐 **Authentication**
  - Secure login with email and Google OAuth (Passport.js)
- 📦 **Project Uploads**
  - Upload source code files with descriptions and tags
- 💳 **Stripe Integration**
  - Accept payments for paid projects securely
- 🧾 **Purchase Access**
  - Logged-in users can purchase and access project downloads
- 📁 **File Uploading**
  - Files managed securely using Multer
- ✅ **Validation & Security**
  - Schema validation with Zod + secure session-based access
- 🗂️ **Organized Dashboard**
  - View your purchases, uploads, and messages in one place

---

## 🧱 Tech Stack

| Frontend      | Backend        | Database      | Authentication    | Payments |
|---------------|----------------|----------------|--------------------|----------|
| React (Next.js) | Node.js (Express) | PostgreSQL     | Passport.js + JWT + Google OAuth | Stripe   |

**Libraries & Tools Used:**
- 🧰 TailwindCSS, Radix UI – Beautiful & responsive UI components
- 🔄 Prisma or Drizzle ORM – Clean, scalable database access
- 📂 Multer – File upload handling
- 🔐 Zod – Schema validation

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/devmart.git
   cd devmart
