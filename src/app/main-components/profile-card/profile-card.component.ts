import { NgClass, NgIf, CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProfileCardOverlayService } from './profile-card-overlay.service';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [NgIf, NgClass, CommonModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {
  @Input({ required: true }) currentmessageUser?: string;
  @Input({ required: true }) currentmessageEmail?: string;
  @Input({ required: true }) currentmessageAvatar?: any;
  @Input({ required: true }) currentmessageStatus?: string;
  @Input({ required: true }) currentUserId?: string;
  @Input() showProfil?: string;
  constructor(public profilecardservice: ProfileCardOverlayService) { }

}
