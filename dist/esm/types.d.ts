/**
 * A callable type with the "new" operator
 * allows class and constructor.
 */
export interface Constructor<T = object> {
    new (...args: any[]): T;
}
/**
 * A type of object prototype which excludes
 * function and scalar values.
 */
export type Prototype<T = object> = T & object & {
    bind?: never;
} & {
    call?: never;
} & {
    prototype?: object;
};
/**
 * Value or promise.
 */
export type ValueOrPromise<T> = PromiseLike<T> | T;
/**
 * A function type without class and constructor.
 */
export type Callable<T = unknown> = (...args: any[]) => T;
/**
 * Make a specific property optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Object with open properties.
 */
export declare type AnyObject = {
    [property: string]: unknown;
};
/**
 * It is similar to `keyof`.
 */
export type ValueOf<T> = T[keyof T];
/**
 * Identity.
 */
export type Identity<T> = T;
/**
 * Flatten.
 */
export type Flatten<T> = Identity<{
    [k in keyof T]: T[k];
}>;
/**
 * Value or factory.
 */
export type ValueOrFactory<T> = Callable<T> | T;
/**
 * Pick by array.
 */
export type PickByArray<T, V extends ReadonlyArray<keyof T>> = Pick<T, V[number]>;
/**
 * T or an array of T.
 */
export type OneOrMany<T> = T | T[];
