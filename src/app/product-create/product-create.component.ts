import { Component, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { SupplierService } from '../services/supplier.service';
import { CategorySelectionService, Category } from '../services/category.service';
import { BrandSelectionService, Brand } from '../services/brand.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit {
  categories: Category[] = [];
  suppliers: any[] = [];
  brands: Brand[] = [];
  selectedCategory: Category | null = null;
  isDropdownOpen: boolean = false;

  product = {
    desc: '',
    brand: '',
    stock: '',
    price: '',
    cat: '',         
    stockMin: '',
    featured: false,
    suppliers: [] as string[],
    image: null as File | null,
    categoryAttributes: {} as any
  }

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService,
    private supplierService: SupplierService,
    private categoryService: CategorySelectionService,
    private brandService: BrandSelectionService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();
    this.obtenerProveedores();
    this.cargarCategorias();
    this.cargarMarcas();
  }

  private cargarCategorias(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (e) => console.error('Error al cargar categorías', e)
    });
  }

  private cargarMarcas(): void {
    this.brandService.getBrands().subscribe({
      next: (brands) => this.brands = brands || [],
      error: (e) => console.error('Error al cargar marcas', e)
    });
  }

  onCategoryChange(): void {
    this.selectedCategory = this.categories.find(cat => cat._id === this.product.cat) || null;
    // Limpiar atributos anteriores
    this.product.categoryAttributes = {};
    
    // Inicializar atributos de la nueva categoría
    if (this.selectedCategory && this.selectedCategory.attributes) {
      this.selectedCategory.attributes.forEach(attr => {
        // Inicializar con valores por defecto según el tipo
        switch (attr.type) {
          case 'string':
            this.product.categoryAttributes[attr.key] = '';
            break;
          case 'number':
            this.product.categoryAttributes[attr.key] = null;
            break;
          case 'boolean':
            this.product.categoryAttributes[attr.key] = false;
            break;
          case 'date':
            this.product.categoryAttributes[attr.key] = '';
            break;
          default:
            this.product.categoryAttributes[attr.key] = '';
        }
      });
    }
  }

  obtenerProveedores(): void {
    this.supplierService.obtenerSuppliers().subscribe((data: any) => {
      this.suppliers = data;
      console.log(this.suppliers);
    });
  }

  onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      this.product.image = inputElement.files[0];
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  isSupplierSelected(supplierName: string): boolean {
    return this.product.suppliers.includes(supplierName);
  }

  onSupplierToggle(supplierName: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.product.suppliers.includes(supplierName)) {
        this.product.suppliers.push(supplierName);
      }
    } else {
      this.product.suppliers = this.product.suppliers.filter(s => s !== supplierName);
    }
  }

  removeSupplier(supplierToRemove: string): void {
    this.product.suppliers = this.product.suppliers.filter(supplier => supplier !== supplierToRemove);
  }

  selectAllSuppliers(): void {
    this.product.suppliers = this.suppliers.map(supplier => supplier.businessName);
  }

  clearAllSuppliers(): void {
    this.product.suppliers = [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.dropdown-container');
    
    if (!dropdownContainer) {
      this.isDropdownOpen = false;
    }
  }

  createNewProduct(): void {
    if (!this.product.cat) {
      Swal.fire({ icon: 'warning', title: 'Falta la categoría', text: 'Seleccioná una categoría.' });
      return;
    }

    const formData = new FormData();
    formData.append('desc', this.product.desc);
    formData.append('brand', this.product.brand);
    formData.append('stock', this.product.stock);
    formData.append('price', this.product.price);
    formData.append('cat', this.product.cat); 
    formData.append('stockMin', this.product.stockMin);
    formData.append('suppliers', JSON.stringify(this.product.suppliers));
    formData.append('featured', this.product.featured ? 'true' : 'false');
    formData.append('categoryAttributes', JSON.stringify(this.product.categoryAttributes));
    if (this.product.image) {
      formData.append('image', this.product.image);
    }

    this.productService.createNewProduct(formData).subscribe({
      next: (res) => {
        console.log(res);
        Swal.fire('Producto creado con éxito!!', '', 'success');
        this.product.desc = '';
        this.product.brand = '';
        this.product.price = '';
        this.product.stock = '';
        this.product.stockMin = '';
        this.product.image = null;
        this.product.suppliers = [];
        this.product.featured = false;
        this.product.cat = '';
        this.product.categoryAttributes = {};
        this.selectedCategory = null;
      },
      error: (err) => {
        console.log(err);
        if (err.status === 401) {
          Swal.fire({ icon: 'error', title: 'Registro fallido', text: 'El producto ya existe.' });
        } else if (err.status === 400) {
          const msg = err.error?.error || 'No se ha adjuntado una imagen.';
          Swal.fire({ icon: 'error', title: 'Registro fallido', text: msg });
        } else {
          Swal.fire({ icon: 'error', title: 'Registro fallido', text: err.error });
        }
      }
    });
  }
}
