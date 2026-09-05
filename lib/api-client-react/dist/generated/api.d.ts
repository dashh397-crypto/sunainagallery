import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminPasswordChangeInput, AdminUser, AdminUserCreateInput, ErrorEnvelope, HealthStatus, ListMediaParams, MediaCreateInput, MediaItem, PasswordChangeInput, UploadUrlRequest, UploadUrlResponse, Vault, VaultCreateInput, VaultJoinInput, VaultSummary } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetVaultUrl: () => string;
/**
 * @summary Get the current user's vault
 */
export declare const getVault: (options?: Parameters<typeof customFetch>[1]) => Promise<Vault>;
export declare const getGetVaultQueryKey: () => readonly ["/api/vault"];
export declare const getGetVaultQueryOptions: <TData = Awaited<ReturnType<typeof getVault>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVault>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVault>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVaultQueryResult = NonNullable<Awaited<ReturnType<typeof getVault>>>;
export type GetVaultQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Get the current user's vault
 */
export declare function useGetVault<TData = Awaited<ReturnType<typeof getVault>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVault>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateVaultUrl: () => string;
/**
 * @summary Create a private vault
 */
export declare const createVault: (vaultCreateInput: VaultCreateInput, options?: Parameters<typeof customFetch>[1]) => Promise<Vault>;
export declare const getCreateVaultMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVault>>, TError, {
        data: BodyType<VaultCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createVault>>, TError, {
    data: BodyType<VaultCreateInput>;
}, TContext>;
export type CreateVaultMutationResult = NonNullable<Awaited<ReturnType<typeof createVault>>>;
export type CreateVaultMutationBody = BodyType<VaultCreateInput>;
export type CreateVaultMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Create a private vault
*/
export declare const useCreateVault: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVault>>, TError, {
        data: BodyType<VaultCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createVault>>, TError, {
    data: BodyType<VaultCreateInput>;
}, TContext>;
export declare const getJoinVaultUrl: () => string;
/**
 * @summary Join a vault with its private invite code
 */
export declare const joinVault: (vaultJoinInput: VaultJoinInput, options?: Parameters<typeof customFetch>[1]) => Promise<Vault>;
export declare const getJoinVaultMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinVault>>, TError, {
        data: BodyType<VaultJoinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof joinVault>>, TError, {
    data: BodyType<VaultJoinInput>;
}, TContext>;
export type JoinVaultMutationResult = NonNullable<Awaited<ReturnType<typeof joinVault>>>;
export type JoinVaultMutationBody = BodyType<VaultJoinInput>;
export type JoinVaultMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Join a vault with its private invite code
*/
export declare const useJoinVault: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinVault>>, TError, {
        data: BodyType<VaultJoinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof joinVault>>, TError, {
    data: BodyType<VaultJoinInput>;
}, TContext>;
export declare const getGetVaultSummaryUrl: () => string;
/**
 * @summary Get vault counts and recent activity
 */
export declare const getVaultSummary: (options?: Parameters<typeof customFetch>[1]) => Promise<VaultSummary>;
export declare const getGetVaultSummaryQueryKey: () => readonly ["/api/vault/summary"];
export declare const getGetVaultSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getVaultSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVaultSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVaultSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVaultSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getVaultSummary>>>;
export type GetVaultSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get vault counts and recent activity
 */
export declare function useGetVaultSummary<TData = Awaited<ReturnType<typeof getVaultSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVaultSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getChangeOwnPasswordUrl: () => string;
/**
 * @summary Change the signed-in user's password
 */
export declare const changeOwnPassword: (passwordChangeInput: PasswordChangeInput, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getChangeOwnPasswordMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeOwnPassword>>, TError, {
        data: BodyType<PasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changeOwnPassword>>, TError, {
    data: BodyType<PasswordChangeInput>;
}, TContext>;
export type ChangeOwnPasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changeOwnPassword>>>;
export type ChangeOwnPasswordMutationBody = BodyType<PasswordChangeInput>;
export type ChangeOwnPasswordMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Change the signed-in user's password
*/
export declare const useChangeOwnPassword: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeOwnPassword>>, TError, {
        data: BodyType<PasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changeOwnPassword>>, TError, {
    data: BodyType<PasswordChangeInput>;
}, TContext>;
export declare const getListAdminUsersUrl: () => string;
/**
 * @summary List accounts in the current vault
 */
export declare const listAdminUsers: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminUser[]>;
export declare const getListAdminUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminUsers>>>;
export type ListAdminUsersQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary List accounts in the current vault
 */
export declare function useListAdminUsers<TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdminUserUrl: () => string;
/**
 * @summary Create or add a vault member account
 */
export declare const createAdminUser: (adminUserCreateInput: AdminUserCreateInput, options?: Parameters<typeof customFetch>[1]) => Promise<AdminUser>;
export declare const getCreateAdminUserMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
        data: BodyType<AdminUserCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
    data: BodyType<AdminUserCreateInput>;
}, TContext>;
export type CreateAdminUserMutationResult = NonNullable<Awaited<ReturnType<typeof createAdminUser>>>;
export type CreateAdminUserMutationBody = BodyType<AdminUserCreateInput>;
export type CreateAdminUserMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Create or add a vault member account
*/
export declare const useCreateAdminUser: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
        data: BodyType<AdminUserCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdminUser>>, TError, {
    data: BodyType<AdminUserCreateInput>;
}, TContext>;
export declare const getDeleteAdminUserUrl: (userId: string) => string;
/**
 * @summary Delete a vault member account
 */
export declare const deleteAdminUser: (userId: string, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteAdminUserMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
        userId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
    userId: string;
}, TContext>;
export type DeleteAdminUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAdminUser>>>;
export type DeleteAdminUserMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Delete a vault member account
*/
export declare const useDeleteAdminUser: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
        userId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
    userId: string;
}, TContext>;
export declare const getChangeAdminUserPasswordUrl: (userId: string) => string;
/**
 * @summary Change a vault member password as an admin
 */
export declare const changeAdminUserPassword: (userId: string, adminPasswordChangeInput: AdminPasswordChangeInput, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getChangeAdminUserPasswordMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeAdminUserPassword>>, TError, {
        userId: string;
        data: BodyType<AdminPasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changeAdminUserPassword>>, TError, {
    userId: string;
    data: BodyType<AdminPasswordChangeInput>;
}, TContext>;
export type ChangeAdminUserPasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changeAdminUserPassword>>>;
export type ChangeAdminUserPasswordMutationBody = BodyType<AdminPasswordChangeInput>;
export type ChangeAdminUserPasswordMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Change a vault member password as an admin
*/
export declare const useChangeAdminUserPassword: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeAdminUserPassword>>, TError, {
        userId: string;
        data: BodyType<AdminPasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changeAdminUserPassword>>, TError, {
    userId: string;
    data: BodyType<AdminPasswordChangeInput>;
}, TContext>;
export declare const getListMediaUrl: (params?: ListMediaParams) => string;
/**
 * @summary List media in the current user's vault
 */
export declare const listMedia: (params?: ListMediaParams, options?: Parameters<typeof customFetch>[1]) => Promise<MediaItem[]>;
export declare const getListMediaQueryKey: (params?: ListMediaParams) => readonly ["/api/media", ...ListMediaParams[]];
export declare const getListMediaQueryOptions: <TData = Awaited<ReturnType<typeof listMedia>>, TError = ErrorType<unknown>>(params?: ListMediaParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMedia>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMediaQueryResult = NonNullable<Awaited<ReturnType<typeof listMedia>>>;
export type ListMediaQueryError = ErrorType<unknown>;
/**
 * @summary List media in the current user's vault
 */
export declare function useListMedia<TData = Awaited<ReturnType<typeof listMedia>>, TError = ErrorType<unknown>>(params?: ListMediaParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMediaUrl: () => string;
/**
 * @summary Save metadata for a completed private upload
 */
export declare const createMedia: (mediaCreateInput: MediaCreateInput, options?: Parameters<typeof customFetch>[1]) => Promise<MediaItem>;
export declare const getCreateMediaMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMedia>>, TError, {
        data: BodyType<MediaCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMedia>>, TError, {
    data: BodyType<MediaCreateInput>;
}, TContext>;
export type CreateMediaMutationResult = NonNullable<Awaited<ReturnType<typeof createMedia>>>;
export type CreateMediaMutationBody = BodyType<MediaCreateInput>;
export type CreateMediaMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Save metadata for a completed private upload
*/
export declare const useCreateMedia: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMedia>>, TError, {
        data: BodyType<MediaCreateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMedia>>, TError, {
    data: BodyType<MediaCreateInput>;
}, TContext>;
export declare const getDeleteMediaUrl: (id: number) => string;
/**
 * @summary Delete a media item and its private object
 */
export declare const deleteMedia: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteMediaMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMedia>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMedia>>, TError, {
    id: number;
}, TContext>;
export type DeleteMediaMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMedia>>>;
export type DeleteMediaMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Delete a media item and its private object
*/
export declare const useDeleteMedia: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMedia>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMedia>>, TError, {
    id: number;
}, TContext>;
export declare const getRequestUploadUrlUrl: () => string;
/**
 * @summary Request a presigned URL for private file upload
 */
export declare const requestUploadUrl: (uploadUrlRequest: UploadUrlRequest, options?: Parameters<typeof customFetch>[1]) => Promise<UploadUrlResponse>;
export declare const getRequestUploadUrlMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlRequest>;
}, TContext>;
export type RequestUploadUrlMutationResult = NonNullable<Awaited<ReturnType<typeof requestUploadUrl>>>;
export type RequestUploadUrlMutationBody = BodyType<UploadUrlRequest>;
export type RequestUploadUrlMutationError = ErrorType<ErrorEnvelope>;
/**
* @summary Request a presigned URL for private file upload
*/
export declare const useRequestUploadUrl: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<UploadUrlRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<UploadUrlRequest>;
}, TContext>;
export declare const getGetStorageObjectUrl: (objectPath: string) => string;
/**
 * @summary Serve a private object
 */
export declare const getStorageObject: (objectPath: string, options?: Parameters<typeof customFetch>[1]) => Promise<Blob>;
export declare const getGetStorageObjectQueryKey: (objectPath: string) => readonly [`/api/storage/objects/${string}`];
export declare const getGetStorageObjectQueryOptions: <TData = Awaited<ReturnType<typeof getStorageObject>>, TError = ErrorType<ErrorEnvelope>>(objectPath: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStorageObjectQueryResult = NonNullable<Awaited<ReturnType<typeof getStorageObject>>>;
export type GetStorageObjectQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Serve a private object
 */
export declare function useGetStorageObject<TData = Awaited<ReturnType<typeof getStorageObject>>, TError = ErrorType<ErrorEnvelope>>(objectPath: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map