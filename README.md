# Shop CRM — Angular Frontend

فرانت‌اند Angular برای بک‌اند NestJS موجود در `shop-crm` (پوشه‌ی بک‌اند اصلی).
سرویس‌های این پروژه (`core/services`) دقیقاً منطبق بر endpointها و DTOهای بک‌اند نوشته شده‌اند.

## اجرا

```bash
npm install
npm start          # روی http://localhost:4200
```

پیش‌فرض `environment.ts` به `http://localhost:3000/api` وصل می‌شود (طبق README بک‌اند).
اگر بک‌اند روی آدرس دیگری اجرا می‌شود، `src/environments/environment.ts` را ویرایش کنید.

```bash
npm run build       # ساخت نسخه‌ی production در dist/shop-crm-angular
```

## ساختار

```
src/app/
├─ core/
│  ├─ models/         # تایپ‌های دقیقاً منطبق بر سریالایزرها و DTOهای بک‌اند
│  ├─ services/        # AuthService, ProductsService, CustomersService, OrdersService, DashboardService
│  ├─ interceptors/     # افزودن Bearer token + مدیریت خطاهای سراسری
│  └─ guards/           # authGuard / guestGuard
├─ features/
│  ├─ auth/login
│  ├─ dashboard
│  ├─ products/{list,form}
│  ├─ customers/{list,form}
│  └─ orders/{list,form,detail}
├─ layout/              # Shell (سایدبار + هدر)
└─ shared/               # کامپوننت‌ها و pipeهای مشترک (toast, badge وضعیت, فرمت تومان/تاریخ)
```

## ورود پیش‌فرض (بعد از seed شدن بک‌اند)

- ایمیل: `admin@shop.test`
- رمز عبور: `password`

## نکات پیاده‌سازی

- تمام پاسخ‌ها طبق `TransformInterceptor` بک‌اند در قالب `{ data: ... }` دریافت می‌شوند.
- خطاهای اعتبارسنجی (`{ message, errors }`) در `errorInterceptor` استخراج و به‌صورت toast نمایش داده می‌شوند.
- توکن در `localStorage` ذخیره می‌شود و به‌صورت خودکار به هدر `Authorization: Bearer <token>` همه‌ی درخواست‌ها اضافه می‌شود.
- در صورت دریافت پاسخ ۴۰۱، سشن پاک شده و کاربر به صفحه‌ی ورود هدایت می‌شود.
