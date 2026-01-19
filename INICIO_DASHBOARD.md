# Guía Rápida - Iniciar Dashboard

## Pasos para Ejecutar el Dashboard

### 1. Iniciar el Backend
```bash
cd "d:\Universidad 5\Proyecto\Proyecto\4.1.2\Back_Proyecto"
npm start
```

El backend debe estar corriendo en `http://localhost:3000`

### 2. Iniciar el Frontend
```bash
cd "d:\Universidad 5\Proyecto\Proyecto\4.1.2\Front_Proyecto"
ng serve
```

O si ya tienes el servidor corriendo, simplemente navega a la ruta del dashboard.

### 3. Acceder al Dashboard

Navega a la ruta configurada para el dashboard (ejemplo: `http://localhost:4200/dashboard`)

## Configuración de Rutas

Si aún no has configurado la ruta del dashboard, añade lo siguiente a `app-routing.module.ts`:

```typescript
import { DashboardRetrieveComponent } from './dashboard-retrieve/dashboard-retrieve.component';

const routes: Routes = [
  // ... otras rutas
  {
    path: 'dashboard',
    component: DashboardRetrieveComponent,
    canActivate: [AuthGuard] // si requiere autenticación
  },
  // ... otras rutas
];
```

## Verificación

Al abrir el dashboard deberías ver:
- ✅ Panel de filtros en la parte superior
- ✅ 4 tarjetas KPI con métricas generales
- ✅ Múltiples gráficos (líneas, torta, barras)
- ✅ Tablas con datos de productos y clientes

## Solución de Problemas

### Si ves errores de compilación en el editor
Estos son temporales y desaparecerán cuando se recargue el servidor de Angular. Para forzar la recarga:
1. Detén el servidor (Ctrl+C)
2. Ejecuta `ng serve` nuevamente

### Si los gráficos no se muestran
Verifica que las librerías estén instaladas:
```bash
npm list chart.js ng2-charts
```

Si no están, instala con:
```bash
npm install chart.js ng2-charts --legacy-peer-deps
```

### Si no hay datos
1. Verifica que el backend esté corriendo
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que tengas datos en la base de datos (collection `bills`)

## URLs de la API

El dashboard consume estos endpoints:
- GET `/api/dashboard/overview`
- GET `/api/dashboard/products/most-sold`
- GET `/api/dashboard/products/profitability`
- GET `/api/dashboard/categories/profitability`
- GET `/api/dashboard/sales/history`
- GET `/api/dashboard/sales/customer-evolution`
- GET `/api/dashboard/sales/quarterly-comparison`
- GET `/api/dashboard/customers/registered`
- GET `/api/dashboard/customers/active`
- GET `/api/dashboard/customers/important`
- GET `/api/dashboard/customers/rankings`
- GET `/api/dashboard/customers/participation`

Todos requieren autenticación con JWT token.

## Datos de Prueba

Si no tienes datos, puedes crear ventas de prueba o usar el script de seed (si existe) en el backend.

---

¡El dashboard está listo para usar! 🎉
