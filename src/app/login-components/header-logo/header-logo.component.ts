import { Component } from '@angular/core';
import { MainHelperService } from '../../services/main-helper.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-logo.component.html',
  styleUrl: './header-logo.component.scss'
})
export class HeaderLogoComponent {


  constructor(public mainHelperService: MainHelperService) {
    
  }
}
