# Luna Sharpshooters Infantry — Official Website

React + Vite · Supabase (data) · Cloudinary (images) · Vercel (host) · GitHub (code)

---

## 🔐 Account Roles

| Role     | Permissions |
|----------|-------------|
| `viewer` | Browse public pages — home, about, brigades, operations, gallery |
| `member` | All viewer access + locked Manuals + **upload images to gallery** |
| `staff`  | All member access + click-to-edit text + create/edit/delete posts + **delete gallery images** |
| `admin`  | All staff access + manage user roles at `/admin` |

---

## 📄 Pages

| Page | Access |
|------|--------|
| `/`, `/about`, `/brigades`, `/academy`, `/command`, `/schedule` | Public |
| `/operations` | Public (staff can create/edit posts) |
| `/gallery` | Public read · Member/Staff upload · Staff delete |
| `/manuals/pi`, `/manuals/handbook`, `/manuals/uniforms` | 🔒 Member+ |
| `/admin` | 🔒 Admin only |

---

## 🚀 Setup

### 1. Supabase
1. New project at [supabase.com](https://supabase.com)
2. SQL Editor → run `supabase/schema.sql`
3. Settings → API → copy **Project URL** and **anon key**

### 2. Cloudinary
1. Si gn up at [cloudinary.com](https://cloudinary.com) (free tier is plenty)
2. Dashboard → your **Cloud Name** (e.g. `dxyz1234`)
3. Settings → Upload → **Upload Presets** → Add unsigned preset
   - Name it: `lsi_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `lsi` (optional)
   - Save

### 3. Local Dev
```bash
git clone https://github.com/YOUR/lsi-website
cd lsi-website
npm install
cp .env.example .env
# Fill in all 4 values:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   VITE_CLOUDINARY_CLOUD_NAME
#   VITE_CLOUDINARY_UPLOAD_PRESET
npm run dev
```

### 4. GitHub
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOUR/lsi-website.git
git push -u origin main
```

### 5. Vercel
1. New Project → import GitHub repo
2. Add all 4 env vars from `.env.example`
3. Deploy → auto-deploys on every push
4. Copy Vercel URL → paste into Supabase Auth → Settings → Site URL

### 6. First Admin
1. Sign up on the live site
2. Supabase → Table Editor → `profiles` → change your `role` to `admin`
3. Manage other users at `/admin`

---

## 🖼 Image Uploads (Cloudinary)

All images — gallery uploads and post cover images — go to Cloudinary.
- Gallery: **members and staff** can upload. Only **staff/admin** can delete.
- Post covers: **staff/admin** only (post creation is staff-gated).
- Images are stored under the `lsi/` folder in your Cloudinary account.
- Supabase only stores the final `https://res.cloudinary.com/...` URL.

No Supabase Storage bucket needed at all.

---

## ✏️ Staff Editing
When signed in as staff/admin a gold bar shows:
> ✏️ Staff Mode — Click any text to edit it

Click any paragraph → inline editor → **Ctrl+Enter** to save.

---

## 📁 Structure
```
src/
├── lib/
│   ├── supabase.js       ← Supabase client
│   ├── cloudinary.js     ← uploadToCloudinary(file) helper
│   └── useContent.js     ← Editable content hook
├── components/
│   ├── EditableText.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Admin.jsx
│   ├── InfoPages.jsx
│   ├── Operations.jsx    ← Posts list + detail + editor
│   └── gallery/
│       └── Gallery.jsx   ← Masonry + lightbox + Cloudinary upload
│   └── manuals/
│       └── Manuals.jsx
supabase/schema.sql
.env.example
```
