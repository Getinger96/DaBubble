import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreadCountService {
  private threadCounts = new BehaviorSubject<Map<string, number>>(new Map());
  
  threadCounts$ = this.threadCounts.asObservable();

  updateThreadCount(messageId: string, count: number): void {
    const currentCounts = this.threadCounts.value;
    currentCounts.set(messageId, count);
    this.threadCounts.next(new Map(currentCounts));
  }

  getThreadCount(messageId: string): Observable<number> {
    return new Observable(observer => {
      this.threadCounts$.subscribe(counts => {
        observer.next(counts.get(messageId) || 0);
      });
    });
  }
}