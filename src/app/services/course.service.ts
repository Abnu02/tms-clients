import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Course, CourseDetail, PagedResponse } from '../models/course.model';

@Service()
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api/courses';
  getAll(page = 1, pageSize = 10) {
    return this.http.get<PagedResponse<Course>>(
      `${this.baseUrl}?page=${page}&pageSize=${pageSize}`,
    );
  }
  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`);
  }
}
