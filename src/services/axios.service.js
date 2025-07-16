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

export const obtenerArticulos = (centroCosto) => {
  return API.get(`/item/art?area=${centroCosto}`, {
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

export const obtenerEstadosRendiciones = (filtro) => {
  return API.get(`/rendiciones`, {
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

export const obtenerDocumento = async (id) => {
  const respuesta = await API.get(`/rendicion/documento/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
  return respuesta;
};

export const obtenerRendicion = async (id) => {
  const respuesta = await API.get(`/rendicion/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
  return respuesta;
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

export const borrarDocumento = (idDoc, idRendicion) => {
  return API.delete(`/rendicion/documento/${idDoc}/rendicion/${idRendicion}`, {
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

export const autorizarReversionAprobRendicion = (idRendicion) => {
  return API.patch(`/rendicion/autorizar/revertir/${idRendicion}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};
export const revertirAprobRendicion = (idRendicion) => {
  return API.patch(`/rendicion/aprobacion/revertir/${idRendicion}`, {
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
  empNombre,
  perfil,
  fecini,
  fecfin,
  nrrendi,
  estado,
  area
) => {
  return API.get(
    `/solicitudEar/lista?usrCreate=${usrCreate}&usrAsign=${usrAsign}&empNombre=${empNombre}&perfil=${perfil}&fecini=${fecini}&fecfin=${fecfin}&nrrendi=${nrrendi}&estados=${estado}&area=${area}`,
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
  empNombre,
  perfil,
  fecini,
  fecfin,
  nrrendi,
  estado,
  area
) => {
  return API.get(
    `/rendicion/lista?usrCreate=${usrCreate}&usrAsign=${usrAsign}&empNombre=${empNombre}&perfil=${perfil}&fecini=${fecini}&fecfin=${fecfin}&nrrendi=${nrrendi}&estados=${estado}&area=${area}`,
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
  areaAprobador,
  estado
) => {
  return API.patch(
    `/solicitudEar/aprobacion/rechazar?id=${solicitudId}&aprobadorId=${aprobadorId}&areaAprobador=${areaAprobador}&estado=${estado}`,
    { comentarios: encodeURIComponent(comentarios) }, // ADMITIR CARACTERES ESPECIALES EN COMENTARIOS
    {
      validateStatus: function (status) {
        return status < 500;
      }
    }
  );
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

export const borrarDocumentoDet = (id, docId) => {
  return null;
};

export const validacionDocumento = (id) => {
  return API.post(`rendicion/documento/validacion/${id}`, {
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
  return null;
};

export const actualizaRendicion = (body) => {
  return null;
};

export const enviarAprobRendicion = (
  id,
  idSolicitud,
  usuarioId,
  estado,
  areaAprobador,
  montoDiferencia
) => {
  return API.post(
    `rendicion/aprobacion/${id}?idSolicitud=${idSolicitud}&usuarioId=${usuarioId}&estado=${estado}&areaAprobador=${areaAprobador}&montoDiferencia=${montoDiferencia}`,
    {
      validateStatus: function (status) {
        return status <
          500;
      },
    }
  );
};

//--modificacion de fiorella  para formDt
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

//--------------------

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

// Función para cargar PDF
export const uploadAdjuntoPDF = (id, files) => {
  const formData = new FormData();
  formData.append('file', files);

  // AÑADIR CADA ARCHIVO
  files.forEach((file, index) => {
    formData.append(`file${index + 1}`, file);
  });

  return API.post(`rendicion/upload-Pdf/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    validateStatus: function (status) {
      return status < 500;
    }
  });
};

export const downloadAdjuntoPDF = (IdDoc) => {
  return API.get(`rendicion/download-pdf/${IdDoc}`, {
    responseType: 'arraybuffer',  // Asegúrate de este tipo de respuesta
    validateStatus: function (status) {
      return status < 500;  // Solo aceptamos errores 500 y más para rechazar
    }
  });
};

export const downloadAdjuntoExcel = (IdDoc) => {
  return API.get(`rendicion/download-excel/${IdDoc}`, {
    responseType: 'arraybuffer',  // Asegúrate de este tipo de respuesta
    validateStatus: function (status) {
      return status < 500;
    }
  });
};

// Funcion para obtener los archivos AnexPDF
export const obtenerArchivosRendicion = async (id) => {
  const response = await API.get(`rendicion/archivos/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
  return response;
}

// Funcion para eliminar los archivos subidos AnexPDF
export const eliminarArchivosRendicion = async (id) => {
  return API.delete(`rendicion/delete-pdf/${id}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

// Funcion para descargar los archivos en la rendicion
export const descargarArchivosRendicion = async (filePath) => {

  return API.get('rendicion/download-file', {
    params: { filePath },
    responseType: 'blob',
    validateStatus: function (status) {
      return status < 500;
    }
  });
};

// Servicio para traer los tipos monedas 
export const obtenerTiposMonedas = async () => {
  return API.get('solicitudEar/moneda', {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// Servicio para eliminar los detalles dentro de un documento
export const eliminarDetalleEnDocumento = async (idDet, idDoc, idRend) => {
  return API.delete(`/rendicion/detalle/${idDet}/documento/${idDoc}/rendicion/${idRend}`, {
    validateStatus: function (status) {
      return status < 500;
    },
  });
};

// API EXPORT CRL POR DISEÑO DE ELLOS
export const exportarDocumentosExcel = async (idRend) => {
  return API.get(`/rendicion/exportar-excel/${idRend}`, {
    responseType: 'arraybuffer', // Para manejar datos binarios
    validateStatus: function (status) {
      return status < 500;
    },
  });
};


// API GET IND.IMPUESTOS SEGUN EL TIPODOC Y AFECTACION
export const obtenerIndImpuesto = async (tipoDocumento, afectacion) => {
  return API.get(`/rendicion/documento/indicador-impuesto/${tipoDocumento}/${afectacion}`, {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// API GET AFECTACION
export const obtenerAfectacion = async (tipoDocumento) => {
  return API.get(`/rendicion/documento/get-afectacion/${tipoDocumento}`, {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// API BORRADO MASIVO DE DOCUMENTOS
export const eliminarDocumentosMasivo = async (documentos) => {
  return API.post(`/rendicion/documento/borrado-masivo`, documentos, {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// API GET PORCENTAJES POR AFECTACION ID
export const getPorcentajeAfectacion = async (afectacionId) => {
  return API.get(`/rendicion/documento/get-percent/${afectacionId}`, {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// CAMBIAR CONTRASEÑA
export const updatePassword = async (id, oldPass, newPass) => {
  return API.patch(`/usuario/update-password?id=${id}&oldPass=${oldPass}&newPass=${newPass}`, {
    validateStatus: function (status) {
      return status < 500;
    }
  })
}

// OLVIDO CONTRASEÑA
export const forgotPassword = async (email) => {
  return API.post("/usuario/forgot-password", { Email: email }, {
    validateStatus: function (status) {
      return status < 500;
    }
  });
};

// RESET PASSWORD
export const resetPassword = async (token, newPass) => {
  return API.post("/usuario/reset-password", {
    token: token,
    newPassword: newPass
  }, {
    validateStatus: function (status) {
      return status < 500;
    }
  });
}