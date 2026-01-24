# 🚀 DEPLOY FRONTEND ANGULAR - RESUMEN COMPLETO

## ✅ TODO LO QUE SE HA CONFIGURADO AUTOMÁTICAMENTE

### 1. Configuración de Environments ✅
- `src/environments/environment.ts` (desarrollo - localhost:8080)
- `src/environments/environment.prod.ts` (producción - Elastic Beanstalk)

### 2. Servicio Centralizado de API ✅
- `src/app/services/api-config.service.ts` - Gestiona URLs dinámicamente según environment

### 3. Todos los Servicios Actualizados ✅
12 servicios ahora usan configuración dinámica:
- auth.service.ts
- product.service.ts
- cart-service.service.ts  
- category.service.ts
- brand.service.ts
- order.service.ts
- bill.service.ts
- chatbot.service.ts
- dashboard.service.ts
- mercadopago.service.ts
- supplier.service.ts
- purchase-order.service.ts

### 4. Workflow de GitHub Actions ✅
- `.github/workflows/deploy-frontend.yml` - Deploy automático con:
  - Build en producción
  - Upload optimizado a S3 (assets con cache, index.html sin cache)
  - Invalidación de CloudFront
  - Logs detallados

### 5. Configuración Angular ✅
- `angular.json` - File replacements para producción configurado
- Build exitoso verificado (sin errores de compilación)

### 6. Documentación Completa ✅
- `DEPLOY_GUIDE.md` - Guía paso a paso
- `DEPLOYMENT_SUMMARY.md` - Resumen ejecutivo
- `aws-s3-bucket-policy.json` - Template de bucket policy

---

## ⚠️ PASOS MANUALES NECESARIOS (3 pasos simples)

### PASO 1: Aplicar Bucket Policy en S3 (CRÍTICO)

**Opción A: Desde AWS Console (MÁS FÁCIL)**
1. Ve a AWS S3 Console → Bucket `pf-frontend-angular-ironpeaks`
2. Tab "Permissions" → "Bucket policy"  
3. Click en "Edit"
4. Pega esta policy (reemplaza `123456789012` con tu AWS Account ID):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pf-frontend-angular-ironpeaks/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E24TX5D8HBSCGM"
        }
      }
    }
  ]
}
```

5. Click "Save changes"

**💡 Para obtener tu Account ID:**
- AWS Console → Click en tu nombre (arriba derecha) → Account ID aparece ahí
- O desde CloudFront → Distribution → Origins → "Copy policy" (ya tiene tu Account ID)

---

### PASO 2: Configurar Secrets en GitHub (REQUERIDO)

1. Ve a: https://github.com/Simon-PF2003/Front_Proyecto/settings/secrets/actions
2. Click "New repository secret"
3. Agrega estos 2 secrets:

**Secret 1:**
- Name: `AWS_ACCESS_KEY_ID`
- Value: Tu AWS Access Key

**Secret 2:**
- Name: `AWS_SECRET_ACCESS_KEY`  
- Value: Tu AWS Secret Key

**💡 Si no tienes Access Keys:**
- AWS Console → IAM → Users → Tu usuario → Security credentials
- Click "Create access key" → "Application running outside AWS"

---

### PASO 3: Hacer Push y Deploy

```bash
# Revisar cambios
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: configurar deploy automático a CloudFront con API dinámica"

# Push (esto triggers el deploy automático)
git push origin main
```

**O ejecutar manualmente desde GitHub:**
- Ve a: https://github.com/Simon-PF2003/Front_Proyecto/actions
- Click en "Deploy Frontend to S3 + CloudFront"
- Click "Run workflow" → "Run workflow"

---

## 🧪 VERIFICACIÓN POST-DEPLOY

### 1. Ver el workflow en GitHub Actions
- https://github.com/Simon-PF2003/Front_Proyecto/actions
- Debe mostrar ✅ en todos los pasos

### 2. Probar la aplicación
```
URL: https://dggiruoxpiew1.cloudfront.net
```

**Pruebas a realizar:**
1. ✅ La app carga correctamente
2. ✅ Navegar a diferentes rutas (/products-list, /login, etc.)
3. ✅ Presionar F5 en cada ruta (NO debe dar 403/404)
4. ✅ Verificar que las llamadas al backend funcionan (DevTools → Network)

### 3. Verificar conexión con backend
- Abrir DevTools (F12) → Tab "Network"
- Realizar una acción que llame al backend
- Las requests deben ir a: `http://backend-app-env.eba-xfasrtvp.us-east-2.elasticbeanstalk.com`
- ✅ NO debe haber errores CORS

---

## 📊 CONFIGURACIÓN FINAL

### URLs de Producción:
- **Frontend CloudFront:** https://dggiruoxpiew1.cloudfront.net
- **Backend Elastic Beanstalk:** http://backend-app-env.eba-xfasrtvp.us-east-2.elasticbeanstalk.com

### Infraestructura AWS:
- **S3 Bucket:** pf-frontend-angular-ironpeaks
- **CloudFront ID:** E24TX5D8HBSCGM
- **Región:** us-east-2 (Ohio)
- **Dist Directory:** dist/proyecto_final

### Configuración CloudFront (YA ESTÁ):
- ✅ Origin: S3 regional endpoint
- ✅ OAC: Configurado
- ✅ HTTPS: Redirect HTTP to HTTPS
- ✅ Cache Policy: Managed-CachingOptimized
- ✅ Custom Error Pages: 403/404 → /index.html (HTTP 200)

---

## 🐛 TROUBLESHOOTING

### Error: "403 Forbidden" en CloudFront
**Solución:** Aplicar bucket policy del PASO 1

### Error: "403/404" al refrescar rutas
**Solución:** Verificar Custom Error Pages en CloudFront apunten a /index.html con HTTP 200

### Error: Workflow falla en "Configure AWS credentials"  
**Solución:** Configurar secrets del PASO 2

### Error: CORS desde frontend
**Solución:** Verificar que el backend tenga `app.use(cors())` habilitado

---

## 📈 FLUJO DE DEPLOY AUTOMÁTICO

```
┌─────────────────┐
│  git push main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Se activa     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ npm ci & build  │
│  (producción)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Upload a S3   │
│ (assets cache,  │
│ index no-cache) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Invalidate    │
│   CloudFront    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ App disponible  │
│ en CloudFront   │
└─────────────────┘
```

---

## 🎯 CHECKLIST FINAL

Antes de hacer deploy, verifica:

- [ ] Bucket policy aplicada en S3 (PASO 1)
- [ ] Secrets configurados en GitHub (PASO 2)
- [ ] Build local funciona: `npm run build -- --configuration production`
- [ ] CloudFront tiene Custom Error Pages configuradas
- [ ] Backend tiene CORS habilitado

Después del deploy, verifica:

- [ ] Workflow completó exitosamente en GitHub Actions
- [ ] App carga en https://dggiruoxpiew1.cloudfront.net
- [ ] Refresh en rutas NO da 403/404
- [ ] Llamadas al backend funcionan sin errores CORS
- [ ] Assets tienen cache correcto (DevTools → Network → Cache-Control)

---

## 🎉 RESULTADO

✅ **12 servicios** usando configuración dinámica de API  
✅ **Environments** separados para desarrollo y producción  
✅ **GitHub Actions** configurado para deploy automático  
✅ **S3 + CloudFront** listos para recibir el build  
✅ **SPA routing** soportado con Custom Error Pages  
✅ **Build exitoso** verificado (2.07 MB, sin errores)  

**Solo falta:**
1. Aplicar bucket policy (1 min)
2. Configurar secrets en GitHub (2 min)
3. Hacer push (automático después)

---

**¡Todo listo para production deploy! 🚀**

Para cualquier duda, revisa:
- `DEPLOY_GUIDE.md` - Guía detallada
- `DEPLOYMENT_SUMMARY.md` - Resumen ejecutivo
- GitHub Actions logs - Errores de deployment
