import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserStateService } from './user-state.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL = 'http://localhost:3000/api';
  private _userRole: string | null = null;
  get userRole(): string | null {
    return this._userRole;
  
  }
  constructor(
    private http: HttpClient,
    private router: Router,
    private userStateService: UserStateService
  ) { }

  //POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
  signUp(user: any) {
    return this.http.post<any>(this.URL + '/signup', user);
  }
    //agrega al cliente de forma manual
  addUser(user: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.URL + '/addUser', user).subscribe(
        {
          next: response => {
            if (response) {
              console.log('Cliente agregado:', response);
              resolve(response);
            } else {
              console.log('No se pudo agregar el cliente');
              reject('No se pudo agregar el cliente');
            }
          },
          error: error => {
            console.error('Error en la solicitud HTTP', error);
            reject(error);
          }
        }
      );
    });
  }

  logIn(user: any): Observable<any> {
    return this.http.post<any>(this.URL + '/login', user).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this._userRole = response.role;
        this.userStateService.userRole = response.role;
      })
    );
  }
    //Estos dos son para recuperar la contraseña
  sendVerificationCodeByEmail(email: string, code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestBody = { email, code }; // Crear el cuerpo de la solicitud con el email y el código

    this.http.post<any>(this.URL + '/sendCode', requestBody).subscribe(
      {
        next: response => {
          if (response) {
            console.log('Código enviado correctamente:', response);
            resolve(response);
          } else {
            console.log('No se recibió una respuesta válida del servidor');
            reject('No se recibió una respuesta válida del servidor');
          }
        },
        error: error => {
          console.error('Error en la solicitud HTTP', error);
          reject(error);
        }
      }
    );
  });
}

compareCode(email:string, code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestBody = { email, code };

    this.http.post<any>(this.URL + '/compareCode', requestBody).subscribe(
      {
        next: response => {
          if (response) {
            console.log('Código ingresado correctamente:', response);
            resolve(response);
          } else {
            console.log('No se recibió una respuesta válida del servidor');
            reject('No se recibió una respuesta válida del servidor');
          }
        },
        error: error => {
          console.error('Error en la solicitud HTTP', error);
          reject(error);
        }
      }
    );
  });
}

  //GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS 
    //recupera usuarios para aceptarlos o rechazarlos.
  getPendingUsers(): Observable<any[]> {
    console.log('Obteniendo usuarios pendientes');
    return this.http.get<any[]>(`${this.URL}/pendingUsers`);
  }

  getUserDiscount(user: any): Observable<any> {
    return this.http.get<any>(`${this.URL}/user-discount/${user}`);
  }


  rejectUser(email: string) {
    return this.http.patch<any>(`${this.URL}/rejectUser/${ email }`, {});
  }

  acceptUser(id: string, email: string, password: string) {
    return this.http.patch<any>(`${this.URL}/acceptUser/${ email }`, { password });
  }

  loggedIn() {
    return !!localStorage.getItem('token');
  }

  getToken(){
    return localStorage.getItem('token');
  }

  getUserData(): Observable<any> {
    const authToken = this.getToken();

    if (!authToken) {
      return new Observable<any>((observer) => {
        observer.error('No hay token de autenticación.');
      });
    }

    const headers = {
      Authorization: 'Bearer ' + authToken,
    };

    return this.http.get<any>(this.URL + '/user', { headers });
  }

  getUserImage(userId: any){
    return `${this.URL}/getUserImage/${userId}`;
  }

    //Devuelve los usuarios para modificarlos (Es para la interfaz del update)
  getUsers(authToken: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      this.http.get<any[]>(this.URL + '/allUsers', { headers }).subscribe(
        {
          next: response => {
            if (response) {
              console.log('Clientes encontrados:', response);
              const clientes = response;
              resolve(clientes);
            } else {
              console.log('No se encontraron clientes');
              reject('No se encontraron clientes');
            }
          },
          error: error => {
            console.error('Error en la solicitud HTTP', error);
            reject(error);
          }
        }
      );
    });
  }

    //Busca un cliente por su CUIL
  async getClienteCuil(cuit: string, authToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    
    this.http.get<any>(this.URL + `/searchUser/${cuit}`, { headers }).subscribe(
      {
        next:response => {
              if (response) {
                const cliente = response;
                resolve(cliente); 
            } else {
                console.log('Cliente no encontrado');
                reject('Cliente no encontrado'); 
                   }
                        },
        error:error => {
                  console.error('Error en la solicitud HTTP', error);
                  reject(error);
                     }
      }
    );
  });
}
  //Busca cliente por razon social o cuil
async searchClientes(query: string, authToken: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    
    this.http.get<any>(this.URL + `/searchUser/${query}`, { headers }).subscribe(
      {
        next:response => {
              if (response) {
                console.log('Cliente encontrado:', response);
                const cliente = response;
                resolve(cliente); 
            } else {
                console.log('Cliente no encontrado');
                reject('Cliente no encontrado'); 
                   }
                        },
        error:error => {
                  console.error('Error en la solicitud HTTP', error);
                  reject(error);
                     }
      }
    );
  });
}


  //Obtiene cliente por su pedido
getOrderUser(userId: any): Promise<any> {
    return new Promise((resolve, reject) => {    
    this.http.get<any>(this.URL + `/userById/${userId}`).subscribe(
      {
        next:response => {
              if (response) {
                console.log('Cliente encontrado:', response);
                const cliente = response;
                resolve(cliente); 
            } else {
                console.log('Cliente no encontrado');
                reject('Cliente no encontrado'); 
                   }
                        },
        error:error => {
                  console.error('Error en la solicitud HTTP', error);
                  reject(error);
                     }
      }
    );
  });
  }

  //para la recuperacion de contraseña
async getClientByEmail(email: string): Promise<any[]> {
  return new Promise((resolve, reject) => {    
    this.http.get<any>(this.URL + `/user/${email}`).subscribe(
      {
        next:response => {
              if (response) {
                console.log('Cliente encontrado:', response);
                const cliente = response;
                resolve(cliente); 
            } else {
                console.log('Cliente no encontrado');
                reject('Cliente no encontrado'); 
                   }
                        },
        error:error => {
                  console.error('Error en la solicitud HTTP', error);
                  reject(error);
                     }
      }
    );
  });
}

  //reporte de los clientes.
getFilteredClients(filters: any): Observable<any> {
  const queryParams = new URLSearchParams({
    criteria: filters.sortCriteria,
    startDate: filters.dateRangeStart,
    endDate: filters.dateRangeEnd,
    sortOrder: filters.sortOrder
  }).toString();

  return this.http.get<any[]>(`${this.URL}/clients/filters?${queryParams}`);
}


async getClienteEmail(cuit: string, authToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };
    console.log('Este es el CUIT ingresado', cuit);
    
    this.http.get<any>(this.URL + `/user/${cuit}`, { headers }).subscribe(

      {
        next:response => {
          if (response) {
          console.log('Cliente encontrado:', response);
          const cliente = response;
           resolve(cliente); 
        } else {
           console.log('Cliente no encontrado');
           reject('Cliente no encontrado');
         }
        },
        error:error => {
          console.error('Error en la solicitud HTTP', error);
          reject(error);
        }
      }
    );
  });
}

  isAuthenticated(): boolean {
      const token = localStorage.getItem('token'); 
      if (token) {
        return true;
      }
      return false;
    }

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
  updateUser(userId: string, user: FormData) {
    const url = `${this.URL}/updateUser/${userId}`;
    return this.http.patch(url, user);
  }
  
  asignPrivileges(userId: string) { 
    const url = `${this.URL}/asignPrivileges/${userId}`;
    return this.http.patch(url, { role: 'Administrador' });
  }
  
  modifyStatus(userId: string, newStatus: string) {
    const url = `${this.URL}/modifyStatus/${userId}`;
    return this.http.patch(url, { status: newStatus });
  }

  setNewPassword(email:string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestBody = { email, password }; 

      this.http.patch<any>(this.URL + '/newPassword', requestBody).subscribe(
        {
          next: response => {
            if (response) {
              console.log('Contraseña actualizada correctamente:', response);
              resolve(response);
            } else {
              console.log('No se recibió una respuesta válida del servidor');
              reject('No se recibió una respuesta válida del servidor');
            }
          },
          error: error => {
            console.error('Error en la solicitud HTTP', error);
            reject(error);
          }
        }
      );
    });
  }

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
  deleteCliente(userId:string){ 
    const url = `${this.URL}/deleteUser/${userId}`;         
    return this.http.delete(url);
  }


//EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA 
  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    this.router.navigate(['/login']);
  }

    checkAuthAndRedirect(): void {
      if (!this.isAuthenticated()) {
        this.router.navigate(['/login']); 
      }
    }

  }