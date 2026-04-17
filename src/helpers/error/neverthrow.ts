import { fromPromise, fromThrowable } from "neverthrow";
import { toErrorMessage } from "./to_error_message.ts";

export const fromPromiseWithMessage = <T>(promise: Promise<T>) =>
  fromPromise(promise, toErrorMessage);

export const fromThrowableWithMessage = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
) => fromThrowable(fn, toErrorMessage);
