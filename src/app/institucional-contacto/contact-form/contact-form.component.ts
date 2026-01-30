import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  ngOnInit() {
    // Cargar email del usuario si está logueado
    if (this.authService.loggedIn()) {
      this.authService.getUserData().subscribe({
        next: (userData) => {
          if (userData && userData.email) {
            this.formData.email = userData.email;
            if (userData.businessName) {
              this.formData.name = userData.businessName;
            }
          }
        },
        error: (err) => {
          console.error('Error al obtener datos del usuario:', err);
        }
      });
    }
  }

  submitForm() {
    const authToken= this.authService.getToken();
    
    const headers = {
      Authorization: 'Bearer ' + authToken,
    };
 console.log(headers);
    this.http.post(`${environment.apiUrl}/enviar-correo`, this.formData,{ headers }).subscribe(
      {
      next: response => {
        console.log('Formulario enviado:', this.formData);
          Swal.fire(
            'Mensaje enviado con éxito!!',
            '',
            'success'
          )

      },
      error: err => {
        console.error('Error al enviar el formulario:', err);
          
        Swal.fire({
          icon: 'warning',
          title: 'Error al enviar el formulario',
          text: err.error,
          showClass: {
            popup: 'swal2-noanimation',
          },
        });
      }
    }
    );
      this.formData.name = '';
      this.formData.email = '';
      this.formData.message = '';
  }
}
