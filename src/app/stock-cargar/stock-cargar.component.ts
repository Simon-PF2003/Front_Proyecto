import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-stock-cargar',
  templateUrl: './stock-cargar.component.html',
  styleUrls: ['./stock-cargar.component.css']
})
export class StockCargarComponent implements OnInit {

  constructor(
  ) {}
  ngOnInit(): void {
  }
}
