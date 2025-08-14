import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';

@Component({
	selector: 'app-home-carousel',
	standalone: true,
	imports: [NgbCarouselModule, NgIf],
	templateUrl: './home-carousel.component.html',
})
export class HomeCarouselComponent {
	images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
}