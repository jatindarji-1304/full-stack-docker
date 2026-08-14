export type Result<T, E> = ResultOk<T, E> | ResultErr<T, E>;

export class ResultOk<T, E> {
  private readonly ok = true as const;
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
    Object.freeze(this);
  }

  public is_ok(): this is ResultOk<T, E> {
    return true;
  }
  public is_err(): this is ResultErr<T, E> {
    return false;
  }

  public map<U>(fn: (t: T) => U): Result<U, E> {
    return new ResultOk<U, E>(fn(this.value));
  }

  public map_err<F>(_fn: (e: E) => F): Result<T, F> {
    // mapping an Err on Ok is a no-op
    return new ResultOk<T, F>(this.value);
  }

  public and_then<U>(fn: (t: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  public or_else<F>(_fn: (e: E) => Result<T, F>): Result<T, F> {
    return new ResultOk<T, F>(this.value);
  }

  public unwrap(): T {
    return this.value;
  }
  public unwrap_err(): E {
    throw new Error("called unwrapErr() on Ok");
  }

  public unwrap_or(_default_value: T): T {
    return this.value;
  }
  public unwrap_or_else(_fn: (e: E) => T): T {
    return this.value;
  }

  public expect(_msg: string): T {
    return this.value;
  }
  public expect_err(msg: string): E {
    throw new Error(msg);
  }

  public match<U>(arms: { ok: (t: T) => U; err: (e: E) => U }): U {
    return arms.ok(this.value);
  }

  public inspect(fn: (t: T) => void): this {
    fn(this.value);
    return this;
  }

  public inspect_err(_fn: (e: E) => void): this {
    return this;
  }

  public to_json(): { ok: true; value: T } {
    return { ok: true as const, value: this.value };
  }
}

export class ResultErr<T, E> {
  public readonly ok = false as const;
  public readonly error: E;

  constructor(error: E) {
    this.error = error;
    Object.freeze(this);
  }

  public is_ok(): this is ResultOk<T, E> {
    return false;
  }
  public is_err(): this is ResultErr<T, E> {
    return true;
  }

  public map<U>(_fn: (t: T) => U): Result<U, E> {
    return new ResultErr<U, E>(this.error);
  }

  public map_err<F>(fn: (e: E) => F): Result<T, F> {
    return new ResultErr<T, F>(fn(this.error));
  }

  public and_then<U>(_fn: (t: T) => Result<U, E>): Result<U, E> {
    return new ResultErr<U, E>(this.error);
  }

  public or_else<F>(fn: (e: E) => Result<T, F>): Result<T, F> {
    return fn(this.error);
  }

  public unwrap(): T {
    throw new Error("called unwrap() on Err");
  }
  public unwrap_err(): E {
    return this.error;
  }

  public unwrap_or(default_value: T): T {
    return default_value;
  }
  public unwrap_or_else(fn: (e: E) => T): T {
    return fn(this.error);
  }

  public expect(msg: string): T {
    throw new Error(msg);
  }
  public expect_err(_msg: string): E {
    return this.error;
  }

  public match<U>(arms: { ok: (t: T) => U; err: (e: E) => U }): U {
    return arms.err(this.error);
  }

  public inspect(_fn: (t: T) => void): this {
    return this;
  }

  public inspect_err(fn: (e: E) => void): this {
    fn(this.error);
    return this;
  }

  public to_json(): { ok: false; error: E } {
    return { ok: false as const, error: this.error };
  }
}

export const Ok = <T>(value: T): Result<T, never> =>
  new ResultOk<T, never>(value);
export const Err = <E>(error: E): Result<never, E> =>
  new ResultErr<never, E>(error);

export function from_ullable<T, E>(
  value: T | null | undefined,
  error: E,
): Result<T, E> {
  return value == null ? Err(error) : Ok(value);
}

export function from_throwable<T, E = unknown>(
  fn: () => T,
  map_error?: (e: unknown) => E,
): Result<T, E> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(map_error ? map_error(e) : (e as E));
  }
}

export async function from_promise<T, E>(
  promise: Promise<T>,
  map_error: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(map_error(e));
  }
}
