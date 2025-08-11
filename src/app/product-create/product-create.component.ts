import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { SupplierService } from '../services/supplier.service';
@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit {
  product = {
    desc: '',
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
  ) {}
  
  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();
    this.obtenerProveedores();
  }

    obtenerProveedores() {
    this.supplierService.obtenerSuppliers().subscribe((data: any) => {
      this.suppliers = data; 
      console.log(this.suppliers);
    });
  }

  onImageSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      this.product.image = inputElement.files[0];
    }
  }

  createNewProduct() {
    const formData = new FormData();
    formData.append('desc', this.product.desc);
    formData.append('stock', this.product.stock);
    formData.append('price', this.product.price);
    formData.append('cat', this.product.cat);
    formData.append('stockMin', this.product.stockMin);
    formData.append('supplier', this.product.supplier);
    formData.append('featured', this.product.featured ? 'true' : 'false');
    if (this.product.image) {
      formData.append('image', this.product.image);
    }


    this.productService.createNewProduct(formData)
      .subscribe(
        {
          next:res => {
            console.log(res);
           Swal.fire(
             'Producto creado con éxito!!',
             '',
            'success'
           );
          },
          error:err => {
            console.log(err);
            if (err.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'Registro fallido',
                text: 'El producto ya existe.',
              });
            } else if (err.status === 400) {
              Swal.fire({
                icon: 'error',
                title: 'Registro fallido',
                text: 'No se ha adjuntado una imagen.',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Registro fallido',
                text: err.error,
              });
            }
          }
        }
        // res => {
        //   console.log(res);
        //   Swal.fire(
        //     'Producto creado con éxito!!',
        //     '',
        //     'success'
        //   );
        // },
        // (err) => {
        //   console.log(err);

        //   Swal.fire({
        //     icon: 'error',
        //     title: 'Registro fallido',
        //     text: err.error,
        //   });
        // }
      );

    this.product.desc = '';
    this.product.price = '';
    this.product.stock = '';
    this.product.stockMin = '';
    this.product.image = null;
    this.product.supplier= '';
    this.product.featured=false;
  }
}