import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";

@Component({
  selector: 'app-retrieve-pass',
  templateUrl: './retrieve-pass.component.html',
  styleUrls: ['./retrieve-pass.component.css']
})
export class RetrievePassComponent {
  email: string = '';
  showVerificationForm: boolean = false;
  verificationCode: string = '';
  setPassword: boolean = false;
  newPassword: string = '';
  newPassword2: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {}

  async getUser(email: string) {
    try {
      await this.authService.sendVerificationCodeByEmail(this.email);
      this.showVerificationForm = true;
      Swal.fire('Listo', 'Si el email existe, te enviaremos un código', 'success');
    } catch (error) {
      Swal.fire('Denegado','Error al solicitar el código','warning');
      console.error('Error al solicitar código', error);
    }
  }

  async verifyCode(code: string): Promise<void> {
  try {
    await this.authService.compareCode(this.email, code);
    this.setPassword = true; // OK verificado
  } catch (error: any) {
    console.error('Error al verificar el código:', error);

    const status = error?.status;
    const serverMsg = error?.error?.message ?? error?.message ?? 'No se pudo verificar el código.';

    // Si quedó inutilizado (vencido o máximo de intentos), volvemos al paso de pedir código
    if (status === 410 || status === 429) {
      this.reloadPage();
    }

    await Swal.fire('Denegado', serverMsg, 'error');
  }
}

  async getNewPassword(): Promise<void> {
    try {
      if (this.newPassword !== this.newPassword2) {
        await Swal.fire('Denegado','Las contraseñas no coinciden','error');
        return; // importante para no llamar al back
      }

      await this.authService.setNewPassword(this.email, this.newPassword);

      await Swal.fire({ icon: 'success', title: 'Contraseña modificada', text: '' });
      this.router.navigate(['/login']);
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

  reloadPage() {
    this.showVerificationForm = false;
    this.setPassword = false;
    this.verificationCode = '';
  }
}
