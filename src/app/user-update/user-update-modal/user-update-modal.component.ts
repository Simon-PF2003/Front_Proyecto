import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-update-modal',
  templateUrl: './user-update-modal.component.html',
  styleUrls: ['./user-update-modal.component.css']
})
export class UserUpdateModalComponent {
  @Input() 
  editedUser: any = { acceptance: true };


  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    //console.log('Usuario recibido', this.editedUser);
    if(this.editedUser.acceptance === undefined) {
      this.editedUser.acceptance = true;
    }
  }

  onImageSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      this.editedUser.image = inputElement.files[0];
    }
  }

  saveChanges() {
    const formData = new FormData();
    for (const key in this.editedUser) {
      if (key !== 'image') {
        formData.append(key, this.editedUser[key]);
      }
    }

    if(this.editedUser.image) {
      formData.append('image', this.editedUser.image);
    }

    console.log('Form data', formData);
    this.authService.updateUser(this.editedUser._id, formData).subscribe(
      {
        next: res => {
          Swal.fire('Usuario actualizado con éxito!!', '', 'success');
        },
        error: err => {
          if (err.status === 403) {
                      Swal.fire({
                        title: 'Actualización fallida',
                        html: `<p class="text-muted mt-2">${err.error.message || ''}</p>`,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                      });
          } else {
            Swal.fire('Error', 'Error al actualizar el usuario', 'error');
          }
        }
      }
    );
  }

  close() {
    this.activeModal.close();
    location.reload();
  }
}


