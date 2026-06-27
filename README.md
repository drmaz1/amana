# أمانة — Amana Platform

منصة لحجز مقاعد السيارات ونقل الأمانات (البريد والطرود) بين المحافظات داخل العراق.
واجهة عربية (RTL) بتصميم Mobile‑First، مدعومة بقاعدة بيانات حقيقية وعمليات كتابة آمنة.

> Inter‑governorate **seat booking** and **parcel transport** for Iraq.
> Arabic‑first, RTL, mobile‑first — backed by a real database with safe writes.

---

## ⚙️ التقنيات / Tech Stack

- **Next.js 14** (App Router, Server Actions) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) + **sonner** (toasts)
- **Prisma** + **PostgreSQL** (migrations)
- **Zod** للتحقق، **jose** لجلسات JWT، مصادقة **OTP بالهاتف**
- **Vitest** (وحدات + تكامل) و **Playwright** (E2E)
- خطوط **Cairo** + **IBM Plex Sans Arabic**؛ تنسيق `ar-IQ` (دينار عراقي)

---

## 🚀 التشغيل / Getting started

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد البيئة
cp .env.example .env
#    عدّل DATABASE_URL / DIRECT_URL ليشيرا إلى Postgres محلي،
#    واضبط AUTH_SECRET (openssl rand -hex 32).

# 3) إنشاء قاعدة البيانات وتطبيق الـ migrations + بيانات تجريبية
npm run db:migrate     # prisma migrate dev (ينشئ/يطبّق الـ migrations)
npm run db:seed        # بيانات تجريبية

# 4) التشغيل
npm run dev            # http://localhost:3000
```

> يحتاج المشروع إلى **PostgreSQL** يعمل محلياً (أو Neon/Supabase). لا توجد بيانات
> وهمية بعد الآن — كل الصفحات تقرأ من القاعدة عبر `src/lib/data.ts`.

### تسجيل الدخول أثناء التطوير / Dev login (OTP)

المصادقة عبر **رمز OTP** يُرسَل للهاتف. في التطوير يستخدم النظام `ConsoleSmsProvider`
الذي **يطبع الرمز في سجل الخادم (console)**، كما يظهر الرمز في صفحة الدخول مباشرةً.

حسابات تجريبية من البذور (seed):

| الهاتف | الدور | يصل إلى |
| --- | --- | --- |
| `07701234567` | DRIVER | `/driver` |
| `07900000000` | ADMIN | `/admin` و `/driver` |
| أي رقم آخر `07XXXXXXXXX` | PASSENGER | الحجز والأمانات |

تُخزَّن الأرقام بصيغة **E.164** (`+9647XXXXXXXXX`) وتُعرض/تُدخل محلياً (`07…`).

---

## 🧱 المعمارية / Architecture

- **القراءة:** كل صفحة تقرأ عبر `src/lib/data.ts` (استعلامات Prisma، `noStore()`
  فتُعرض دائماً بيانات حديثة). الصفحات لا تستورد Prisma مباشرة.
- **الكتابة:** **Server Actions** في `src/lib/actions/` مع تحقق **Zod**، تُعيد نتيجة
  مُنمّطة `{ ok: true, … } | { ok: false, error }` ولا تُسرّب أخطاء للمستخدم.
- **منع الحجز المزدوج:** جدول `BookingSeat` بقيد فريد `@@unique([tripId, seatNumber])`؛
  إنشاء الحجز داخل معاملة (`$transaction`) فيستحيل حجز نفس المقعد مرتين (يُختبر بحالة
  تزامن في `tests/integration/booking.test.ts`).
- **المصادقة:** OTP → جلسة JWT موقّعة في كوكي `httpOnly`؛ `middleware.ts` يحمي
  `/driver` (DRIVER+) و`/admin` (ADMIN).

دوال طبقة القراءة: `getAllTrips`, `searchTrips`, `getTrip`, `getBookingsForTrip`,
`getDriverTrips`, `getDriverBookings`, `getAllBookings`, `getAllParcels`, `getPopularRoutes`.

أهم القرارات التقنية مُوثّقة في [`docs/DECISIONS.md`](docs/DECISIONS.md)، وخطة البناء
الكاملة في [`CLAUDE.md`](CLAUDE.md).

---

## 📄 الصفحات / Pages

| المسار | الوصف |
| --- | --- |
| `/` | الرئيسية: بحث + المسارات الشائعة |
| `/search` | نتائج البحث |
| `/trips/[id]` | تفاصيل الرحلة والسائق والمركبة |
| `/trips/[id]/seats` | اختيار المقاعد التفاعلي |
| `/booking/confirmation` | تأكيد الحجز (كتابة فعلية + رقم حجز) |
| `/parcels/new` | طلب إرسال أمانة (كتابة فعلية + رقم طلب) |
| `/driver` | لوحة السائق (محميّة) — رحلاتي + الحجوزات + إضافة رحلة |
| `/admin` | لوحة الإدارة (محميّة) — إحصاءات وجداول |
| `/login` | تسجيل الدخول عبر OTP |

---

## 🧪 الاختبارات والجودة / Testing & quality gates

```bash
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Vitest (وحدات + تكامل الحجز؛ يتخطّى التكامل بلا قاعدة بيانات)
npm run test:e2e       # Playwright (مسار الحجز الكامل)
npm run build          # next build
```

- اختبارات التكامل (الحجز) تحتاج قاعدة بيانات مُطبّقة عليها الـ migrations؛ تتخطّى
  نفسها تلقائياً إن لم تتوفر قاعدة.
- لـ Playwright في بيئة بمتصفّح مُثبّت مسبقاً: `PLAYWRIGHT_CHROMIUM_PATH=…`؛ وإلا
  `npx playwright install chromium`.
- **CI:** يشغّل `.github/workflows/ci.yml` كل ما سبق على كل PR مع خدمة Postgres.

---

## 📜 الأوامر / Scripts

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` / `build` / `start` | التطوير / البناء / تشغيل البناء |
| `npm run lint` / `typecheck` | فحص الكود والأنواع |
| `npm test` / `test:e2e` | اختبارات Vitest / Playwright |
| `npm run db:migrate` | `prisma migrate dev` (تطوير) |
| `npm run db:deploy` | `prisma migrate deploy` (إنتاج) |
| `npm run db:seed` | بيانات تجريبية |
| `npm run db:studio` | فتح Prisma Studio |

---

## ☁️ النشر / Deployment (Vercel + Neon)

1. أنشئ قاعدة **Neon** واحصل على رابطين: مُجمّع (pooled) للتطبيق، ومباشر (direct)
   للـ migrations.
2. على **Vercel** اضبط متغيرات البيئة: `DATABASE_URL` (pooled)، `DIRECT_URL`
   (direct)، `AUTH_SECRET`، `NEXT_PUBLIC_SITE_URL`، ومتغيرات SMS عند تفعيل
   `SMS_PROVIDER=http`.
3. طبّق الـ migrations على قاعدة الإنتاج:

   ```bash
   DATABASE_URL=… DIRECT_URL=… npm run db:deploy
   ```

4. `npm run build` يعمل بدون اتصال بالقاعدة (الصفحات ديناميكية)، فلا حاجة لقاعدة
   وقت البناء.
