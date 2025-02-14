import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-cliente-manual',
  templateUrl: './agregar-cliente-manual.component.html',
  styleUrls: ['./agregar-cliente-manual.component.css']
})
export class AgregarClienteManualComponent {
  newUser = {
    email: '',
    password: '',
    businessName: '',
    cuit: '',
    phoneNumber: '',
    address: '',
    role: '',
    image: null as File | null,
    status: '',
    accepted: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {}

onImageSelected(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement.files && inputElement.files[0]) {
    this.newUser.image = inputElement.files[0];
  }
}

saveChanges() {
  const formData = new FormData();
  formData.append('email', this.newUser.email);
  formData.append('password', this.newUser.password);
  formData.append('businessName', this.newUser.businessName);
  formData.append('cuit', this.newUser.cuit);
  formData.append('phoneNumber', this.newUser.phoneNumber);
  formData.append('address', this.newUser.address);
  formData.append('role', this.newUser.role);
  formData.append('status', this.newUser.status);
  formData.append('accepted', this.newUser.accepted ? 'true' : 'false');
  if (this.newUser.image) {
    formData.append('image', this.newUser.image);
  }
  this.authService.addUser(formData).then(() => {
    Swal.fire('Cliente agregado', 'El cliente se agregó correctamente', 'success');
    this.activeModal.close(true);
  }).catch((error) => {
    Swal.fire('Error', 'No se pudo agregar el cliente', 'error');
    console.error('Error al agregar el cliente', error);
  });
}


close()
{
  this.activeModal.close();
}

}