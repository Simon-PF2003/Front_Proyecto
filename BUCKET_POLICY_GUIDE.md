# 📋 GUÍA RÁPIDA: Aplicar Bucket Policy desde CloudFront

## ⚡ MÉTODO MÁS FÁCIL (Recomendado)

CloudFront ya generó la bucket policy correcta con tu Account ID. Solo necesitas copiarla y pegarla.

### Pasos:

1. **Ve a CloudFront Console:**
   ```
   https://console.aws.amazon.com/cloudfront/v3/home?region=us-east-2#/distributions/E24TX5D8HBSCGM
   ```

2. **Haz click en el tab "Origins"**

3. **Busca el mensaje amarillo que dice:**
   ```
   "The S3 bucket policy needs to be updated"
   ``` 

4. **Haz click en "Copy policy"**
   - Esto copia la policy con TU Account ID ya incluido

5. **Ve a S3 Console:**
   ```
   https://s3.console.aws.amazon.com/s3/buckets/pf-frontend-angular-ironpeaks?region=us-east-2&tab=permissions
   ```

6. **En la sección "Bucket policy":**
   - Click "Edit"
   - Pega la policy que copiaste (Ctrl+V)
   - Click "Save changes"

7. **Vuelve a CloudFront**
   - Refresca la página
   - El mensaje amarillo debe desaparecer ✅

---

## 🔍 VERIFICACIÓN

Después de aplicar la policy:

```bash
# Debería retornar "403 Forbidden" (correcto, porque no hay index.html todavía)
curl -I https://dggiruoxpiew1.cloudfront.net

# Después del primer deploy debería retornar "200 OK"
curl -I https://dggiruoxpiew1.cloudfront.net
```

---

## 📝 ALTERNATIVA: Policy Manual

Si no aparece el mensaje en CloudFront, usa esta policy (reemplaza `YOUR_ACCOUNT_ID`):

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
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/E24TX5D8HBSCGM"
        }
      }
    }
  ]
}
```

**Para obtener tu Account ID:**
- AWS Console → Click en tu nombre (arriba derecha)
- El número que aparece es tu Account ID

---

**¡Eso es todo! Después de esto, configura los secrets de GitHub y haz push.** 🚀
