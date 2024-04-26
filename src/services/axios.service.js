import API from "./axios.config";

export const obtenerProveedores = () => {
  return API.get("/proveedor", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const iniciaSesion = (body) => {
  return API.post("/sesion/login?portalId=1", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenCampoUsr = (id, body) => {
  return null;
};

export const obtenInfoUser = (id) => {
  return null;
};

export const obtenerArticulos = () => {
  return API.get("/item/art?area=0101", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerUnidadNegocio = () => {
  return API.get("/dimension/1", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerFilial = () => {
  return API.get("/dimension/2", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const obtenerAreas = () => {
  return API.get("/dimension/4", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const obtenerCentroCosto = () => {
  return API.get("/dimension/5", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerProyectos = () => {
  return API.get("/dimension/project", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerEstados = (filtro) => {
  return API.get(`/estado?filtro=${filtro}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const createSolicitud = (body) => {
  return API.post("/solicitudEar", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerSolicitud = (idSolicitud) => {
  return API.get(`/solicitudEar/${idSolicitud}?create=PWB`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerMotivos = () => {
  return API.get("/viatico", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerTipos = () => {
  return API.get("/viatico/tipos", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerDocumento = (id) => {
  return API.post(`/rendicion/documento/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerRendicion = (id) => {
  return API.get(`/rendicion/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};


export const crearDocumento = (body) => {
  return API.post("/rendicion/documento", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizarDocumento = (body) => {
  return API.patch("/rendicion/documento", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerTipoDocs = () => {
  return API.get("/tipoear/documentos", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerEmpleados = () => {
  return null;
};

export const obtenerDistritos = (filtro, letra) => {
  return null;
};

export const obtenerRutas = () => {
  return null;
};

export const obtenerTipoViaticos = () => {
  return null;
};

export const obtenerItems = (ear, cta) => {
  return null;
};

export const obtenerListaCup = (ceco, posFin, anio) => {
  return null;
};

export const obtenerPrecio = (prov, dis, itemCod) => {
  return null;
};

export const obtenerIndicadores = () => {
  return null;
};

export const uploadAdjunto = (file) => {
  return null;
};

export const crearSolicitud = (body) => {
  return null;
};

export const actualizarSolicitud = (body) => {
  return API.patch(`/solicitudEar`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizarSolicitudDet = (id, body) => {
  return null;
};

export const eliminarDetalleSolicitud = (id) => {
  return null;
};

export const enviarSolicitudAproba = (id, body) => {
  return API.post(`/solicitudEar/aprobacion/${id}`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const validacionSolicitud = (id) => {
  return null;
};

export const obtieneAdjuntos = (id) => {
  return null;
};

export const obtieneAdjuntosDoc = (id) => {
  return null;
};

export const crearSolicitudDet = (body) => {
  return null;
};

export const getDescripcionEstado = (id) => {
  return null;
};

export const listarSolicitud = (
  usrCreate,
  usrAsign,
  perfil,
  fecini,
  fecfin,
  nrrendi,
  estado,
  area
) => {
  return API.get(
    `/solicitudEar/lista?usrCreate=${usrCreate}&usrAsign=${usrAsign}&perfil=${perfil}&fecini=${fecini}&fecfin=${fecfin}&nrrendi=${nrrendi}&estados=${estado}&area=${area}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const listarRendiciones = (
  usrCreate,
  usrAsign,
  perfil,
  fecini,
  fecfin,
  nrrendi,
  estado,
  area
) => {
  return API.get(
    `/rendicion/lista?usrCreate=${usrCreate}&usrAsign=${usrAsign}&perfil=${perfil}&fecini=${fecini}&fecfin=${fecfin}&nrrendi=${nrrendi}&estados=${estado}&area=${area}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};
 
export const obtenerSolicitudR = (id, create) => {
  return null;
};

export const obtenerSolicitudDet = (id) => {
  return null;
};

export const aceptarSolicitudSR = (
  solicitudId,
  aprobadorId,
  areaAprobador,
  estado
) => {
  return API.patch(
    `/solicitudEar/aprobacion/acepta?id=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}&estado=${estado}`,
    {
      ValidityState: function (status) {
        return status < 500;
      },
    }
  );
};

export const rechazarSolicitudSR = (
  solicitudId,
  aprobadorId,
  comentarios,
  areaAprobador
) => {
  return null;
};

export const reintentarEnvio = (id) => {
  return API.patch(`solicitudEar/aprobacion/reintentar/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const reintentarRendi = (id) => {
  return null;
};

// export const obtenerRendicion = (id) => {
//   return null;
// };

export const obtenerConf = () => {
  return API.get(`/configuracion/cfgeneral`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const consultaRuc = (id) => {
  return null;
};

export const consultaComprobante = (body) => {
  return null;
};

export const actualizaDocumento = (body) => {
  return null;
};

export const borrarDocumento = (id, rdId) => {
  return null;
};

export const borrarDocumentoDet = (id, docId) => {
  return null;
};



export const extraerPlantilla = () => {
  return API.get(`rendicion/documento/plantilla`, {
    validateStatus: function (status) {
      return status < 500;
    },
    responseType: "blob",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
};
export const importarPlantilla = (file, id) => {
  const formData = new FormData();
  formData.append("file", file);

  return null;
};
export const actualizarSntDoc = (id, estado) => {
  return null;
};

export const actualizaRendicion = (body) => {
  return null;
};

export const validacionDocumento = (id) => {
  return null;
};

export const enviarAprobRendicion = (
  id,
  idSolicitud,
  usuarioId,
  estado,
  areaAprobador
) => {
  return API.post(
    `/solicitudEar/aprobacion/acepta?id=${id}&idSolicitud=${idSolicitud}&usuarioId=${usuarioId}&estado=${estado}&areaAprobador=${areaAprobador}`,    {
      ValidityState: function (status) {
        return status < 500;
      },
    }
  );
};

export const aceptarAprobRendicion = (
  solicitudId,
  aprobadorId,
  areaAprobador,
  estado,
  rendicionId,
  area
) => {
  return API.patch(
    `/rendicion/aprobacion/acepta?id=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}&estado=${estado}&rendicionId=${rendicionId}&area=${area}`,
    {
      ValidityState: function (status) {
        return status < 500;
      },
    }
  );
};

export const rechazarAprobRendicion = (
  solicitudId,
  aprobadorId,
  areaAprobador,
  estado,
  rendicionId,
  area
) => {
  return null;
};

export const consultarPresupuesto = (ceco, posf, anio, prec) => {
  return null;
};

export const generaPDFSolicitudD = (id, num) => {
  return null;
};

export const generaPDFRendicion = (num) => {
  return null;
};

export const obtieneAprobadoresSL = (id) => {
  return API.get(`solicitudEar/aprobadores?idSolicitud=${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtieneAprobadoresRd = (id) => {
  return null;
};

export const tokenSolicitud = (id) => {
  return null;
};

export const tokenRendicion = (id) => {
  return null;
};

/*
export const uploadAdjunto = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/solicitud/upload", formData, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
*/
