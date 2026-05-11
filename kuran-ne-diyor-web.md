# Kuran Ne Diyor - Web (Next.js)

**Hedef**: React Native mobil uygulaması ile **tam feature parity** sağlayan Next.js web versiyonu
**Tech Stack**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Prisma Client, axios
**Backend**: Mevcut Node.js + Prisma + PostgreSQL (shared)
**Design**: Mobil app ile aynı renk paleti, aynı kalite, desktop-optimized responsive layout
**Deployment**: Vercel (recommended) veya self-hosted
**i18n**: 6 dil desteği (ar, en, tr, de, es, fr) - RTL support

---

## 🎨 Design System (Mobil App'ten Uyarlanmış)

### Renk Paleti

**Light Theme** (Primary):
```
- Background: #FAF8F5 (Warm Cream - açık krem)
- Text: #2D2D2D (Deep Gray - koyu gri)
- Card: #FFFFFF (White)
- Primary: #B69A73 (Sand/Gold - kum/altın tonu) ⭐
- Secondary: #8C7A6B (Muted Brown)
- Success: #6B8E6B (Green)
- Muted: #9A9386 (Light Gray)
- Border: #E8E4D9 (Subtle Beige)
```

**Dark Theme**:
```
- Background: #24221F (Deep Warm Brown/Black)
- Text: #F2EFE9 (Light Cream)
- Card: #2D2A26 (Darker Brown)
- Primary: #D4B88C (Lighter Sand)
- Secondary: #A39281 (Light Muted)
- Success: #82A882 (Light Green)
- Muted: #7A756D (Dim Gray)
- Border: #3D3934 (Subtle Border)
```

### Typography

- **Arabic Font**: Amiri (serif) - Google Fonts
  - Bold: Amiri_700Bold
  - Regular: Amiri_400Regular
  - Qur'an ayahs: size 42px, lineHeight 80px, centered, RTL
- **UI Font**: System (sans-serif)
  - Headings: 18-24px, fontWeight 600-700
  - Body: 14-16px, fontWeight 400-500
  - Meta: 12-14px, fontWeight 600

### Component Patterns (from Mobile)

```
AyahCard:
  - Arabic text (Amiri Bold 42px, centered, RTL)
  - Translation (18px, secondary color, centered)
  - Footer: metadata, audio player, comments badge, like count
  - Badge for comment/like counts

CommentSheet:
  - Flat list with thread expansion
  - Language filtering
  - Reply structure (indented)
  - Status indicators (PENDING/APPROVED/REJECTED)
  - Moderation reason display if rejected
  - Anonymous comment toggle

CollectionModal:
  - Create/Edit collection form
  - Add/Remove ayahs
  - Delete collection with confirmation

SearchResult:
  - Surah name + ayah number
  - Arabic preview (2 lines)
  - Translation preview (3 lines)
  - Favorite count with icon
  - Touch interaction

Progress/Scrubbing UI:
  - Vertical progress bar (right side on mobile → adapt for desktop)
  - Pill indicator showing current ayah number
  - Scale animation on interaction

DeleteWarningModal:
  - Confirmation dialog
  - "Don't ask again" checkbox
  - Two button options
```

### Icons

- Library: **lucide-react** (web equivalent of lucide-react-native)
- Common icons:
  - Home, BookOpen, Heart, Search, User, MessageSquare
  - Bell, Settings, LogOut, Trash2, Reply, Send
  - ChevronLeft, ChevronRight, Globe, Check, Star
  - All 24px size, dynamic color based on theme

---

## 📋 İş Çıkmazı

### Phase 1: Setup & Foundation
- [ ] **Project Init**: Next.js projesi oluştur (`create-next-app`)
  - TypeScript enabled
  - Tailwind CSS configured
  - ESLint setup
- [ ] **Environment Config**: `.env.local` ayarla
  - `NEXT_PUBLIC_API_URL` (backend API endpoint)
  - Database URL (if needed for SSR)
- [ ] **API Client**: axios/fetch wrapper oluştur
  - Base URL configuration
  - Auth token handling (JWT)
  - Error interceptors
- [ ] **Auth Context/Provider**: 
  - Login/Register logic
  - Token persistence (localStorage/cookies)
  - Protected routes middleware
  - User session management
- [ ] **Layout & Navigation**:
  - Main app layout (header, sidebar, responsive)
  - Navigation menu
  - Mobile-friendly responsive design

### Phase 2: Core Features - Kuran Display
- [ ] **Quran Data Integration**:
  - Fetch Quran data source (Surah, Ayah structure)
  - Decide: API endpoint vs. embedded JSON data
  - Caching strategy (ISR, SWR, React Query)
- [ ] **Home Page**:
  - Surah list view
  - Recently read tracking
  - Quick access shortcuts
  - Statistics display
- [ ] **Surah Page** (`/surah/[id]`):
  - Display all ayahs in surah
  - Ayah text (Arabic, Translation)
  - Tafsir/Explanation (if available)
  - Ayah-level actions (copy, share, bookmark)
- [ ] **Ayah Details Modal/Page**:
  - Full ayah information
  - Translation options
  - Related ayahs
  - Share functionality

### Phase 3: User Engagement Features
- [ ] **Favorites System**:
  - Save/Remove favorites
  - Favorites page view
  - Sync with backend (DB)
- [ ] **Collections/Bookmarks**:
  - Create custom collections
  - Add ayahs to collections
  - Edit/Delete collections
  - View collection contents
- [ ] **Search & Filter**:
  - Search by Surah name
  - Search by ayah content
  - Advanced filters (by Surah, by topic)
  - Search history
- [ ] **Statistics Dashboard**:
  - Reading progress
  - Total ayahs read
  - Favorite count
  - Collection stats
  - Achievements/Badges (if migrating from mobile)

### Phase 4: Comments & Community
- [ ] **Comments System**:
  - Display comments on ayahs
  - Add new comment (authenticated users)
  - Reply to comments
  - Comment moderation status display
  - Pagination/infinite scroll
- [ ] **User Comments Page** (`/my-comments`):
  - List user's own comments
  - Edit own comments
  - Delete own comments
  - Comment statistics
- [ ] **Comment Moderation Indicators**:
  - Show if comment is approved/pending/rejected
  - Display moderation reason (if rejected)

### Phase 5: User Account & Settings
- [ ] **User Profile Page** (`/profile`):
  - Display user info
  - Edit profile (username, email, language preference)
  - Avatar/User image
  - Account statistics
- [ ] **Settings Page** (`/settings`):
  - Language preference (ar, en, tr, de, es, fr)
  - Theme preference (light/dark mode)
  - Notification preferences
  - Privacy settings
  - Account actions (logout, delete account)
- [ ] **Login/Register Pages**:
  - Email/password auth form
  - Validation (frontend + backend)
  - Error handling
  - Success redirect
  - Remember me option
- [ ] **Authentication Flows**:
  - Protected page access
  - Redirect to login if unauthorized
  - Session persistence
  - Token refresh logic

### Phase 6: Advanced Features
- [ ] **Reading Progress Tracking**:
  - Track last read surah/ayah
  - Auto-save reading position
  - Resume reading functionality
  - Daily reading streak (if applicable)
- [ ] **Reporting System**:
  - Report inappropriate comments
  - Report form modal
  - Report status tracking
- [ ] **i18n (Internationalization)**:
  - Use locales from backend (ar, en, tr, de, es, fr)
  - Language switcher in settings
  - Translation files (copy from mobile if available)
  - RTL support for Arabic
- [ ] **Social Features**:
  - Share ayah (copy link, social media)
  - Share collections
  - Social meta tags (OG, Twitter)

### Phase 7: Performance & Polish
- [ ] **Performance Optimization**:
  - Image optimization (Next.js Image)
  - Code splitting
  - Route prefetching
  - Lazy loading for comments
  - Caching strategy (ISR, SWR)
- [ ] **SEO**:
  - Meta tags (title, description)
  - Sitemap generation
  - Canonical URLs
  - Open Graph tags
- [ ] **Error Handling**:
  - Error boundary components
  - 404 page
  - 500 error page
  - Toast notifications for errors
- [ ] **Mobile Responsiveness**:
  - Test on mobile browsers
  - Touch-friendly UI
  - Responsive images
  - Viewport optimization
- [ ] **Accessibility**:
  - ARIA labels
  - Keyboard navigation
  - Color contrast
  - Screen reader testing

### Phase 8: Testing & Deployment
- [ ] **Testing**:
  - Unit tests (components)
  - Integration tests (API calls)
  - E2E tests (user flows)
- [ ] **Deployment**:
  - Vercel setup (recommended)
  - Environment variables in production
  - Database connection pooling
  - Monitor performance metrics
  - Set up analytics
- [ ] **Post-Launch**:
  - Monitor errors (Sentry/similar)
  - User feedback collection
  - Performance monitoring
  - Bug fixes

---

## 📁 Proposed Directory Structure

```
kuran-ne-diyor-web/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── surah/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── favorites/
│   │   └── page.tsx
│   ├── collections/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── my-comments/
│   │   └── page.tsx
│   └── api/              # API routes if needed
│       └── ...
├── components/
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── AyahCard.tsx
│   ├── CommentSection.tsx
│   ├── CommentForm.tsx
│   ├── CollectionModal.tsx
│   ├── SearchBar.tsx
│   ├── UserCard.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useComments.ts
│   ├── useFavorites.ts
│   ├── useCollections.ts
│   └── ...
├── services/
│   ├── apiClient.ts       # Axios/fetch wrapper
│   ├── auth.service.ts
│   ├── quran.service.ts
│   ├── comments.service.ts
│   ├── user.service.ts
│   └── ...
├── store/
│   ├── authStore.ts       # Zustand or Context
│   ├── appStore.ts
│   └── ...
├── types/
│   ├── index.ts           # Shared types
│   ├── api.ts
│   └── ...
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── ...
├── locales/
│   ├── en.json
│   ├── ar.json
│   ├── tr.json
│   ├── de.json
│   ├── es.json
│   └── fr.json
├── styles/
│   └── globals.css
├── .env.local
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 🔗 API Integration Points

**Backend endpoints** yang web'de diperlukan:
```
AUTH:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

USERS:
  GET    /api/users/:id
  PUT    /api/users/:id
  GET    /api/users/:id/stats

COMMENTS:
  GET    /api/comments?ayahId=X
  POST   /api/comments
  PUT    /api/comments/:id
  DELETE /api/comments/:id
  POST   /api/comments/:id/report

FAVORITES:
  GET    /api/favorites
  POST   /api/favorites
  DELETE /api/favorites/:id

COLLECTIONS:
  GET    /api/collections
  POST   /api/collections
  PUT    /api/collections/:id
  DELETE /api/collections/:id
  GET    /api/collections/:id/items
  POST   /api/collections/:id/items
  DELETE /api/collections/:id/items/:itemId

QURAN:
  GET    /api/surahs
  GET    /api/surahs/:id
  GET    /api/surahs/:id/ayahs
  GET    /api/ayahs/:id
```

---

## 🛠 Tech Stack Details

| Area | Technology | Notes |
|------|-----------|-------|
| Framework | Next.js 15+ | App Router, TypeScript |
| Styling | Tailwind CSS | Utility-first, responsive |
| HTTP Client | axios / fetch | With interceptors for auth |
| State Management | Context API / Zustand | For auth, user data |
| Forms | React Hook Form | With Zod/Yup validation |
| UI Components | Custom + shadcn/ui (optional) | Tailwind-based |
| i18n | next-intl (optional) | For multi-language support |
| Database | Prisma Client | Shared with backend |
| Deployment | Vercel | Recommended for Next.js |
| Analytics | Vercel Analytics / Google Analytics | Track user behavior |
| Error Tracking | Sentry | Catch runtime errors |

---

## ⚙️ Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
# or
NEXT_PUBLIC_API_URL=https://api.kuran-ne-diyor.com

# Database (if SSR needs DB access)
DATABASE_URL=postgresql://user:password@host:5432/kuran_db

# Analytics
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX

# Error Tracking
SENTRY_DSN=https://...

# Environment
NODE_ENV=development|production
```

---

## 📝 Notes

1. **Mobile Feature Parity**: Web versiyonu mobil uygulamadaki tüm özellikleri taşımalı
2. **Responsive Design**: Mobile-first approach, Tailwind breakpoints kullan
3. **RTL Support**: Arabic için sağ-sol yazı desteklememeli
4. **Performance**: Lazy loading, ISR, caching strategisi önemli
5. **SEO**: Meta tags, sitemap, canonical URLs
6. **Auth**: Backend'deki JWT sistem ile entegrasyonişkişiasl
7. **Testing**: Component tests önemli, E2E tests yazılmalı

---

## ✅ Yapılanlar (Work in Progress)

### Completed Tasks

*Bu bölüm her işlem tamamlandıkça güncellenecek*

**Başlama Tarihi**: 2026-05-11  
**Son Güncelleme**: 2026-05-11

#### Phase 1: Setup & Foundation
- [ ] Project Init
- [ ] Environment Config
- [ ] API Client Setup
- [ ] Auth System
- [ ] Layout & Navigation

#### Phase 2: Core Features
- [ ] Quran Data Integration
- [ ] Home Page
- [ ] Surah Display
- [ ] Ayah Details

#### Phase 3: User Engagement
- [ ] Favorites System
- [ ] Collections
- [ ] Search & Filter
- [ ] Statistics

#### Phase 4: Comments & Community
- [ ] Comments Display
- [ ] User Comments Page
- [ ] Moderation UI

#### Phase 5: Account & Settings
- [ ] User Profile
- [ ] Settings Page
- [ ] Login/Register
- [ ] Auth Flows

#### Phase 6: Advanced Features
- [ ] Progress Tracking
- [ ] Reporting System
- [ ] i18n Setup
- [ ] Social Features

#### Phase 7: Polish & Performance
- [ ] Performance Optimization
- [ ] SEO Setup
- [ ] Error Handling
- [ ] Accessibility

#### Phase 8: Testing & Deploy
- [ ] Testing Suite
- [ ] Vercel Deployment
- [ ] Monitoring Setup
