import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {Magnetic} from "./magnetic";
import { environment } from './../environments/environment';

@Injectable({ providedIn: 'root' })
export class RestService {
    constructor(
        private http: HttpClient ) { }

    private log(message: string) {
        console.log(message)
    }

    getData(): Observable<Magnetic[]> {
        return this.http.get<Magnetic[]>(environment.api_address + "getAll")
            .pipe(
                tap(_ => this.log('fetched data')),
                catchError(this.handleError<Magnetic[]>('getAll', []))
            );
    }

    getTitle(): Observable<string> {
        return this.http.get(environment.api_address + "getTitle",{responseType: 'text'});
    }


    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            this.log(`${operation} failed: ${error.message}`);
            return of(result as T);
        };
    }
}
