import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Course, CourseDetail, PagedResponse } from '../models/course.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly base = '/api/courses';

  getAll(page = 1, pageSize = 50): Observable<Course[]> {
    return this.http
      .get<PagedResponse<Course>>(this.base, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(map((p) => p.items));
  }

  getById(id: string | number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.base}/${id}`);
  }

  updateCourse(id: number, request: { title: string; maxCapacity: number }): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, request);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
