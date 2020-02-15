export const identity = <T>(x: T) => x;
export const constant = <T>(x: T) => () => x;