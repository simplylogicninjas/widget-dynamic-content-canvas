export const listUnique = <T>(currentItems: T[], newItems: T[] = []) => {
    return JSON.stringify(currentItems) !== JSON.stringify(newItems);
}