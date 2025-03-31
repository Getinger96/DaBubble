import { Component } from '@angular/core';
import { HeaderComponent } from '../shared-components/header/header.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [HeaderComponent, RouterLink],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
