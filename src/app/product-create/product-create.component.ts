import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { SupplierService } from '../services/supplier.service';
import { CategorySelectionService, Category } from '../services/category.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit {
  categories: Category[] = [];

  product = {
    desc: '',
    brand: '',
    stock: '',
    price: '',
    cat: '',         
    stockMin: '',
    featured: false,
    supplier: '',
    image: null as File | null
  }

  suppliers: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService,
    private supplierService: SupplierService,
    private categoryService: CategorySelectionService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();
    this.obtenerProveedores();
    this.cargarCategorias();
  }

  private cargarCategorias(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (e) => console.error('Error al cargar categorías', e)
    });
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
    formData.append('supplier', this.product.supplier);
    formData.append('featured', this.product.featured ? 'true' : 'false');
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
        this.product.supplier = '';
        this.product.featured = false;
        this.product.cat = '';
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
