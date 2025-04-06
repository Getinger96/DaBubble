import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false); 
  loading$ = this.loadingSubject.asObservable();


  constructor() { }


  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  getLoadingStatus(): boolean {
    return this.loadingSubject.value;
  }
}
