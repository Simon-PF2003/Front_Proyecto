import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  user: any = { role: null };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getUserData().subscribe({
      next: (response) => {
        this.user = response;
      },
      error: (error) => {
        console.log('No se pudo obtener información del usuario');
      }
    });
  }

  isAdministrador(): boolean {
    return this.user.role === 'Administrador';
  }

  isUsuarioComun(): boolean {
    return this.user.role === 'Usuario Comun';
  }

  abrirManual(): void {
    let pdfUrl = '';
    
    if (this.isAdministrador()) {
      pdfUrl = 'assets/manual-usuario-administrador.pdf';
    } else if (this.isUsuarioComun()) {
      pdfUrl = 'assets/manual-usuario-cliente.pdf';
    }

    if (pdfUrl) {
      // Crear un enlace temporal y hacer clic en él
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  }
}
