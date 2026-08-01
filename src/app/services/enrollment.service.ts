import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment, CreateEnrollmentPayload } from '../models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:5287/api/enrollments';

    getAll(): Observable<Enrollment[]> {
        return this.http.get<Enrollment[]>(this.baseUrl);
    }

    approve(id: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${id}/approve`, {});
    }

    create(payload: CreateEnrollmentPayload): Observable<Enrollment> {
        return this.http.post<Enrollment>(this.baseUrl, payload);
    }
}
