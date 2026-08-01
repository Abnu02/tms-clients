export interface Enrollment {
    id: string;
    studentId: number;
    studentName: string;
    courseId: string;
    courseName: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    enrolledAt: string;
}

export interface CreateEnrollmentPayload {
    studentId: string;
    courseId: string;
    term: string;
    notes: string;
    backupCourses: string[];
}