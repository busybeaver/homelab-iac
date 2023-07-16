export const createName = (postfix: string, determinator = '__') => (name: string) => `${name}${determinator}${postfix}`;
