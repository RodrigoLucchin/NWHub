# 🏛️ NWDrones - Asset Management System

Complete and independent application for managing assets and heritage of NWDrones.

## 📦 Repository

**GitHub**: [https://github.com/Mauro-A-F-S-Filho/potato-project](https://github.com/Mauro-A-F-S-Filho/potato-project)  
**Branch**: `patrimonio`  
**Direct Link**: [https://github.com/Mauro-A-F-S-Filho/potato-project/tree/patrimonio](https://github.com/Mauro-A-F-S-Filho/potato-project/tree/patrimonio)

## 🎯 Overview

A React application with Supabase backend developed for:
- ✅ Managing and controlling all company assets
- ✅ Enforcing mandatory asset acceptance with responsibility terms
- ✅ Tracking transfers between responsible parties
- ✅ Maintaining complete audit trail of all operations
- ✅ Generating reports and analytics

## 📋 Key Features

### 🎯 Asset Management System
- **Blocking Modal** - Forces asset acceptance with responsibility terms
- **Asset Listing** - View all registered heritage items
- **Advanced Filters** - Filter by status, responsible, category, etc.
- **Asset Transfer** - Transfer assets between users
- **Audit Trail** - Complete tracking with IP, User Agent and timestamp

### 📊 Dashboard
- General asset statistics
- Pending asset alerts
- Responsibility summary

### 🔐 Security
- Integrated audit of all actions
- User IP tracking
- Browser User Agent registration
- Mandatory responsibility terms

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://bafrycswsdnprbpfpxth.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnJ5Y3N3c2RucHJicGZweHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTYwOTYsImV4cCI6MjA3MTc5MjA5Nn0.gYohah5ZUQs-7l24Kk9TAVXD78ZfcVO2U_KPiEWkc8A
```

### 3. Configure Database
1. Open [Supabase Console](https://app.supabase.com/project/bafrycswsdnprbpfpxth/sql)
2. Create a new query
3. Execute the `SUPABASE_SETUP.sql` script

### 4. Run Locally
```bash
npm run dev
```

Access: **http://localhost:5174**

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx                 # Application header
│   ├── ModalAtivosP.jsx           # Asset acceptance modal
│   ├── ModalAtivosP.css           # Modal styles
│   └── ThemeModal.jsx             # Theme selector
├── pages/
│   ├── Patrimonio.jsx             # Main asset page
│   └── Patrimonio.css             # Page styles
├── lib/
│   ├── supabase.js                # Supabase client configuration
│   ├── auditoria.js               # Audit system
│   ├── termoResponsabilidade.js   # Terms manager
│   └── patrimonio.exemplos.js     # Example data
├── assets/                        # Icons and images
├── images/                        # Logos and favicons
├── App.jsx                        # Root component
├── App.css                        # Global styles
└── main.jsx                       # Entry point
```

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3+ | UI Framework |
| Vite | 5.4+ | Build tool and dev server |
| Supabase | 2.90+ | Backend and Database |
| Node.js | 14+ | Runtime environment |

## 📊 Database Schema

### Main Tables

#### `ativos` (Assets)
```sql
id              - UUID primary key
tipo            - VARCHAR (Drone, Battery, Charger, etc)
modelo          - VARCHAR
num_etiqueta    - VARCHAR unique
descricao       - TEXT
status          - ENUM (ACTIVE, INACTIVE, DAMAGED, LOST)
data_cadastro   - TIMESTAMP
```

#### `atribuicoes` (Attributions/Assignments)
```sql
id              - UUID primary key
ativo_id        - UUID (FK to ativos)
usuario_id      - INTEGER
status_aceite   - ENUM (PENDING, ACCEPTED, REJECTED)
data_entrega    - TIMESTAMP
data_devolucao  - TIMESTAMP (optional)
data_aceite     - TIMESTAMP (optional)
ip_usuario      - VARCHAR
user_agent      - VARCHAR (optional)
```

#### `auditoria` (Audit Log)
```sql
id              - UUID primary key
acao            - VARCHAR (action)
tabela          - VARCHAR (affected table)
usuario_id      - INTEGER
ip              - VARCHAR
user_agent      - VARCHAR
detalhes        - JSONB (action details)
data_acao       - TIMESTAMP
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server at http://localhost:5174

# Production
npm run build        # Create optimized production build in dist/
npm run preview      # Preview production build locally

# Maintenance
npm audit           # Check for security vulnerabilities
npm audit fix       # Auto-fix vulnerabilities (non-breaking)
```

## 🔐 Security Features

### Environment Variables
- ✅ Stored in `.env.local` (never commit)
- ✅ Only public Supabase credentials included
- ✅ Use `.env.example` as template

### Audit Trail
- ✅ User IP address recorded
- ✅ Browser User Agent captured
- ✅ Timestamp for all actions
- ✅ Responsible user ID logged
- ✅ Action details in JSON format

### Responsibility Modal
- ✅ Mandatory term acceptance
- ✅ Blocks application access until accepted
- ✅ Permanent database record
- ✅ Can be used as legal evidence

## 🐛 Troubleshooting

### Error: "Cannot find module '@vitejs/plugin-react'"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: "VITE_SUPABASE_URL is not defined"
```bash
# Verify .env.local exists in project root
cat .env.local

# File should contain:
# VITE_SUPABASE_URL=https://bafrycswsdnprbpfpxth.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Error: "Failed to resolve import 'react-router-dom'"
```bash
# This project doesn't use react-router-dom
# Reinstall dependencies
npm install
```

### Modal doesn't appear / Page shows blank
```bash
# 1. Open browser console (F12) and check for errors
# 2. Verify Supabase connection with correct URL and API key
# 3. Check that atribuicoes table has data with status_aceite = 'PENDING'
# 4. Verify .env.local has correct values
```

### Supabase connection errors
```bash
# Verify credentials in .env.local are correct:
VITE_SUPABASE_URL=https://bafrycswsdnprbpfpxth.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Restart dev server after updating .env.local
npm run dev
```

## 📊 Project Status

| Feature | Status | Details |
|---------|--------|---------|
| Asset Listing | ✅ Ready | Full display with filters |
| Blocking Modal | ✅ Ready | Mandatory acceptance system |
| Transfer System | ✅ Ready | Between users |
| Audit Trail | ✅ Ready | IP, User Agent, Timestamp |
| Supabase Integration | ✅ Ready | Connected and working |
| UI/UX | ✅ Ready | Dark theme with responsive design |
| Production Build | ✅ Ready | Optimized and tested |

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run preview
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
# Build first
npm run build

# Then drag 'dist' folder to Netlify Drop
```

### Deploy to Custom Server
```bash
# Build
npm run build

# Upload 'dist' folder to server
# Configure server to serve index.html for all routes
```

## 📞 Support & Documentation

For issues or questions:
1. Check browser console (F12) for error messages
2. Verify `.env.local` configuration is correct
3. Check Supabase console for data and table structure
4. Review `SUPABASE_SETUP.sql` script for database setup
5. Ensure `.env.local` is not committed to version control

## 🔄 Project Evolution

**Current Version**: 1.0.0  
**Last Updated**: 14/01/2026  
**Status**: ✅ Production Ready  
**Type**: Independent Asset Management Application

### What Was Done
- ✅ Separated from NWHub - now fully independent
- ✅ Consolidated documentation into single file
- ✅ Removed unnecessary dependencies
- ✅ Simplified component structure
- ✅ Integrated with Supabase
- ✅ Added complete audit trail system

### Technology Stack
- React 18.3 for UI components
- Vite 5.4 for development and production builds
- Supabase 2.90 for backend and real-time database
- JavaScript ES6+ for application logic

## 📄 License

Property of NWDrones - 2026  
All rights reserved.

---

**Quick Reference**
```bash
npm install         # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

**Useful Links**
- [Supabase Console](https://app.supabase.com/project/bafrycswsdnprbpfpxth)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
