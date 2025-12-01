import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

export class UserProfileComponent implements OnInit {
  selectedImageFile: File | null = null;
  decodedToken: any;
  user = {
    profileImage: null as string | null,
  };
  imageUrl: any;
  imagePath: string | null = null;
  userData: any; 
  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  defaultImage = 'assets/prodBase.png';

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();
    this.authService.getUserData().subscribe((data) => {
      this.userData = data;
      console.log(this.userData)
      this.imageUrl = this.authService.getUserImage(this.userData.id);
      console.log(this.imageUrl);
    });   
     
  }
  handleFileInput(event: any) {
    this.selectedImageFile = event.target.files[0];
    if (this.selectedImageFile) {
      if (event.target) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            this.user.profileImage = e.target.result;
          }
        };
        reader.readAsDataURL(this.selectedImageFile);
      }
    }
  }

  uploadProfileImage(event: Event) {
    event.preventDefault();
    console.log('SUBIR IMAGEN');
    if (this.selectedImageFile) {
      const authToken = localStorage.getItem('token');

      const headers = new HttpHeaders({
        Authorization: 'Bearer ' + authToken,
      });
      const formData = new FormData();
      formData.append('profileImage', this.selectedImageFile);

      this.http.post('http://localhost:3000/api/upload-profile-image', formData, { headers }).subscribe((response: any) => {
        this.imagePath = 'http://localhost:3000/uploadsProfileImages/' + response.imagePath;
        this.selectedImageFile = null;
        window.location.reload();
      });
    }
  }

  openUpdateModal() {
    const modalRef = this.modalService.open(ProfileUpdateComponent, { 
      size: 'lg',
      centered: true 
    });
    modalRef.componentInstance.userData = { ...this.userData };
  }
}

