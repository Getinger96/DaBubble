import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchBarComponent } from '../main-components/search-bar/search-bar.component';
import { ActiveUserComponent } from '../shared-components/active-user/active-user.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MainChatComponent } from '../main-components/main-chat/main-chat.component';
import { ThreadComponent } from '../main-components/thread/thread.component';
import { HeaderComponent } from '../shared-components/header/header.component';
import { ToggleWebspaceMenuComponent } from './toggle-webspace-menu/toggle-webspace-menu.component';
import { NgIf } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-main-components',
  standalone: true,
  imports: [SearchBarComponent, ActiveUserComponent, WorkspaceMenuComponent , MainChatComponent, ThreadComponent, HeaderComponent, ToggleWebspaceMenuComponent, NgIf],
  templateUrl: './main-components.component.html',
  styleUrl: './main-components.component.scss'
})
export class MainComponentsComponent implements OnInit, OnDestroy {
  loadingStatus: boolean = false;
  private loadingSubscription!: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loading$.subscribe(status => {
      this.loadingStatus = status;  
      console.log('status',this.loadingStatus);
      
    });
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}