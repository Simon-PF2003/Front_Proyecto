import { Component } from '@angular/core';
import { AuthService } from "../services/auth.service";
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alta-de-cliente',
  templateUrl: './alta-de-cliente.component.html',
  styleUrls: ['./alta-de-cliente.component.css']
})
export class AltaDeClienteComponent {
  users: any[] = [];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
      this.authService.getPendingUsers().subscribe(
        {
          next:res => {
            console.log(res);
            this.users = res;
          },
          error:err => {
            console.log(err);
          }
        }
      );
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  rejectUser(userId: string, userEmail: string) {
    Swal.fire({
      title:'¿Está seguro de que quiere rechazar al usuario?',
      text: `El usuario con email ${userEmail} será rechazado y se le enviará un email informándole de la decisión`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.rejectUser(userEmail).subscribe(
        {
          next: res => {
            console.log(res);
            this.fetchUsers();
            Swal.fire({
              title: 'Usuario rechazado correctamente',
              text: `Se ha enviado un email a ${userEmail}`,
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          },
          error:err => {
            console.log(err);
            Swal.fire({
              title: 'Error al rechazar el usuario',
              text: err.error,
              icon: 'error',
              confirmButtonText: 'Aceptar'
              });
            }
          }
        );
      }
    });
  }

  acceptUser(user: any) {
    Swal.fire({
      title:'¿Está seguro de que quiere aceptar al usuario?',
      text: `El usuario con email ${user.email} será aceptado y se le enviará un email con la contraseña generada`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const password = this.generateRandomPassword();
        
        try {
          this.authService.acceptUser(user._id, user.email, password).subscribe(
            {
              next: (res: any) => {
                console.log(res);
                this.fetchUsers();
                Swal.fire({
                  title: 'Usuario aceptado correctamente',
                  text: `Se ha enviado un email a ${user.email} con la contraseña generada`,
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                });
              },
              error:(err: any) => {
                console.error('Error al aceptar el usuario:', err);
                Swal.fire({
                  title: 'Error al aceptar el usuario',
                  text: err.error,
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
              }
            }
          );
        }
        catch (error) {
          console.error('Error al aceptar el usuario:', error);
        }
      }
    });
  }

  
  generateRandomPassword() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_%&$#';
    let password = '';
    for (let i = 0; i < length; i++) {
      const at = Math.floor(Math.random() * charset.length);
      password += charset.charAt(at);
    }
    return password;
  }
}
