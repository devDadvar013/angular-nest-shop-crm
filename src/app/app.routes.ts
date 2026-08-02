import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'ورود | ShopOrders',
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
        title: 'داشبورد | ShopOrders',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
        title: 'محصولات | ShopOrders',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
        title: 'محصول جدید | ShopOrders',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
        title: 'ویرایش محصول | ShopOrders',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/list/customer-list.component').then(
            (m) => m.CustomerListComponent,
          ),
        title: 'مشتریان | ShopOrders',
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/form/customer-form.component').then(
            (m) => m.CustomerFormComponent,
          ),
        title: 'مشتری جدید | ShopOrders',
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/form/customer-form.component').then(
            (m) => m.CustomerFormComponent,
          ),
        title: 'ویرایش مشتری | ShopOrders',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/list/order-list.component').then((m) => m.OrderListComponent),
        title: 'سفارش‌ها | ShopOrders',
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/orders/form/order-form.component').then((m) => m.OrderFormComponent),
        title: 'سفارش جدید | ShopOrders',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
        title: 'جزئیات سفارش | ShopOrders',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
