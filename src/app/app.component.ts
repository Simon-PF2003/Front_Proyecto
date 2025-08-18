import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'proyecto_final';
  showNavAndFooter = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Rutas donde NO queremos mostrar nav y footer
        const hideNavRoutes = ['/login', '/signup', '/retrieve-pass'];
        this.showNavAndFooter = !hideNavRoutes.includes(event.url);
      }
    });
  }
}
