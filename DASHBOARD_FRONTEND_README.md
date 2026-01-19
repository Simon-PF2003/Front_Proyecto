# Dashboard de Inteligencia de Negocios - Frontend

## Resumen de Implementación

Se ha implementado el frontend completo del dashboard de inteligencia de negocios con todas las funcionalidades solicitadas. El dashboard se conecta al backend a través de los 13 endpoints disponibles.

## Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/app/services/dashboard.service.ts`** - Servicio para comunicación con API del dashboard
2. **`src/app/services/dashboard.service.spec.ts`** - Tests del servicio

### Archivos Modificados
3. **`src/app/dashboard-retrieve/dashboard-retrieve.component.ts`** - Lógica del componente
4. **`src/app/dashboard-retrieve/dashboard-retrieve.component.html`** - Template del dashboard
5. **`src/app/dashboard-retrieve/dashboard-retrieve.component.css`** - Estilos del dashboard
6. **`src/app/app.module.ts`** - Importación de NgChartsModule

## Funcionalidades Implementadas

### ✅ 1. Productos Más Vendidos
- **Vista**: Gráfico de barras horizontal + tabla
- **Filtros**: categoría, marca, descripción, razón social, fechas
- **Datos**: Top 20 productos con cantidad, litros, ingresos, ventas

### ✅ 2. Rentabilidad por Producto
- **Vista**: Tabla detallada
- **Datos**: Ingresos, costos, ganancia bruta, margen de ganancia
- **Filtros**: categoría, marca, descripción, fechas

### ✅ 3. Rentabilidad por Categoría
- **Vista**: Tabla resumen
- **Datos**: Análisis de rentabilidad agrupado por categoría

### ✅ 4. Historial de Ventas
- **Vista**: Gráfico de líneas dual-axis
- **Datos**: Serie temporal con ingresos y cantidad de ventas
- **Filtros**: fechas, categoría, marca, razón social
- **Agrupación**: día, semana, mes, trimestre, año

### ✅ 5. Clientes Registrados
- **Vista**: Tarjeta con estadísticas
- **Datos**: Total y desglose por tipo (mayorista/minorista)
- **Filtros**: rango de fechas, tipo de cliente

### ✅ 6. Clientes Activos
- **Vista**: Tarjeta con estadísticas
- **Criterio**: Al menos 1 compra en el último mes
- **Datos**: Total y desglose por tipo

### ✅ 7. Clientes Importantes (VIP)
- **Vista**: Tabla detallada + estadísticas
- **Criterio**: VIP Score = (compras × 10) + (total gastado / 1000)
- **Datos**: Top 50 clientes con métricas completas
- **Beneficios**: Identificación para otorgar beneficios especiales

## Características Adicionales Implementadas

### 📊 Gráficos Interactivos
1. **Historial de Ventas** - Líneas con dual-axis
2. **Evolución Tipo Cliente** - Área apilada (Mayorista vs Minorista)
3. **Participación Clientes** - Gráfico de torta
4. **Comparación Trimestral** - Barras agrupadas
5. **Productos Más Vendidos** - Barras horizontales

### 🎯 KPIs Principales
- Cantidad total de productos vendidos
- Cantidad total de litros
- Litros promedio por venta
- Cantidad total de ventas

### 📈 Análisis Adicionales
- Rankings de clientes por cantidad y litros
- Comparación trimestral de ventas
- Detalles de ventas por cliente

## Sistema de Filtros

### Filtros Disponibles
- **Año**: Selector de año
- **Trimestre**: Día, semana, mes, trimestre, año
- **Mes/Año**: Selector de período específico
- **Tipo Cliente**: Todo, Mayorista, Minorista
- **Categoría**: Búsqueda por texto
- **Marca**: Búsqueda por texto
- **Descripción Producto**: Búsqueda por texto
- **Razón Social**: Búsqueda por nombre de cliente
- **Fecha Inicio**: Selector de fecha
- **Fecha Fin**: Selector de fecha

### Comportamiento Dinámico
- Los filtros se aplican a TODOS los gráficos y métricas simultáneamente
- Botón "Aplicar Filtros" actualiza todos los datos
- Botón "Limpiar Filtros" resetea al estado inicial
- Actualización en tiempo real según selección

## Estructura del Dashboard

```
┌─────────────────────────────────────────┐
│          HEADER CON TÍTULO              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       PANEL DE FILTROS (Grid)           │
│  [Año] [Trimestre] [Mes] [Tipo]         │
│  [Categoría] [Marca] [Descripción]      │
│  [Razón Social] [Fecha Inicio/Fin]      │
│  [Aplicar] [Limpiar]                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       KPIs PRINCIPALES (4 Cards)        │
│  [Productos] [Litros] [Promedio] [Ventas]│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       GRÁFICOS (Grid Responsive)        │
│  [Historial Ventas] [Evolución Tipo]   │
│  [Participación]    [Comparación Q]     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    PRODUCTOS MÁS VENDIDOS               │
│  [Gráfico Barras Horizontal]            │
│  [Tabla Top 10]                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    RENTABILIDAD POR PRODUCTO            │
│  [Tabla con Margen de Ganancia]         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    RENTABILIDAD POR CATEGORÍA           │
│  [Tabla Resumen]                        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    ANÁLISIS DE CLIENTES                 │
│  [Registrados] [Activos] [VIP]          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    RANKINGS DE CLIENTES                 │
│  [Por Cantidad] [Por Litros]            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    CLIENTES VIP DETALLADOS              │
│  [Tabla Top 15 con VIP Score]           │
└─────────────────────────────────────────┘
```

## Tecnologías Utilizadas

- **Angular 16**: Framework principal
- **Chart.js + ng2-charts**: Biblioteca de gráficos
- **FormsModule**: Para ngModel en filtros
- **HttpClient**: Comunicación con API
- **RxJS**: Manejo de observables
- **CSS Grid & Flexbox**: Layout responsive

## Configuración del Backend

El servicio está configurado para conectarse a:
```typescript
private apiUrl = 'http://localhost:3000/api/dashboard';
```

Si tu backend usa otra URL, modifica esta línea en `dashboard.service.ts`.

## Uso del Dashboard

### Navegación
Acceder a la ruta configurada para `DashboardRetrieveComponent` (usualmente `/dashboard`)

### Aplicar Filtros
1. Seleccionar los filtros deseados
2. Hacer clic en "Aplicar Filtros"
3. El dashboard se actualiza con los nuevos datos

### Resetear Vista
- Clic en "Limpiar Filtros" para volver al estado inicial

## Responsive Design

El dashboard es completamente responsive:
- **Desktop (>768px)**: Grid de múltiples columnas
- **Tablet (768px)**: Grid adaptativo
- **Mobile (<480px)**: Stack vertical de 1 columna

## Optimización y Performance

### Indicadores de Carga
- Loading states individuales por sección
- Mensajes informativos durante carga

### Estructura Modular
- Funciones separadas para cada tipo de datos
- Actualización independiente de charts
- Reutilización de configuraciones

### Formateo de Datos
- **formatCurrency()**: Formato de moneda argentina (ARS)
- **formatNumber()**: Separadores de miles
- Redondeo automático de decimales

## Próximos Pasos Sugeridos

### Mejoras UX
1. ✨ Agregar tooltips en gráficos
2. 📥 Exportación de datos (CSV, PDF)
3. 🔔 Alertas automáticas para cambios importantes
4. 💾 Guardar configuración de filtros preferidos

### Funcionalidades Adicionales
5. 📊 Dashboard personalizable (drag & drop)
6. 🎨 Temas de color personalizables
7. 📱 App móvil nativa
8. 🤖 Predicciones con Machine Learning

### Performance
9. ⚡ Caché de datos frecuentes
10. 🔄 Auto-refresh periódico
11. 📦 Lazy loading de secciones
12. 🎯 Paginación en tablas grandes

## Testing

Para verificar la instalación:

```bash
# Iniciar el backend
cd Back_Proyecto
npm start

# En otra terminal, iniciar el frontend
cd Front_Proyecto
npm start
```

Navegar a la ruta del dashboard y verificar que:
- ✅ Los KPIs se cargan correctamente
- ✅ Los gráficos se renderizan
- ✅ Los filtros funcionan
- ✅ Las tablas muestran datos

## Troubleshooting

### Error: Cannot find module 'ng2-charts'
```bash
npm install chart.js ng2-charts --legacy-peer-deps
```

### Error: HTTP 401 Unauthorized
Verificar que el usuario esté autenticado y el token JWT sea válido.

### Error: CORS
Verificar configuración CORS en el backend (`app.js`):
```javascript
app.use(cors({
  origin: 'http://localhost:4200'
}));
```

### Gráficos no se muestran
1. Verificar que `NgChartsModule` esté importado en `app.module.ts`
2. Verificar que haya datos disponibles
3. Revisar consola del navegador para errores

## Soporte

Para cualquier problema:
1. Revisar la consola del navegador (F12)
2. Verificar logs del backend
3. Comprobar que todos los endpoints respondan correctamente
4. Validar estructura de datos en las respuestas

---

**Estado**: ✅ Frontend completamente implementado y listo para usar
**Última actualización**: Enero 2026
