export type AuthMode = "signin" | "signup" | "guest";

export class AuthActionError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = "AuthActionError";
  }
}

export {}; // ensure module
