import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('')
  private destroyRef = inject(DestroyRef)
  private placesService = inject(PlacesService)

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces()
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

  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace)
    .subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (error) => {
        console.error(error)
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }

}
