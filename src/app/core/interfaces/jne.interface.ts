export interface JneAutoridadesResponses {
    data: JneConformacionesResponses[],
    type: number,
    message: string,
    messageLog: string,
    success: boolean,
    aditional: number
}

export interface JneConformacionesResponses {
    lbeConformacion: JneAutoridad[],
    lbePronunciamiento: JnePronunciamiento[]
}

export interface JneAutoridad {
    idOrganizacionPolitica: number,
    strOrganizacionPolitica:string,
    strSexo?:string,
    strDocumentoIdentidad:string,
    strNombres:string,
    strApellidoPaterno:string,
    strApellidoMaterno:string,
    strCargo:string,
    strFechaInicioVigencia?:string,
    strFechaFinVigencia:string,
    idConformacionDetalle:string,
    strRutaFoto:string,
    idHojaVida: number,
    strDepartamento: string,
    strProvincia: string,
    strDistrito: string,
    strRutaPlanGob: string,
    strReemplaza: string,
    strUbigeo?: string,
    strDistritoElectoral: string,
    strProcesoElectoral: string,
}

export interface JnePronunciamiento {
    idConformacion: number,
    strRutaArchivo: string,
    strPronunciamiento: string,
    strFechaPublicacion: string,
    idExpediente: number,
    strCodExpedienteExt: string
}

export interface JneRequest {
    strUbigeo: string,
    idTipoEleccion: number
}

export interface JneAutoridadesPorDniResponses {
    data: JneAutoridad,
    type: number,
    message: string,
    messageLog: string,
    success: boolean,
    aditional: number
}
