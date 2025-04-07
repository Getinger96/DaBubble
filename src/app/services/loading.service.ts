import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false); 
  loading$ = this.loadingSubject.asObservable();
  loadingStatus!: boolean

  constructor() { }


  setLoading(loading: boolean) {
   return this.loadingStatus = loading;
  }

  getLoadingStatus(): boolean {
    return this.loadingSubject.value;
  }
}
