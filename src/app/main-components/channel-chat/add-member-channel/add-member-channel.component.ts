import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../../interfaces/user.interface';
import { NgIf, CommonModule } from '@angular/common';
import { Member } from '../../../interfaces/member.interface';

@Component({
  selector: 'app-add-member-channel',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './add-member-channel.component.html',
  styleUrls: ['./add-member-channel.component.scss']
})
export class AddMemberChannelComponent {
  @Input() allUsersChannel: User[] = [];
  @Input() currentChannelID!: string;
  @Input() members: Member[] = [];

  @Output() memberSelected = new EventEmitter<Member>();
  @Output() appClickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  addMemberInChat(member: Member) {
    this.memberSelected.emit(member);
  }


  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }


}
