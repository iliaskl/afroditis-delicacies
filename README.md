# Afroditi's Delicacies

A web application for ordering authentic homemade Greek cuisine, built for a small family business based in Bothell, WA. Customers can browse the menu, schedule a delivery, and place orders online. The business owner manages orders, the menu, and the delivery calendar through a built-in admin dashboard.

Live site: [afroditisdelicacies.com](https://www.afroditisdelicacies.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Router v7 + TypeScript + Vite |
| Database & Auth | Firebase Firestore + Firebase Auth |
| Hosting | Vercel |
| Email | Resend (transactional) · Zoho Mail (business inbox) |
| Images | Cloudinary |
| Maps & Address | Mapbox Geocoding API |
| Domain | Namecheap → afroditisdelicacies.com |

---

## Features

**Customer**
- Browse menu by category with dish detail popups
- Add items to cart with size and quantity selection
- Delivery scheduling with lead-time enforcement and time slot selection
- Address autocomplete with 25-mile delivery radius validation
- Guest cart with auth gate at checkout
- Order history and favorites in the account panel
- Email confirmation on order placement and status updates

**Admin**
- Order management: approve, decline, deliver
- Menu management: add, edit, delete, reorder dishes and categories
- Calendar management: block unavailable delivery days
- Analytics dashboard: revenue, order counts, top dishes, busiest days
- Create orders manually on behalf of customers

---

## Business Logic

**Lead times** (minimum notice required before delivery):
- 1–3 items → 3 days
- 4–7 items → 1 week
- 8+ items (catering) → 2 weeks

**Delivery radius:** 25 miles from Bothell, WA, validated via Mapbox + Haversine formula.

**Payment:** Cash, check, Venmo, or PayPal — no integrated payment processing. Customers arrange payment directly.

**Order flow:** Customer places order → status is `pending` → admin approves or declines → if approved, status becomes `active` → marked `delivered` after drop-off. Admin-created orders skip `pending` and go directly to `active`.

---

## Project Structure

```
app/
├── routes/          # Page-level components (home, menu, checkout, orders, etc.)
├── components/      # Reusable UI components
├── services/        # All Firestore and external API logic
├── context/         # Auth, cart, and user profile context providers
├── styles/          # Shared CSS files
├── types/           # Shared TypeScript interfaces
└── firebase/        # Firebase app initialization
```

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Deployment

The `main` branch is connected to Vercel and deploys automatically on push. All environment variables above must be set in the Vercel project settings.

---

## Admin Access

Admin roles are assigned manually. To grant admin access:
1. Set `role: "admin"` on the user's Firestore document at `users/{uid}`
2. Add their email to the `adminEmails` array in `adminSettings/config`