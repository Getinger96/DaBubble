import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { User } from '../../../interfaces/user.interface';
@Component({
  selector: 'app-add-user-in-new-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-user-in-new-chat.component.html',
  styleUrl: './add-user-in-new-chat.component.scss'
})
export class AddUserInNewChatComponent {
  @Input() allUsers: User[] = [];
  @Output() memberSelected = new EventEmitter<User>();
  @Output() appClickOutside = new EventEmitter<void>();


  constructor(private elementRef: ElementRef) {}

   @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
}


  addUserInChat(user: User) {
    this.memberSelected.emit(user);
  }
}
