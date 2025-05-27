import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Member } from '../../../interfaces/member.interface';
import { NgIf, CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-member-to-thread',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-member-to-thread.component.html',
  styleUrl: './add-member-to-thread.component.scss'
})
export class AddMemberToThreadComponent {
@Input() members: Member[] =[]
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
