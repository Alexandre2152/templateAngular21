import {Injectable, signal} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSignal = signal(false);
  public isLoading = this.loadingSignal.asReadonly();

  private loadingSubject = new Subject<boolean>();
  public loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingSignal.set(true);
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.loadingSignal.set(false);
    this.loadingSubject.next(false);
  }
}
