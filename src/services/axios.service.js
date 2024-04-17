import API from "./axios.config";

export const obtenerProveedores = () => {
  return null;
};


export const iniciaSesion = (body) => {
  return API.post("/sesion/login?portalId=3", body, {
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

export const obtenerEstados = (filtro) => {
  return API.get(`/estado?filtro=${filtro}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const createSolicitud = (body) => {
  return API.post("/solicitudEar",body, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

export const obtenerSolicitud = () => {
  return API.get("/solicitudEar/16?create=PWB", {
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
export const obtenerCentroCosto = (id) => {
  return null;
};

export const obtenerListaCup = (ceco, posFin, anio) => {
  return null;
};

export const obtenerPrecio = (prov, dis, itemCod) => {
  return null;
};

export const obtenerProyectos = () => {
  return null;
};

export const obtenerIndicadores = () => {
  return null;
};

export const obtenerTipoDocs = () => {
  return null;
};

export const uploadAdjunto = (file) => {
  return null;
};

export const crearSolicitud = (body) => {
  return null;
};

export const actualizarSolicitud = (id, body) => {
  return null;
};

export const actualizarSolicitudDet = (id, body) => {
  return null;
};

export const eliminarDetalleSolicitud = (id) => {
  return null;
};

export const enviarSolicitudAproba = (id, body) => {
  return null;
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
  return null;
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
  return null;
};

export const obtenerSolicitudR = (id, create) => {
  return null;
};

export const obtenerSolicitudDet = (id) => {
  return null;
};

export const aceptarSolicitudSR = (solicitudId, aprobadorId, areaAprobador) => {
  return null;
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
  return null;
};

export const reintentarRendi = (id) => {
  return null;
};

export const obtenerRendicion = (id) => {
  return null;
};

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

export const crearDocumento = (body) => {
  return null;
};

export const actualizaDocumento = (body) => {
  return null;
};

export const obtenerDocumento = (id) => {
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
  return null;
};

export const aceptarAprobRendicion = (
  solicitudId,
  aprobadorId,
  areaAprobador,
  estado,
  rendicionId,
  area
) => {
  return null;
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
  return null;
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
