import { NgClass, NgIf, CommonModule, } from '@angular/common';
import { Component, Input, Output, EventEmitter,  OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { ProfileCardOverlayService } from './profile-card-overlay.service';
import { collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [NgIf, NgClass, CommonModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent implements OnChanges  {
  @Input({ required: true }) currentmessageUser?: string;
  @Input({ required: true }) currentmessageEmail?: string;
  @Input({ required: true }) currentmessageAvatar?: any;
  @Input({ required: true }) currentmessageStatus?: string;
  @Input({ required: true }) currentUserId?: string;
  @Input() showProfil?: string;
  @Output() profileClosed = new EventEmitter<void>(); 
  isReady = false;
  user!:string
  email!:string
  avatar!:any
  status!:string
  id!:string
  constructor(public profilecardservice: ProfileCardOverlayService, private cd: ChangeDetectorRef) { }


  ngOnChanges(changes: SimpleChanges): void {
    // Debug log to ensure changes are detected

    if (
      this.currentmessageUser &&
      this.currentmessageEmail &&
      this.currentmessageAvatar &&
      this.currentmessageStatus &&
      this.currentUserId
    ) {
      this.isReady = true;
    } else {
      this.isReady = false;
    }

    // Force change detection in case Angular skips updating the template
    this.cd.detectChanges();
  }




}