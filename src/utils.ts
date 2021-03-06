export const identity = <T>(x: T) => x;
export const constant = <T>(x: T) => () => x;

export function idGenerator(idPrefix: string) {
    let counter = 0;
    return () => idPrefix + "-" + counter++;
};
