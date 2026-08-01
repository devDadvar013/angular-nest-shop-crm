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

- ایمیل: `admin@shop.io`
- رمز عبور: `password`

## پکیج‌های اضافه‌شده

- **سلکت باکس:** [`@ng-select/ng-select`](https://github.com/ng-select/ng-select) نسخه‌ی `^13.x` (سازگار با Angular 18) — پرکاربردترین و باثبات‌ترین کتابخانه‌ی select/autocomplete انگولار، دارای جستجو، Custom Template و چندانتخابی. استایل RTL و هم‌رنگ با تم پروژه در `src/styles.scss` (کلاس `.rtl-select`) اضافه شده و در `order-form.component.ts` (انتخاب مشتری و محصول) به‌کار رفته است. برای استفاده در فرم‌های دیگر همین الگو را با `NgSelectModule` تکرار کنید.
- **دیت‌پیکر شمسی:** [`ng-persian-datepicker`](https://github.com/SaeedDev94/ng-persian-datepicker) نسخه‌ی `^9.x` به همراه `jalali-ts` (پکیج تاریخ شمسی مورد نیازش) اضافه شده است. بعد از `npm install`، حتماً README نسخه‌ی نصب‌شده در `node_modules/ng-persian-datepicker` را چک کنید تا API دقیق (اسم Directive/Component و رویدادها) با نسخه‌ی نصب‌شده مطابقت داشته باشد، چون بین نسخه‌های این پکیج تغییر کرده است.

## نکات پیاده‌سازی

- تمام پاسخ‌ها طبق `TransformInterceptor` بک‌اند در قالب `{ data: ... }` دریافت می‌شوند.
- خطاهای اعتبارسنجی (`{ message, errors }`) در `errorInterceptor` استخراج و به‌صورت toast نمایش داده می‌شوند.
- توکن در `localStorage` ذخیره می‌شود و به‌صورت خودکار به هدر `Authorization: Bearer <token>` همه‌ی درخواست‌ها اضافه می‌شود.
- در صورت دریافت پاسخ ۴۰۱، سشن پاک شده و کاربر به صفحه‌ی ورود هدایت می‌شود.
