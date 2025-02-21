export const sortObject = <T, K extends keyof T>(data: T[], columnSort: K, sort: 'ASC' | 'DESC' = 'ASC') => {
  return [...data].sort((a, b) => {
    const valueA = a[columnSort];
    const valueB = b[columnSort];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sort === "ASC"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sort === "ASC" ? valueA - valueB : valueB - valueA;
    }

    return 0; // En caso de que no sea ni string ni number, no se ordena
  });
}