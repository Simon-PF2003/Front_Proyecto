import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../../services/product.service';
import { BrandSelectionService } from 'src/app/services/brand.service';
import { CategorySelectionService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-product-update-modal',
  templateUrl: './product-update-modal.component.html',
  styleUrls: ['./product-update-modal.component.css']
})
export class ProductUpdateModalComponent implements OnInit {
  @Input() editedProduct: any;
  suppliers: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  isDropdownOpen: boolean = false;
  public value: string='';

  constructor(
    public activeModal: NgbActiveModal,
    private productService: ProductService,
    private supplierService: SupplierService,
    private categoryService: CategorySelectionService,
    private brandService: BrandSelectionService
  ) {}

  ngOnInit() {
    if (!this.editedProduct) {
      this.editedProduct = {};
    }
    
    this.obtenerProveedores();
    this.obtenerCategorias();
    this.obtenerMarcas();
  }

obtenerMarcas() {
  this.brandService.getBrands().subscribe((data: any) => {
    this.brands = data;
    console.log("marcas del modal", this.brands);

    if (this.editedProduct) {
      if (this.editedProduct.brand) {
        const brandId = typeof this.editedProduct.brand === 'object' 
          ? this.editedProduct.brand._id 
          : this.editedProduct.brand;

        const brandFound = this.brands.find(brand => brand._id === brandId);
        if(brandFound) {
          this.editedProduct.brand = brandFound.brand;
        } else {
          this.editedProduct.brand = '';
        }
      } else {
        this.editedProduct.brand = '';
      }
    }
  });
}

obtenerProveedores() {
    this.supplierService.obtenerSuppliers().subscribe((data: any) => {
      this.suppliers = data; 
      console.log("suppliers del modal", this.suppliers);
      console.log("editedProduct al cargar proveedores", this.editedProduct);

      if (this.editedProduct) {
        if (!this.editedProduct.suppliers) {
          this.editedProduct.suppliers = [];
        }

        if (this.editedProduct.supplier && !Array.isArray(this.editedProduct.suppliers)) {
          const supplierId = typeof this.editedProduct.supplier === 'object' 
            ? this.editedProduct.supplier._id 
            : this.editedProduct.supplier;
            
          const supplierFound = this.suppliers.find(sup => sup._id === supplierId);
          if (supplierFound) {
            this.editedProduct.suppliers = [supplierFound.businessName];
          } else {
            this.editedProduct.suppliers = [];
          }
          delete this.editedProduct.supplier;
        } 
        else if (Array.isArray(this.editedProduct.suppliers)) {
          console.log("Suppliers es array, procesando...", this.editedProduct.suppliers);
          
          this.editedProduct.suppliers = this.editedProduct.suppliers.map((supplier: any, index: number) => {
            console.log(`Procesando supplier ${index}:`, supplier, "Tipo:", typeof supplier, "Length:", supplier?.length);
            
            if (typeof supplier === 'string' && supplier.length === 24 && /^[0-9a-fA-F]{24}$/.test(supplier)) {
              console.log(`Es ObjectId string:`, supplier);
              const supplierFound = this.suppliers.find((sup: any) => sup._id === supplier);
              const result = supplierFound ? supplierFound.businessName : supplier;
              console.log(`Resultado para ObjectId ${supplier}:`, result);
              return result;
            }
            else if (typeof supplier === 'object' && supplier !== null) {
              console.log("Es objeto:", supplier);
              if (supplier._id) {
                const supplierFound = this.suppliers.find((sup: any) => sup._id === supplier._id);
                const result = supplierFound ? supplierFound.businessName : supplier.businessName || '';
                console.log(`Resultado para objeto con _id ${supplier._id}:`, result);
                return result;
              }
              const result = supplier.businessName || '';
              console.log(`Resultado para objeto sin _id:`, result);
              return result;
            }
            console.log("Es string no-ObjectId:", supplier);
            return supplier;
          }).filter((name: any) => name && name.trim() !== '');
          
          console.log("Suppliers finales después del mapeo:", this.editedProduct.suppliers);
        } 
        else {
          this.editedProduct.suppliers = [];
        }
        
        console.log("suppliers procesados", this.editedProduct.suppliers);
      }
    });
  }
  
  obtenerCategorias() {
    this.categoryService.getCategories().subscribe((data: any) => {
      this.categories = data;
      console.log("categorías del modal", this.categories);

      if (this.editedProduct) {
        if (this.editedProduct.cat) {
          const categoryId = typeof this.editedProduct.cat === 'object' 
            ? this.editedProduct.cat._id 
            : this.editedProduct.cat;
            
          const categoryFound = this.categories.find(cat => cat._id === categoryId);
          if(categoryFound) {
            this.editedProduct.cat = categoryFound.type;
          } else {
            this.editedProduct.cat = '';
          }
        } else {
          this.editedProduct.cat = '';
        }
      }
    });
  }

  onImageSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      this.editedProduct.image = inputElement.files[0];
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  isSupplierSelected(supplierName: string): boolean {
    return this.editedProduct.suppliers && this.editedProduct.suppliers.includes(supplierName);
  }

  onSupplierToggle(supplierName: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (!this.editedProduct.suppliers) {
      this.editedProduct.suppliers = [];
    }
    
    if (checkbox.checked) {
      if (!this.editedProduct.suppliers.includes(supplierName)) {
        this.editedProduct.suppliers.push(supplierName);
      }
    } else {
      this.editedProduct.suppliers = this.editedProduct.suppliers.filter((s: string) => s !== supplierName);
    }
  }

  removeSupplier(supplierToRemove: string): void {
    if (this.editedProduct.suppliers) {
      this.editedProduct.suppliers = this.editedProduct.suppliers.filter((supplier: string) => supplier !== supplierToRemove);
    }
  }

  selectAllSuppliers(): void {
    this.editedProduct.suppliers = this.suppliers.map(supplier => supplier.businessName);
  }

  clearAllSuppliers(): void {
    this.editedProduct.suppliers = [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.dropdown-container');
    
    if (!dropdownContainer) {
      this.isDropdownOpen = false;
    }
  }

  saveChanges() {
    const formData = new FormData();
  
    // Agregar todos los campos del producto al FormData
    for (const key in this.editedProduct) {
      if (key !== 'image' && key !== 'suppliers') { // La imagen y suppliers se añaden por separado
        formData.append(key, this.editedProduct[key]);
      }
    }

    // Agregar suppliers como JSON string
    if (this.editedProduct.suppliers) {
      formData.append('suppliers', JSON.stringify(this.editedProduct.suppliers));
    }
  
    // Agregar la imagen solo si existe
    if (this.editedProduct.image) {
      formData.append('image', this.editedProduct.image);
    }
  
    // Enviar el FormData al servicio
    this.productService.updateProduct(formData, this.editedProduct._id).subscribe(
      {
        next: res => {
          Swal.fire('Producto actualizado con éxito!!', '', 'success');
          console.log("editedProduct", res);
        },
        error: err => {
          console.log(err);
          let errorMessage = err.error;
          
          // Si el error es 400, mostrar mensaje específico para proveedores
          if (err.status === 400) {
            errorMessage = 'Debe seleccionar al menos a un proveedor';
          } else if (err.status === 402) {
            errorMessage = 'Debe proporcionar una categoría';
          }

          Swal.fire({
            icon: 'error',
            title: 'Actualización fallida',
            text: errorMessage,
          });
        }
      }
    );
  }
  

  close() {
    this.activeModal.close(this.editedProduct);
    location.reload();
  }
}
