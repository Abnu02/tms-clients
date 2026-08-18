import { inject } from "@angular/core";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { removeEntity, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { catchError } from "rxjs/internal/operators/catchError";
import { EMPTY } from "rxjs";
import { CourseService } from "../services/course.service";
import { Course } from "../models/course.model";
import { withState } from "@ngrx/signals";

export const CourseStore = signalStore(
    { providedIn: 'root' },
    withEntities<Course>(),
    withState({ error: '' as string }),
    withMethods((store, svc = inject(CourseService)) => ({
        deleteCourse(id: number) {
            const previousSnapshot = store.entities();

            patchState(store, removeEntity(id));

            svc.deleteCourse(id)
                .pipe(
                    catchError((err) => {
                        patchState(store, setAllEntities(previousSnapshot));

                        patchState(store, {
                            error:
                                'Cannot delete course: active student enrollments exist.',
                        });

                        return EMPTY;
                    }),
                )
                .subscribe();
        },
    })),
);
