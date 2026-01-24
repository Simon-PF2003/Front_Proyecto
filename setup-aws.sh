#!/bin/bash

# AWS Deployment Helper Script (Bash version)
# Este script te ayuda a completar la configuración de AWS

echo "========================================"
echo "  AWS DEPLOYMENT HELPER SCRIPT"
echo "========================================"
echo ""

# 1. Obtener AWS Account ID
echo "1️⃣  Obteniendo tu AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "   ✅ AWS Account ID: $ACCOUNT_ID"
    echo ""
    
    # 2. Actualizar bucket policy
    echo "2️⃣  Actualizando bucket policy..."
    POLICY_PATH="aws-s3-bucket-policy.json"
    
    if [ -f "$POLICY_PATH" ]; then
        sed "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" "$POLICY_PATH" > "aws-s3-bucket-policy-updated.json"
        echo "   ✅ Bucket policy actualizada: aws-s3-bucket-policy-updated.json"
        echo ""
        
        # 3. Aplicar policy a S3
        echo "3️⃣  ¿Quieres aplicar la policy al bucket S3 ahora? (s/n): "
        read -r response
        
        if [ "$response" = "s" ] || [ "$response" = "S" ]; then
            echo "   Aplicando policy a S3..."
            aws s3api put-bucket-policy \
                --bucket pf-frontend-angular-ironpeaks \
                --policy file://aws-s3-bucket-policy-updated.json
            
            if [ $? -eq 0 ]; then
                echo "   ✅ Bucket policy aplicada exitosamente!"
            else
                echo "   ❌ Error al aplicar la bucket policy"
                echo "   💡 Puedes aplicarla manualmente desde la consola de AWS"
            fi
        else
            echo "   ⏭️  Saltando aplicación de policy"
            echo "   💡 Puedes aplicarla después con:"
            echo "      aws s3api put-bucket-policy --bucket pf-frontend-angular-ironpeaks --policy file://aws-s3-bucket-policy-updated.json"
        fi
    else
        echo "   ❌ No se encontró aws-s3-bucket-policy.json"
    fi
else
    echo "   ❌ Error: No se pudo obtener el Account ID"
    echo "   💡 Asegúrate de tener AWS CLI configurado con 'aws configure'"
fi

echo ""
echo "========================================"
echo "  PRÓXIMOS PASOS"
echo "========================================"
echo ""
echo "4️⃣  Configurar secrets en GitHub:"
echo "   https://github.com/Simon-PF2003/Front_Proyecto/settings/secrets/actions"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo ""
echo "5️⃣  Hacer deploy:"
echo "   git add ."
echo "   git commit -m 'feat: configurar deploy automático'"
echo "   git push origin main"
echo ""
echo "6️⃣  Verificar en CloudFront:"
echo "   https://dggiruoxpiew1.cloudfront.net"
echo ""
echo "========================================"
echo "  ✅ SCRIPT COMPLETADO"
echo "========================================"
