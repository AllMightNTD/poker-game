# Multi Language Implementation Plan for Next.js Project

## 1. Objective

Implement a complete internationalization (i18n) solution across the entire Next.js application to support multiple languages while maintaining SEO, scalability, and maintainability.

### Goals

* Support multiple languages (English, Japanese, Vietnamese)
* Dynamic language switching
* SEO-friendly URLs
* Easy addition of new languages
* Centralized translation management
* Support both Server Components and Client Components
* Consistent localization across all modules

---

# 2. Scope

The multi-language system will be applied to all frontend modules:

# 3. Technical Solution

## Library

Use **next-intl** as the primary internationalization framework.

### Benefits

* Official support for Next.js App Router
* Server Component support
* SEO friendly
* Type-safe translation handling
* High performance
* Active community support

### Installation

```bash
npm install next-intl
```

---

# 4. Project Structure

```text
src
├── app
│   ├── [locale]
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login
│   │   ├── profile
│   │   └── ...
│
├── i18n
│   ├── routing.ts
│   ├── request.ts
│
├── messages
│   ├── en.json
│   ├── ja.json
│   └── vi.json
│
├── components
├── hooks
├── services
└── utils
```

---

# 5. Supported Languages

## Phase 1

| Language   | Code |
| ---------- | ---- |
| English    | en   |
| Japanese   | ja   |
| Vietnamese | vi   |

## Phase 2

| Language | Code |
| -------- | ---- |
| Chinese  | zh   |
| Korean   | ko   |

---

# 6. Routing Strategy

## URL Structure

```text
/en
/en/login
/en/profile

/ja
/ja/login
/ja/profile

/vi
/vi/login
/vi/profile
```

### Benefits

* SEO-friendly
* Easy indexing by search engines
* Clear locale separation

---

# 7. Locale Detection

## Priority Order

```text
User Language Preference (DB)
↓
Cookie
↓
Browser Language
↓
Default Language (en)
```

## Middleware Responsibilities

* Detect locale
* Redirect to proper locale path
* Handle unsupported locales
* Maintain locale consistency

Example:

```text
/
→
/ja
```

---

# 8. Translation File Design

## Naming Convention

Use namespaced keys.

### Recommended

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout"
  },
  "profile": {
    "title": "Profile"
  }
}
```

### Avoid

```json
{
  "Save": "保存"
}
```

---

# 9. Translation Resources

## English

```text
messages/en.json
```

## Japanese

```text
messages/ja.json
```

## Vietnamese

```text
messages/vi.json
```

---

# 10. Language Switcher

## Requirements

* Available globally in Header
* Preserve current page when switching language
* Persist selected language

### Example

```text
Current URL:
/en/profile

Switch to Japanese:
/ja/profile
```

### Supported UI

```text
🌐 Language

English
日本語
Tiếng Việt
```

---

# 11. Language Persistence

## Cookie

```text
NEXT_LOCALE
```

### Expiration

```text
365 days
```

## Local Storage

Optional fallback storage.

---

# 12. User Profile Integration

## Database

Add language preference field.

```sql
ALTER TABLE users
ADD COLUMN language VARCHAR(10);
```

### Example Values

```text
en
ja
vi
```

## Login Flow

```text
User Login
↓
Load User Language
↓
Set Locale
↓
Redirect
```

---

# 13. Form Validation Localization

## Current

```typescript
"Email is required"
```

## Target

```typescript
t("validation.emailRequired")
```

Example:

```json
{
  "validation": {
    "emailRequired": "Email is required"
  }
}
```

---

# 14. Toast Message Localization

## Current

```typescript
toast.success("Create success")
```

## Target

```typescript
toast.success(t("toast.createSuccess"))
```

---

# 15. API Error Localization

Backend should return error codes instead of localized messages.

## Example Response

```json
{
  "code": "USER_NOT_FOUND"
}
```

Frontend mapping:

```json
{
  "error": {
    "USER_NOT_FOUND": "User not found"
  }
}
```

### Benefits

* Frontend controls language
* Easier maintenance
* Consistent UX

---

# 16. Dynamic Content Localization

## Static Content

Use translation JSON files.

## Database Content

### Option A

Multiple columns

```sql
title_en
title_ja
title_vi
```

### Option B (Recommended)

JSON structure

```json
{
  "en": "Restaurant",
  "ja": "レストラン",
  "vi": "Nhà hàng"
}
```

### Applicable Data

* Categories
* Tags
* Notification Templates
* CMS Content
* Menu Titles

---

# 17. SEO Requirements

## Hreflang

```html
<link rel="alternate" hreflang="en" />
<link rel="alternate" hreflang="ja" />
<link rel="alternate" hreflang="vi" />
```

## Metadata Localization

Each locale must have:

* title
* description
* keywords
* OpenGraph title
* OpenGraph description

Example:

```text
/en/about
/ja/about
/vi/about
```

---

# 18. Testing

## Unit Test

Validate:

* Translation keys exist
* Locale loading
* Fallback behavior
* Middleware routing

## Integration Test

Validate:

* Language switching
* Cookie persistence
* Authentication integration

## E2E Test

Validate:

* Page navigation
* Locale URLs
* Form validation messages
* Toast messages
* Error messages

---

# 19. Migration Strategy

## Phase 1

Infrastructure setup

### Tasks

* Install next-intl
* Configure middleware
* Configure routing
* Create locale files

---

## Phase 2

Core Layout Components

### Tasks

* Header
* Footer
* Sidebar
* Navigation

---

## Phase 3

Authentication Pages

### Tasks

* Login
* Register
* Forgot Password
* Reset Password

---

## Phase 4

Business Modules

### Tasks

* Profile
* Friends
* Posts
* Comments
* Notifications
* Chat

---

## Phase 5

Admin Modules

### Tasks

* Dashboard
* User Management
* Settings

---

## Phase 6

Validation & Error Handling

### Tasks

* Validation messages
* API errors
* Toast messages
* Empty states

---

## Phase 7

SEO & Optimization

### Tasks

* Hreflang
* Metadata
* Sitemap localization

---

# 20. Deliverables

## Frontend

* next-intl configuration
* Locale middleware
* Language switcher
* Translation resources
* Localization hooks
* SEO localization support

## Backend

* User language preference API
* Localized content API support

## Database

* User language setting
* Localized content structure

## QA

* Localization test checklist
* Regression test report

---

# 21. Estimated Timeline

| Phase                       | Duration |
| --------------------------- | -------- |
| Infrastructure Setup        | 1 day    |
| Core Components             | 1 day    |
| Authentication              | 0.5 day  |
| Business Modules            | 2-3 days |
| Admin Modules               | 1-2 days |
| Validation & Error Handling | 1 day    |
| Testing & QA                | 1-2 days |

## Total Estimate

**5 - 10 working days**

(depending on project size, existing hardcoded content, and number of supported languages)
