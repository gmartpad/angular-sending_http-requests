import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit  {
  isFetching = signal(false);
  private httpClient = inject(HttpClient)
  private destroyRef = inject(DestroyRef)
  places = signal<Place[] | undefined>(undefined);
  error = signal('')

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/user-places')
      .pipe(
        map((res) => res.places),
        catchError(
          (error) => throwError(
            () => new Error("Something went wrong fetching your favorite places. Please try again later.")
          )
        )
      )
      .subscribe({
        next: (places) => {
          console.log(places)
          if(places?.length) {
            this.places.set(places)
          }
        },
        error: (error: Error) => {
          this.error.set(error.message);
        },
        complete: () => {
          this.isFetching.set(false)
        }
      })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
