/**
 * Generated by @openapi-codegen
 *
 * @version 1.0.0
 */
import type * as Fetcher from "./apiFetcher";
import { apiFetch } from "./apiFetcher";
import type * as Schemas from "./apiSchemas";

export type ApiGetCurrentUserError = Fetcher.ErrorWrapper<undefined>;

export const apiGetCurrentUser = (signal?: AbortSignal) =>
  apiFetch<
    Schemas.UserInfoResponse,
    ApiGetCurrentUserError,
    undefined,
    {},
    {},
    {}
  >({ url: "/api/users/me", method: "get", signal });

export type ApiUsersLoginError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Schemas.ProblemDetails;
    }
  | {
      status: 404;
      payload: Schemas.ErrorResponse;
    }
>;

export type ApiUsersLoginVariables = {
  body: Schemas.UserLoginDto;
};

export const apiUsersLogin = (
  variables: ApiUsersLoginVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.ApiTokenResponse,
    ApiUsersLoginError,
    Schemas.UserLoginDto,
    {},
    {},
    {}
  >({ url: "/api/users/login", method: "post", ...variables, signal });

export type ApiUsersRegisterError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Schemas.ProblemDetails;
    }
  | {
      status: 409;
      payload: Schemas.ErrorResponse;
    }
>;

export type ApiUsersRegisterVariables = {
  body: Schemas.UserRegistrationDto;
};

export const apiUsersRegister = (
  variables: ApiUsersRegisterVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.GuidResponse,
    ApiUsersRegisterError,
    Schemas.UserRegistrationDto,
    {},
    {},
    {}
  >({ url: "/api/users/register", method: "post", ...variables, signal });

export type ApiFinalizeBooksError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Schemas.ErrorResponse;
    }
  | {
      status: 404;
      payload: Schemas.ErrorResponse;
    }
>;

export type ApiFinalizeBooksVariables = {
  body: Schemas.FinalizeBooksRequestDto;
};

export const apiFinalizeBooks = (
  variables: ApiFinalizeBooksVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.FinalizeBooksResponseDto,
    ApiFinalizeBooksError,
    Schemas.FinalizeBooksRequestDto,
    {},
    {},
    {}
  >({ url: "/api/kobo/books/finalize", method: "post", ...variables, signal });

export type ApiGetEpubUploadUrlError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Schemas.ErrorResponse;
    }
  | {
      status: 404;
      payload: Schemas.ErrorResponse;
    }
>;

export type ApiGetEpubUploadUrlVariables = {
  body: Schemas.EpubUploadUrlRequestDto;
};

export const apiGetEpubUploadUrl = (
  variables: ApiGetEpubUploadUrlVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.EpubUploadUrlResponseDto,
    ApiGetEpubUploadUrlError,
    Schemas.EpubUploadUrlRequestDto,
    {},
    {},
    {}
  >({ url: "/api/epub/upload-url", method: "post", ...variables, signal });

export type ApiConfirmUploadPathParams = {
  /**
   * @format uuid
   */
  pendingBookId: string;
};

export type ApiConfirmUploadError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Schemas.ErrorResponse;
    }
  | {
      status: 404;
      payload: Schemas.ErrorResponse;
    }
>;

export type ApiConfirmUploadVariables = {
  pathParams: ApiConfirmUploadPathParams;
};

export const apiConfirmUpload = (
  variables: ApiConfirmUploadVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.GuidResponse,
    ApiConfirmUploadError,
    undefined,
    {},
    {},
    ApiConfirmUploadPathParams
  >({
    url: "/api/epub/confirm-upload/{pendingBookId}",
    method: "post",
    ...variables,
    signal,
  });

export type ApiTmpBookBundleCreateError = Fetcher.ErrorWrapper<undefined>;

export const apiTmpBookBundleCreate = (signal?: AbortSignal) =>
  apiFetch<
    Schemas.TmpBookBundleDto,
    ApiTmpBookBundleCreateError,
    undefined,
    {},
    {},
    {}
  >({ url: "/api/kobo/bundles", method: "post", signal });

export type ApiBundleGetBooksPathParams = {
  shortUrlCode: string;
};

export type ApiBundleGetBooksError = Fetcher.ErrorWrapper<{
  status: 404;
  payload: Schemas.ProblemDetails;
}>;

export type ApiBundleGetBooksVariables = {
  pathParams: ApiBundleGetBooksPathParams;
};

export const apiBundleGetBooks = (
  variables: ApiBundleGetBooksVariables,
  signal?: AbortSignal,
) =>
  apiFetch<
    Schemas.BundleBooksResponse,
    ApiBundleGetBooksError,
    undefined,
    {},
    {},
    ApiBundleGetBooksPathParams
  >({
    url: "/api/kobo/bundles/{shortUrlCode}/books",
    method: "get",
    ...variables,
    signal,
  });

export const operationsByTag = {
  userInfo: { apiGetCurrentUser },
  userLogin: { apiUsersLogin },
  userRegistration: { apiUsersRegister },
  book: { apiFinalizeBooks },
  epubUpload: { apiGetEpubUploadUrl, apiConfirmUpload },
  tmpBookBundle: { apiTmpBookBundleCreate, apiBundleGetBooks },
};
