import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'ورود | شاپ سی‌آرام',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'داشبورد | شاپ سی‌آرام',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
        title: 'محصولات | شاپ سی‌آرام',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
        title: 'محصول جدید | شاپ سی‌آرام',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
        title: 'ویرایش محصول | شاپ سی‌آرام',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/list/customer-list.component').then(
            (m) => m.CustomerListComponent,
          ),
        title: 'مشتریان | شاپ سی‌آرام',
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/form/customer-form.component').then(
            (m) => m.CustomerFormComponent,
          ),
        title: 'مشتری جدید | شاپ سی‌آرام',
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/form/customer-form.component').then(
            (m) => m.CustomerFormComponent,
          ),
        title: 'ویرایش مشتری | شاپ سی‌آرام',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/list/order-list.component').then((m) => m.OrderListComponent),
        title: 'سفارش‌ها | شاپ سی‌آرام',
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/orders/form/order-form.component').then((m) => m.OrderFormComponent),
        title: 'سفارش جدید | شاپ سی‌آرام',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
        title: 'جزئیات سفارش | شاپ سی‌آرام',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
