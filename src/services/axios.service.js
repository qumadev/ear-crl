import API from "./axios.config";

export const obtenerProveedores = () => {
  return API.get("/proveedor", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const iniciaSesion = (body) => {
  return API.post("/usuario/login", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenCampoUsr = (id, body) => {
  return API.post(`/usuario/${id}`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenInfoUser = (id) => {
  return API.get(`/usuario/${id}`, {
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

export const obtenerEmpleados = () => {
  return API.get("/usuario", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerDistritos = (filtro, letra) => {
  return API.get(`/ubicacion/direccion/like?filtro=${filtro}&letra=${letra}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerRutas = () => {
  return API.get(`/ruta`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerTipoViaticos = () => {
  return API.get("/tipoear", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerItems = (ear, cta) => {
  return API.get(`/items?ear=${ear}&cta=${cta}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const obtenerCentroCosto = (id) => {
  return API.get(`/usuario/ceco/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerListaCup = (ceco, posFin, anio) => {
  return API.get(
    `/items/listaCup?ceco=${ceco}&posFinanciera=${posFin}&anio=${anio}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const obtenerPrecio = (prov, dis, itemCod) => {
  return API.get(
    `/items/listarPrecio?provincia=${prov}&distrito=${dis}&itemcode=${itemCod}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const obtenerProyectos = () => {
  return API.get("items/proyectos", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerIndicadores = () => {
  return API.get("items/indicadores", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerTipoDocs = () => {
  return API.get("tipoear/documentos", {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const uploadAdjunto = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/solicitud/upload", formData, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const crearSolicitud = (body) => {
  return API.post("/solicitud", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizarSolicitud = (id, body) => {
  return API.patch(`/solicitud/${id}`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizarSolicitudDet = (id, body) => {
  return API.patch(`/solicitud/detalle/${id}`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const eliminarDetalleSolicitud = (id) => {
  return API.delete(`/solicitud/detalle/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const enviarSolicitudAproba = (id, body) => {
  return API.post(`/solicitud/aprobacion/${id}`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const validacionSolicitud = (id) => {
  return API.get(`/solicitud/valida/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtieneAdjuntos = (id) => {
  return API.get(`/solicitud/adjuntos/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtieneAdjuntosDoc = (id) => {
  return API.get(`/rendicion/adjuntos/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const crearSolicitudDet = (body) => {
  return API.post("/solicitud/detalle", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const getDescripcionEstado = (id) => {
  return API.get(`/estado/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
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
    `/solicitud/lista?usrCreate=${usrCreate}&usrAsign=${usrAsign}&perfil=${perfil}&fecini=${fecini}&fecfin=${fecfin}&nrrendi=${nrrendi}&estados=${estado}&area=${area}`,
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
  return API.get(`/solicitud/${id}?create=${create}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerSolicitudDet = (id) => {
  return API.get(`/solicitud/detalle/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const aceptarSolicitudSR = (solicitudId, aprobadorId, areaAprobador) => {
  return API.patch(
    `/solicitud/aprobacion/acepta?id=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}`,
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
  return API.patch(
    `/solicitud/aprobacion/rechazar?id=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}`,
    { Nombre: comentarios },
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const reintentarEnvio = (id) => {
  return API.patch(`solicitud/aprobacion/reintentar/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const reintentarRendi = (id) => {
  return API.patch(`rendicion/aprobacion/reintentar/${id}`, {
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

export const obtenerConf = () => {
  return API.get(`/configuracion/cfgeneral`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const consultaRuc = (id) => {
  return API.get(`/proveedor/ruc/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const consultaComprobante = (body) => {
  return API.post(`/proveedor/comprobante`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const crearDocumento = (body) => {
  return API.post("rendicion/documento", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizaDocumento = (body) => {
  return API.patch("rendicion/documento", body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerDocumento = (id) => {
  return API.get(`rendicion/documento/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const borrarDocumento = (id, rdId) => {
  return API.delete(`rendicion/documento?id=${id}&rdId=${rdId}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const borrarDocumentoDet = (id, docId) => {
  return API.delete(`rendicion/documento/detalle?id=${id}&docId=${docId}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
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

  return API.post(`rendicion/documento/plantilla/${id}`, formData, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const actualizarSntDoc = (id, estado) => {
  return API.patch(`rendicion/documento/snt/${id}?estado=${estado}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const actualizaRendicion = (body) => {
  return API.patch(`rendicion`, body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const validacionDocumento = (id) => {
  return API.post(`rendicion/documento/validacion/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const enviarAprobRendicion = (
  id,
  idSolicitud,
  usuarioId,
  estado,
  areaAprobador
) => {
  return API.post(
    `rendicion/aprobacion/${id}?idSolicitud=${idSolicitud}&usuarioId=${usuarioId}&estado=${estado}&areaAprobador=${areaAprobador}`,
    {
      validateStatus: function (status) {
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
    `rendicion/aprobacion/acepta?solicitudId=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}&estado=${estado}&rendicionId=${rendicionId}&area=${area}`,
    {
      validateStatus: function (status) {
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
  return API.patch(
    `rendicion/aprobacion/rechazar?solicitudId=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}&estado=${estado}&rendicionId=${rendicionId}&area=${area}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const consultarPresupuesto = (ceco, posf, anio, prec) => {
  return API.get(
    `items/presupuesto?ceco=${ceco}&posf=${posf}&anio=${anio}&prec=${prec}`,
    {
      validateStatus: function (status) {
        return status < 500;
      },
    }
  );
};

export const generaPDFSolicitudD = (id, num) => {
  return API.post(`reporte?id=${id}&numRendicion=${num}`, {
    validateStatus: function (status) {
      return status < 500;
    },
    responseType: "arraybuffer",
  });
};

export const generaPDFRendicion = (num) => {
  return API.post(`reporte?numRendicion=${num}`, {
    validateStatus: function (status) {
      return status < 500;
    },
    responseType: "arraybuffer",
  });
};

export const obtieneAprobadoresSL = (id) => {
  return API.get(`solicitud/aprobadores?idSolicitud=${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtieneAprobadoresRd = (id) => {
  return API.get(`rendicion/aprobadores?idRendicion=${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const tokenSolicitud = (id) => {
  return API.post(`solicitud/validatoken?token=${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const tokenRendicion = (id) => {
  return API.post(`rendicion/validatoken?token=${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
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
