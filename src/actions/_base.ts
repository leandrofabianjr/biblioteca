import { authSession } from "@/lib/auth";
import { AuthSessionType } from "@/lib/auth/auth-session";

export interface ActionResponse<T> {
  success: boolean;
  error?: unknown;
  data?: T;
}

export class ActionSuccess<T> implements ActionResponse<T> {
  readonly success = true;
  public data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class ActionError<T> extends Error implements ActionResponse<T> {
  readonly success = false;
  public error: unknown;

  constructor(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    super(message);
    this.error = error;
  }

  static NotAuthenticated() {
    return new ActionError({ success: false, error: 'Usuário não logado' });
  }
}

export async function clientAction<T>(callback: (session: AuthSessionType) => Promise<ActionResponse<T> | void> | ActionResponse<T> | void): Promise<ActionResponse<T>> {
  let response;
  try {
    const session = await authSession();
    response = await callback(session!) || new ActionSuccess<T>({} as T);
  } catch (error) {
    console.error(error)
    response = new ActionError(error)
  }

  return JSON.parse(JSON.stringify(response));
}


export async function loggedUserAction<T>(callback: (session: AuthSessionType) => Promise<T>): Promise<ActionResponse<T>> {
  try {
    const session = await authSession();
    const result = await callback(session!);
    return new ActionSuccess(result);
  } catch (error) {
    console.error(error)
    return new ActionError(error)
  }
}
