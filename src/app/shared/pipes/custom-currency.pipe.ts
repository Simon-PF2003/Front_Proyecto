import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string | null {
    if (value == null || value === '') return null;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return null;
    
    // Formatear el número con separador de miles (punto) y decimales (coma)
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
    
    return `$ ${formatted}`;
  }
}
