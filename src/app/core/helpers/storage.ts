
export const saveFilterStorage = (pagination: any, keyStorage: string, columnSort:string, typeSort: string) => {
    pagination.pagina = pagination.currentPage
    pagination.cantidad = pagination.pageSize
    pagination.save = true
    if(pagination.columnSort != columnSort &&  pagination.typeSort != typeSort ){
    pagination.campo = pagination.columnSort
    pagination.ordenar = pagination.typeSort
    }

    delete pagination.currentPage
    delete pagination.pageSize
    delete pagination.columnSort
    delete pagination.typeSort
    delete pagination.code
    delete pagination.total

    localStorage.setItem(keyStorage, JSON.stringify(pagination));
}