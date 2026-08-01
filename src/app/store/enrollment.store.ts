import { computed, inject } from '@angular/core';
import {
    signalStore,
    withComputed,
    withMethods,
    patchState,
    withState,
} from '@ngrx/signals';
import {
    withEntities,
    setAllEntities,
    updateEntity,
    addEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, EMPTY } from 'rxjs';
import { EnrollmentService } from '../services/enrollment.service';
import { Enrollment, CreateEnrollmentPayload } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
    { providedIn: 'root' },

    withState({
        isLoading: false,
        error: null as string | null,
    }),

    withEntities<Enrollment>(),

    withComputed((store) => ({
        pendingCount: computed(
            () => store.entities().filter((e) => e.status === 'Pending').length
        ),
    })),

    withMethods((store, api = inject(EnrollmentService)) => ({
        loadEnrollments: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                concatMap(() =>
                    api.getAll().pipe(
                        tap((rows) =>
                            patchState(
                                store,
                                setAllEntities(rows),
                                { isLoading: false }
                            )
                        ),
                        catchError((err) => {
                            patchState(store, {
                                isLoading: false,
                                error: err.message,
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        ),

        approveEnrollment: rxMethod<string>(
            pipe(
                tap((id) => {
                    patchState(
                        store,
                        updateEntity({
                            id,
                            changes: { status: 'Approved' },
                        })
                    );
                }),
                concatMap((id) =>
                    api.approve(id).pipe(
                        catchError(() => {
                            patchState(
                                store,
                                updateEntity({
                                    id,
                                    changes: { status: 'Pending' },
                                })
                            );
                            patchState(store, {
                                error: 'Server rejected the approval. Check enrollment constraints.',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        ),

        submitEnrollment: rxMethod<CreateEnrollmentPayload>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                concatMap((payload) =>
                    api.create(payload).pipe(
                        tap((newEnrollment) =>
                            patchState(
                                store,
                                addEntity(newEnrollment),
                                { isLoading: false }
                            )
                        ),
                        catchError((err) => {
                            patchState(store, {
                                isLoading: false,
                                error: err.message ?? 'Failed to submit enrollment.',
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        ),
    }))
);