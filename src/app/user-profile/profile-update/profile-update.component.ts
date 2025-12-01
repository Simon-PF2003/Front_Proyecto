import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css']
})
export class ProfileUpdateComponent implements OnInit {
  @Input() userData: any = {};
  
  // Variables para cambio de contraseña (siguiendo el modelo de retrieve-pass)
  showPasswordForm: boolean = false;
  showVerificationForm: boolean = false;
  setPassword: boolean = false; // Nueva variable para controlar cuándo se puede cambiar la contraseña
  verificationCode: string = '';
  newPassword: string = '';
  newPassword2: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Datos del usuario:', this.userData);
  }

  // Función para guardar cambios en los datos del usuario (excepto contraseña)
  saveChanges() {
    // Validaciones básicas
    if (!this.userData.email || !this.userData.businessName || !this.userData.phoneNumber || !this.userData.address) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('email', this.userData.email);
    formData.append('businessName', this.userData.businessName);
    formData.append('phoneNumber', this.userData.phoneNumber);
    formData.append('address', this.userData.address);
    formData.append('cuit', this.userData.cuit); // Importante: mantener el CUIT
    
    // Mantener valores que no se editan en este modal
    if (this.userData.status) {
      formData.append('status', this.userData.status);
    }
    if (this.userData.role) {
      formData.append('role', this.userData.role);
    }
    if (this.userData.accepted !== undefined) {
      formData.append('accepted', this.userData.accepted);
    }

    console.log('Actualizando usuario con ID:', this.userData.id);

    this.authService.updateUser(this.userData.id, formData).subscribe(
      {
        next: async res => {
          await Swal.fire('¡Éxito!', 'Datos actualizados correctamente', 'success');
          this.close();
        },
        error: err => {
          console.error('Error completo:', err);
          
          // Extraer el mensaje de error específico del backend
          let errorMessage = 'Error al actualizar los datos';
          
          if (err.error && err.error.message) {
            // Si el backend envía un mensaje específico
            errorMessage = err.error.message;
          } else if (err.error && typeof err.error === 'string') {
            // Si el error es un string directo
            errorMessage = err.error;
          } else if (err.message) {
            // Si hay un mensaje en el error
            errorMessage = err.message;
          }
          
          // Mostrar el error específico
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: errorMessage,
            confirmButtonText: 'Aceptar'
          });
        }
      }
    );
  }

  // Funciones para cambio de contraseña (EXACTAMENTE igual a retrieve-pass)
  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    // Resetear todo cuando se cancela
    if (!this.showPasswordForm) {
      this.resetPasswordForm();
    }
  }

  async sendVerificationCode() {
    try {
      await this.authService.sendVerificationCodeByEmail(this.userData.email);
      this.showVerificationForm = true;
      await Swal.fire('Listo', 'Si el email existe, te enviaremos un código', 'success');
    } catch (error) {
      await Swal.fire('Denegado', 'Error al solicitar el código', 'warning');
      console.error('Error al solicitar código', error);
    }
  }

  async verifyCode(): Promise<void> {
    try {
      // El backend valida todo: longitud, formato, intentos, expiración
      await this.authService.compareCode(this.userData.email, this.verificationCode);
      this.setPassword = true; // OK verificado - IGUAL que retrieve-pass
      await Swal.fire('Código verificado', 'Ahora puedes ingresar tu nueva contraseña', 'success');
    } catch (error: any) {
      console.error('Error al verificar el código:', error);
      
      const status = error?.status;
      const serverMsg = error?.error?.message ?? error?.message ?? 'No se pudo verificar el código.';

      // Si quedó inutilizado (vencido o máximo de intentos), volvemos al inicio
      if (status === 410 || status === 429) {
        this.resetPasswordForm();
      }

      await Swal.fire('Denegado', serverMsg, 'error');
    }
  }

  async changePassword(): Promise<void> {
    try {
      if (this.newPassword !== this.newPassword2) {
        await Swal.fire('Denegado', 'Las contraseñas no coinciden', 'error');
        return; // importante para no llamar al back
      }

      // El backend valida la longitud y caracteres especiales
      await this.authService.setNewPassword(this.userData.email, this.newPassword);

      await Swal.fire({ icon: 'success', title: 'Contraseña modificada correctamente', text: '' });
      
      // Resetear el formulario de contraseña y ocultarlo
      this.resetPasswordForm();
      this.showPasswordForm = false;
    } catch (error: any) {
      console.error('Error al cambiar la contraseña:', error);
      const msg =
        error?.error?.mensaje ||  
        error?.error?.message ||
        error?.message ||
        'No se pudo cambiar la contraseña.';
      await Swal.fire('Denegado', msg, 'error');
    }
  }

  resetPasswordForm() {
    this.showVerificationForm = false;
    this.setPassword = false;
    this.verificationCode = '';
    this.newPassword = '';
    this.newPassword2 = '';
  }

  close() {
    this.activeModal.close();
    location.reload();
  }
}
