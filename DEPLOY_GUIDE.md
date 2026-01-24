# 🚀 Deploy Frontend Angular en AWS (S3 + CloudFront)

## 📋 Configuración Actual

### Valores de Infraestructura
- **S3 Bucket:** `pf-frontend-angular-ironpeaks`
- **AWS Region:** `us-east-2` (Ohio)
- **CloudFront Distribution ID:** `E24TX5D8HBSCGM`
- **CloudFront Domain:** `https://dggiruoxpiew1.cloudfront.net`
- **Backend API:** `http://backend-app-env.eba-xfasrtvp.us-east-2.elasticbeanstalk.com`
- **Angular Dist:** `dist/proyecto_final`

---

## ✅ TAREAS COMPLETADAS

### 1. ✅ Configuración de Environments Angular
Se crearon los archivos de configuración para desarrollo y producción:

**Archivos creados:**
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción con URL del backend)

**angular.json actualizado** con file replacements para usar `environment.prod.ts` en builds de producción.

### 2. ✅ GitHub Actions Workflow
Se creó `.github/workflows/deploy-frontend.yml` con:
- Build automático en producción
- Upload optimizado a S3 (assets con cache largo, index.html sin cache)
- Invalidación automática de CloudFront
- Logs detallados de cada paso

### 3. ✅ Bucket Policy Template
Se creó `aws-s3-bucket-policy.json` listo para aplicar (requiere reemplazar YOUR_ACCOUNT_ID)

---

## 🔧 PASOS PENDIENTES (MANUAL EN AWS CONSOLE)

### A) Aplicar Bucket Policy (CRÍTICO)

1. **Obtener tu AWS Account ID:**
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

2. **Editar** `aws-s3-bucket-policy.json` y reemplazar `YOUR_ACCOUNT_ID` con tu Account ID real

3. **Aplicar la policy en S3:**
   - Ve a S3 → `pf-frontend-angular-ironpeaks`
   - Tab "Permissions" → "Bucket policy"
   - Pega el contenido de `aws-s3-bucket-policy.json` (ya editado)
   - Click "Save changes"

**O usando AWS CLI:**
```bash
# Primero edita el archivo con tu Account ID
aws s3api put-bucket-policy \
  --bucket pf-frontend-angular-ironpeaks \
  --policy file://aws-s3-bucket-policy.json
```

### B) Verificar CloudFront Configuration

#### Origin Settings (CRÍTICO):
1. Ve a CloudFront → Distribution `E24TX5D8HBSCGM` → Origins
2. Verifica que el Origin sea:
   - **Origin domain:** `pf-frontend-angular-ironpeaks.s3.us-east-2.amazonaws.com`
   - **Origin access:** Origin access control (OAC)
   - Si no existe OAC, créalo:
     - Name: `OAC-pf-frontend`
     - Signing behavior: Sign requests (recommended)
     - Origin type: S3

#### Behavior Settings:
1. Tab "Behaviors" → Default (*)
2. Verifica:
   - **Viewer protocol policy:** Redirect HTTP to HTTPS ✅
   - **Allowed HTTP methods:** GET, HEAD ✅
   - **Cache policy:** Managed-CachingOptimized ✅

#### Custom Error Pages (SPA Support):
1. Tab "Error pages"
2. Debe tener 2 configuraciones:

**Error 403:**
- HTTP error code: `403`
- Response page path: `/index.html`
- HTTP response code: `200`
- Error caching minimum TTL: `0`

**Error 404:**
- HTTP error code: `404`
- Response page path: `/index.html`
- HTTP response code: `200`
- Error caching minimum TTL: `0`

---

## 🚀 DEPLOY AUTOMÁTICO

### Configurar Secrets en GitHub

1. Ve a tu repo → Settings → Secrets and variables → Actions
2. Agrega estos secrets (si no existen):
   - `AWS_ACCESS_KEY_ID`: Tu access key de AWS
   - `AWS_SECRET_ACCESS_KEY`: Tu secret key de AWS

### Ejecutar Deploy

**Opción 1: Push a main**
```bash
git add .
git commit -m "feat: configurar deploy automático a CloudFront"
git push origin main
```

**Opción 2: Trigger manual**
- Ve a GitHub → Actions → "Deploy Frontend to S3 + CloudFront"
- Click "Run workflow"

---

## 🧪 VERIFICACIÓN POST-DEPLOY

### 1. Verificar que la app carga
```bash
curl -I https://dggiruoxpiew1.cloudfront.net
# Debe retornar 200 OK
```

### 2. Probar navegación SPA
- Abre: `https://dggiruoxpiew1.cloudfront.net`
- Navega a diferentes rutas (ej: `/products-list`, `/login`)
- **Refresca la página** (F5) en cada ruta
- ✅ NO debe mostrar 403/404

### 3. Verificar conexión con Backend
- Abre DevTools → Network
- Realiza alguna acción que llame al backend
- Verifica que las requests vayan a: `http://backend-app-env.eba-xfasrtvp.us-east-2.elasticbeanstalk.com`
- ✅ No debe haber errores CORS

---

## 🐛 TROUBLESHOOTING

### Error: 403 Forbidden al acceder a CloudFront
**Causa:** Bucket policy no aplicada o incorrecta  
**Solución:** Aplicar la bucket policy con tu Account ID correcto

### Error: 403/404 al refrescar rutas internas
**Causa:** Custom error pages mal configuradas  
**Solución:** Verificar que apunten a `/index.html` con HTTP 200

### Error: CORS al llamar al backend
**Causa:** Backend no tiene CORS habilitado para el dominio de CloudFront  
**Solución:** Agregar en backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://dggiruoxpiew1.cloudfront.net'
}));
```

### Build falla en Actions
**Causa:** Dependencias desactualizadas o faltantes  
**Solución:** 
```bash
npm ci
npm run build -- --configuration production
# Si funciona local, debería funcionar en Actions
```

---

## 📊 MÉTRICAS Y COSTOS

### Costos estimados (AWS Free Tier):
- **S3:** Primeros 5GB gratis
- **CloudFront:** 1TB transferencia gratis/mes (12 meses)
- **Requests:** Millones de requests gratis

### Monitoreo:
- CloudFront → Monitoring → Visualizar métricas
- S3 → Metrics → Ver uso de storage

---

## 🔐 SEGURIDAD

### Checklist:
- ✅ Bucket S3 privado (Block all public access: ON)
- ✅ Acceso solo vía CloudFront (OAC)
- ✅ HTTPS forzado (Redirect HTTP to HTTPS)
- ✅ Secrets en GitHub Actions (no hardcodeados)
- ⚠️ TODO: Configurar WAF para CloudFront (opcional)
- ⚠️ TODO: Dominio custom + SSL (opcional)

---

## 📝 PRÓXIMOS PASOS (OPCIONAL)

1. **Dominio custom:**
   - Comprar dominio en Route 53
   - Crear certificado SSL en ACM (us-east-1)
   - Asociar dominio a CloudFront

2. **CI/CD mejorado:**
   - Agregar tests antes del deploy
   - Deploy a staging primero
   - Rollback automático si falla

3. **Optimizaciones:**
   - Comprimir assets (Brotli/Gzip)
   - Lazy loading de módulos
   - Service Worker para PWA

---

## 📚 REFERENCIAS

- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [CloudFront OAC Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [GitHub Actions AWS Deploy](https://github.com/aws-actions)
