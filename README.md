# أمانة — Amana Platform

منصة MVP لحجز مقاعد السيارات ونقل الأمانات (البريد والطرود) بين المحافظات داخل العراق.
واجهة عربية (RTL) بتصميم Mobile‑First.

> An MVP platform for inter‑governorate **seat booking** and **parcel transport** in Iraq.
> Arabic‑first, RTL, mobile‑first.

---

## ⚙️ التقنيات / Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Prisma** + **PostgreSQL**
- خطوط **Cairo** + **IBM Plex Sans Arabic** عبر `next/font`
- تنسيق الأرقام والعملة بصيغة `ar-IQ` (دينار عراقي)

---

## 🚀 التشغيل السريع / Quick Start

> ملاحظة: بُني المشروع في بيئة بدون اتصال إنترنت، لذا تحتاج إلى تثبيت الحزم محلياً.
> The project was authored offline — install dependencies on your machine first.

```bash
# 1) تثبيت الحزم
npm install

# 2) تشغيل الواجهة فوراً (بيانات تجريبية، بدون قاعدة بيانات)
npm run dev
```

افتح <http://localhost:3000> — يعمل التطبيق مباشرةً على **بيانات وهمية** من `src/lib/data.ts`
دون الحاجة إلى قاعدة بيانات.

### ربط قاعدة البيانات (اختياري) / Connect a database

```bash
# انسخ ملف البيئة وعدّل رابط الاتصال
cp .env.example .env
#  DATABASE_URL="postgresql://USER:PASS@localhost:5432/amana?schema=public"

# أنشئ الجداول من المخطط
npm run db:push

# عبّئ بيانات تجريبية
npm run db:seed

# (اختياري) تصفّح البيانات
npm run db:studio
```

---

## 🧱 معمارية البيانات / Data Layer

كل الصفحات تقرأ من طبقة بيانات واحدة قابلة للاستبدال: **`src/lib/data.ts`**.

- حالياً تُعيد هذه الدوال **بيانات في الذاكرة** ليعمل التطبيق فوراً بلا قاعدة بيانات.
- للانتقال للإنتاج: استبدل جسم كل دالة باستعلام **Prisma** (انظر `prisma/schema.prisma`)
  مع الإبقاء على نفس شكل القيمة المُعادة — **لن تحتاج الصفحات لأي تعديل**.

دوال الطبقة: `getAllTrips`, `searchTrips`, `getTrip`, `getBookingsForTrip`,
`getDriverTrips`, `getDriverBookings`, `getAllBookings`, `getAllParcels`, `getPopularRoutes`.

---

## 🗂️ هيكل المشروع / Structure

```
amana-platform/
├── prisma/
│   ├── schema.prisma        # المخطط: User, Vehicle, Trip, Booking, Parcel
│   └── seed.ts              # بيانات تجريبية للقاعدة
├── src/
│   ├── app/
│   │   ├── layout.tsx       # RTL، الخطوط، الميتاداتا
│   │   ├── globals.css      # متغيرات الثيم (teal + saffron)
│   │   ├── page.tsx                         # الرئيسية
│   │   ├── search/page.tsx                  # نتائج البحث
│   │   ├── trips/[id]/page.tsx              # تفاصيل الرحلة
│   │   ├── trips/[id]/seats/page.tsx        # اختيار المقعد
│   │   ├── booking/confirmation/page.tsx    # تأكيد الحجز
│   │   ├── parcels/new/page.tsx             # طلب إرسال أمانة
│   │   ├── driver/page.tsx                  # لوحة السائق
│   │   ├── admin/page.tsx                   # لوحة الإدارة
│   │   └── login/page.tsx                   # دخول (هيكل مبدئي)
│   ├── components/
│   │   ├── ui/              # عناصر shadcn/ui
│   │   ├── route-line.tsx   # العنصر المميّز: خط المسار
│   │   ├── seat-map.tsx     # خريطة المقاعد التفاعلية
│   │   ├── trip-card.tsx, search-form.tsx, app-shell.tsx, …
│   ├── lib/
│   │   ├── data.ts          # طبقة البيانات (وهمية ← Prisma لاحقاً)
│   │   ├── governorates.ts  # محافظات العراق الـ18
│   │   ├── prisma.ts        # عميل Prisma (singleton)
│   │   └── utils.ts         # cn، تنسيق الدينار والتاريخ
│   └── types/index.ts
└── …
```

---

## 📄 الصفحات / Pages

| المسار | الوصف |
| --- | --- |
| `/` | الرئيسية: بحث + المسارات الشائعة + كيف تعمل |
| `/search` | نتائج البحث مع إمكانية تعديل المعايير |
| `/trips/[id]` | تفاصيل الرحلة والسائق والمركبة |
| `/trips/[id]/seats` | اختيار المقاعد التفاعلي |
| `/booking/confirmation` | مراجعة وتأكيد الحجز |
| `/parcels/new` | طلب إرسال أمانة مع تقدير السعر |
| `/driver` | لوحة السائق: رحلاتي + الحجوزات + إضافة رحلة |
| `/admin` | لوحة الإدارة: إحصاءات وجداول |
| `/login` | تسجيل الدخول (OTP مُخطّط للمرحلة القادمة) |

---

## 🗺️ نطاق الـ MVP / Scope

**ضمن النطاق:** البحث، تفاصيل الرحلة، اختيار المقعد، تأكيد الحجز (بحالة نجاح على الواجهة)،
طلب الأمانة، لوحتا السائق والإدارة.

**خارج النطاق (Sprint 2):** تسجيل الدخول عبر OTP، الدفع الإلكتروني، التتبّع المباشر، الإشعارات.
> النماذج الحالية تستخدم حالات نجاح على الواجهة دون كتابة فعلية لقاعدة البيانات.

---

## 📜 الأوامر / Scripts

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | تشغيل التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run start` | تشغيل بناء الإنتاج |
| `npm run lint` | فحص الكود |
| `npm run db:push` | إنشاء الجداول من المخطط |
| `npm run db:seed` | تعبئة بيانات تجريبية |
| `npm run db:studio` | فتح Prisma Studio |
