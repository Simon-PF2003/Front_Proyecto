import { Component, OnInit, Input } from '@angular/core';
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

      if (this.editedProduct) {
        if (this.editedProduct.supplier) {
          const supplierId = typeof this.editedProduct.supplier === 'object' 
            ? this.editedProduct.supplier._id 
            : this.editedProduct.supplier;
            
          const supplierFound = this.suppliers.find(sup => sup._id === supplierId);
          if(supplierFound) {
            this.editedProduct.supplier = supplierFound.businessName;
          } else {
            this.editedProduct.supplier = '';
          }
        } else {
          this.editedProduct.supplier = '';
        }
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

  saveChanges() {
    const formData = new FormData();
  
    // Agregar todos los campos del producto al FormData
    for (const key in this.editedProduct) {
      if (key !== 'image') { // La imagen se añade por separado
        formData.append(key, this.editedProduct[key]);
      }
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
          Swal.fire({
            icon: 'error',
            title: 'Actualización fallida',
            text: err.error,
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
