import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import React, { useContext, useRef } from 'react'


import * as XLSX from 'xlsx';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';

import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../../../../../../App';
import Rendiciones from '../../../Rendiciones';
import {
  aceptarAprobRendicion, obtenerRendicion, autorizarReversionAprobRendicion,
  revertirAprobRendicion, validacionDocumento,
  enviarAprobRendicion, obtenerDocumento,
  importarPlantilla, exportarDocumentosExcel
}
  from '../../../../../../../services/axios.service';
import { useState } from 'react';
import { useEffect } from 'react';
import TableDT from './TableDT';
import { setDate } from 'date-fns';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import AnexPDF from './AnexPDF';
import { toUnitless } from '@mui/material/styles/cssUtils';


export default function FormDT({ editable, totalRedondeado,
  fechaSolicitud, responsiveSizeMobile, rowData
}) {
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const [excel, setExcel] = useState();
  const [rendicion, setRendicion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [dataForExport, setDataForExport] = useState([]);
  const [rendicionData, setRendicionData] = useState(null);

  const [montoSolicitado, setMontoSolicitado] = useState(0);
  const [montoRendido, setMontoRendido] = useState(0);

  const [habilitado, setHabilitado] = useState(false);

  const estadosEditablesUsr = [8, 9, 12];

  async function obtenerData(fresh = false) {
    if (!fresh) setLoading(true);
    try {
      const response = await obtenerRendicion(id);
      const documentos = response.data.Result[0]?.documentos || [];
      const documentosFormateados = documentos.map(doc => ({
        ID: doc.ID,
        N_STRRENDICION: doc.STR_NRRENDICION,
        STR_TIPO_DOC: doc.STR_TIPO_DOC,
        STR_FECHA_DOC: doc.STR_FECHA_DOC,
        STR_TOTALDOC: doc.STR_TOTALDOC,
        STR_TOTALDOC_CONVERTIDO: doc.STR_TOTALDOC_CONVERTIDO,
        STR_PROVEEDOR: doc.STR_PROVEEDOR,
        STR_COMENTARIOS: doc.STR_COMENTARIOS,
        STR_SERIE: doc.STR_SERIE_DOC,
        STR_MONEDA: doc.STR_MONEDA,
        STR_NUM_COMPROBANTE: doc.STR_NUM_COMPROBANTE
      }))

      setRendicion({ ...response.data.Result[0], documentos: documentosFormateados });

    } catch (error) {
      showError(error.Message);
    }
    finally {
      if (!fresh) setLoading(false);
    }
  }

  useEffect(() => {
    obtenerData();
    obtenerDataDocumento();
  }, []);

  async function EnviarSolicitud() {
    try {
      setLoading(true);
      const body = {
        usuarioId: usuario.empId,
        tipord: rendicion.SOLICITUDRD.STR_TIPORENDICION,
        area: rendicion.STR_EMPLEADO_ASIGNADO.SubGerencia,
        monto: rendicion.STR_TOTALRENDIDO,
        cargo: rendicion.STR_EMPLEADO_ASIGNADO.jobTitle,
        conta: usuario.TipoUsuario == 3 ? 0 : 1,
      };
      let diferencia = rendicion.SOLICITUDRD.STR_TOTALSOLICITADO - rendicion.STR_TOTALRENDIDO
      let response = await enviarAprobRendicion(
        rendicion.ID, rendicion.SOLICITUDRD.ID, usuario.sapID,
        rendicion.STR_ESTADO, usuario.branch, diferencia
      );
      if (response.status < 300) {
        showSuccess(
          "Rendición fue enviada a aprobación. Se le notificará por correo electronico cuando se tenga respuesta"
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        showError("Ocurrio error interno");
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setLoadingBtn(false);
      navigate(ruta + "/rendiciones");
    }
  }

  // aceptar
  const accept = () => {
    setLoadingBtn(true);
    EnviarSolicitud();
  };
  // confirmacion 
  const confirm1 = () => {
    confirmDialog({
      message: `¿Estás seguro de Enviar a aprobar la rendición con código #${rendicion.ID}?`,
      header: "Confirmación Rendición",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: accept,
      //reject,
    });
  };

  const confirmarDiferenciaMontos = () => {
    let diferencia = parseFloat((rendicion.SOLICITUDRD.STR_TOTALSOLICITADO || 0)) - parseFloat((montoRendido || 0));
    diferencia = parseFloat(diferencia.toFixed(2)); // Redondear a dos decimales

    let mensaje;

    const moneda = rendicion?.STR_MONEDA?.id || 'PEN';
    const montoSolicitadoFormatted = formatCurrency(parseFloat(montoSolicitado || 0), moneda);
    const montoRendidoFormatted = formatCurrency(parseFloat(montoRendido || 0), moneda);
    const diferenciaFormatted = formatCurrency(Math.abs(diferencia), moneda);

    if (diferencia < 0) {
      mensaje = `
        <div style="line-height: 1.6; font-size: 14px;">
          <p><strong>Monto Solicitado:</strong> ${montoSolicitadoFormatted}</p>
          <p><strong>Monto Rendido:</strong> ${montoRendidoFormatted}</p>
          <p>¿Estás seguro de solicitar aprobación para el número de entrega a rendir <strong>#${rendicion.STR_NRRENDICION}</strong> con un <strong>reembolso</strong> de ${diferenciaFormatted}?</p>
        </div>
      `;
    } else if (diferencia > 0) {
      mensaje = `
        <div style="line-height: 1.6; font-size: 14px;">
          <p><strong>Monto Solicitado:</strong> ${montoSolicitadoFormatted}</p>
          <p><strong>Monto Rendido:</strong> ${montoRendidoFormatted}</p>
          <p>¿Estás seguro de solicitar aprobación para el número de entrega a rendir <strong>#${rendicion.STR_NRRENDICION}</strong> con una <strong>devolución</strong> de ${diferenciaFormatted}?</p>
        </div>
      `;
    } else {
      mensaje = `
        <div style="line-height: 1.6; font-size: 14px;">
          <p><strong>Monto Solicitado:</strong> ${montoSolicitadoFormatted}</p>
          <p><strong>Monto Rendido:</strong> ${montoRendidoFormatted}</p>
          <p>¿Estás seguro de solicitar aprobación para el número de entrega a rendir <strong>#${rendicion.STR_NRRENDICION}</strong>?</p>
        </div>
      `;
    }

    confirmDialog({
      message: <div dangerouslySetInnerHTML={{ __html: mensaje }} />,
      header: "Confirmación Rendición",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Confirmar",
      rejectLabel: "Cancelar",
      accept: accept,
      reject: () => {
        setLoadingBtn(false);
      }
    });
  };

  //Solicitar Aprobacion
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingAceptacion, setLoadingAceptacion] = useState(false);
  const [loadingReversion, setLoadingReversion] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  async function ValidacionEnvio() {
    const todosValidados = rendicion.documentos.every(
      (doc) => doc.STR_VALIDA_SUNAT === true
    );
    if (true) {

      let todosDocumentosValidos = true;

      // setLoadingBtn(true);

      for (const e of rendicion.documentos) {
        try {
          const response = await validacionDocumento(e.ID);
          if (response.status !== 200) {
            showError(response.Message);
            todosDocumentosValidos = false;
          }
        } catch (error) {
          showError(error.response.data.Message);
          todosDocumentosValidos = false;
        }
      }

      if (todosDocumentosValidos) {
        confirmarDiferenciaMontos()
        //confirm1();
      } else {
        // setLoadingBtn(false); // Cancelamos loading si hubo error
      }
    } else {
      showError("Tienes que tener todos los documentos validados ante SUNAT");
      setLoadingBtn(false);
    }
  }
  const leftToolbarTemplate = () => {
    return (
      <div className="">
        <div className="d-flex col-12 md:col-12 lg:col-12">
          {/* <Button
            className='col-12 md:col-12 lg:col-12'
            icon="pi pi-plus"
            label="Guardar Borrador"
          /> */}
          {usuario.rol?.id === "1" && ( //Verificar si el usuario es de rol 1
            <Button
              className='mr-2'
              label={"Solicitar Aprobación"}
              size="large"
              onClick={(e) => {
                ValidacionEnvio();
              }}
              loading={loadingBtn}
              disabled={
                loadingBtn ||
                rendicion?.STR_ESTADO === 10 ||
                rendicion?.STR_ESTADO === 11 ||
                rendicion?.STR_ESTADO === 16
              }
            />
          )}
          {(usuario.rol?.id === "2" || usuario.rol?.id === "3") && ( //Verificar si el usuario es de rol 2
            <Button
              label={"Aceptar Aprobación"}
              size="large"
              className="mr-5"
              onClick={(e) => {
                confirmAceptacion();
              }}
              loading={loadingAceptacion}
              disabled={
                (usuario.rol?.id === "2" && (rendicion?.STR_ESTADO === 11 || rendicion?.STR_ESTADO === 16 || rendicion?.STR_ESTADO === 17)) ||
                (usuario.rol?.id === "3" && rendicion?.STR_ESTADO === 16 || rendicion?.STR_ESTADO === 17) || loadingAceptacion || loadingReversion
              }
            />
          )}
          {(usuario.rol?.id === "2" || usuario.rol?.id === "3") && ( // Verificar si el usuario es de rol 2 y el estado es menor o igual a 12
            <Button
              label="Revertir Aprobación"
              size="large"
              style={{ borderColor: "#1686CB", backgroundColor: "#1686CB" }}
              onClick={() => confirmReversion(rendicion?.ID)}
              loading={loadingReversion}
              disabled={
                (usuario.rol?.id === "2" && (rendicion?.STR_ESTADO === 11 || rendicion?.STR_ESTADO === 16)) ||
                (usuario.rol?.id === "3" && rendicion?.STR_ESTADO === 16) || loadingReversion || loadingAceptacion
              }
            />
          )}
        </div>
      </div>
    );
  };

  /* States Globales */
  const showSuccess = (mensaje) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: mensaje,
      life: 5000,
    });
  };

  const showError = (mensaje) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 5000,
    });
  };

  const showInfo = (mensaje) => {
    toast.current.show({
      severity: "info",
      summary: "Info",
      detail: mensaje,
      life: 3000,
    });
  };

  async function aceptarAprobacionLocal() {
    setLoadingAceptacion(true);
    setLoadingReversion(true);

    try {
      let response = await aceptarAprobRendicion(
        rendicion.SOLICITUDRD.ID,
        usuario.sapID,
        usuario.branch,
        rendicion.STR_ESTADO,
        rendicion.ID,
        usuario.branch
      );
      if (response.status < 300) {
        let body = response.data.Result[0];

        if (body.AprobacionFinalizada == 0) {
          showSuccess(`Se aprobó la rendición`);
        } else {
          showSuccess(`Se migró a a SAP la rendición con número ${body.DocNum} `);
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // await obtenerRendicionLocal();
        navigate(ruta + "/rendiciones");
      } else {
        showError(response.Message);
      }
    } catch (error) {
      showError(error.response.data.Message);
    } finally {
      setLoadingAceptacion(false);
      setLoadingReversion(false);
      await obtenerRendicionLocal();
    }
  }

  const confirmAceptacion = () => {
    confirmDialog({
      message: `¿Estás seguro de aprobar la entrega a rendir #${rendicion.STR_NRRENDICION}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () => aceptarAprobacionLocal(),
      //reject,
    });
  };

  async function ReversionAprobacionLocal(rendicionId) {
    setLoadingReversion(true);
    setLoadingAceptacion(true);

    try {
      let response = await revertirAprobRendicion(rendicionId);
      if (response.status < 300) {
        showSuccess(`Se revertio la aprobacion de la rendición`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones");
      } else {
        showError(response.Message);
      }
    } catch (error) {
      showError("Error interno");
    } finally {
      setLoadingReversion(false);
      setLoadingAceptacion(false);
    }
  }
  // confirmacion
  const confirmAutorizarReversion = (
    id
  ) => {
    confirmDialog({
      message: `¿Estás seguro de autorizar la reversion de la Rendición con código #${id}?`,
      header: "Autorizar reversion - Rendicion",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () =>
        autorizarReversionLocal(
          id
        ),
      //reject,
    });
  };

  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  async function obtenerRendicionLocal(fresh = false) {
    if (!fresh) setLoading(true);
    try {
      let response = await obtenerRendicion(id);

      setRendicion(response.data.Result[0]);
    } catch (error) {
      showError(error.Message);
    } finally {
      if (!fresh) setLoading(false);
    }
  }

  // OBTENER PROPIEDADES DE UN DOCUMENTO EN ESPECIFICO
  async function fetchDocumentDetails(id) {
    try {
      const response = await obtenerDocumento(id);
      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`Error al obtener el documento ${id}: `, response.statusText);
      }
    } catch (error) {
      console.error(`Error al obtener el documento ${id}: `, error);
    }
  }

  // RECORRIDO PARA OBTENER LOS DETALLES DE TODOS LOS DOCUMENTOS ENLISTADOS
  async function obtenerDataDocumento(fresh = false) {
    if (!fresh) setLoading(true);
    try {
      const response = await obtenerRendicion(id);
      const documentos = response.data.Result[0]?.documentos || [];

      setRendicion({ ...response.data.Result[0], documentos });

      // Obtener detalles de cada documento
      const detallesDocumentos = [];
      for (const doc of documentos) {
        const detalle = await fetchDocumentDetails(doc.ID);
        if (detalle && detalle.Result && detalle.Result.length > 0) {
          const detalleDocumento = detalle.Result[0]; // Accede al primer resultado
          detallesDocumentos.push(detalleDocumento);
        }
      }

      // PREPARAR DATA PARA EL EXPORTAR EXCEL
      const dataForExport = detallesDocumentos.map(doc => ({
        ID: doc.ID,
        STR_RD_ID: doc.STR_RD_ID,
        STR_TIPO_DOC: doc.STR_TIPO_DOC,
        STR_SERIE: doc.STR_SERIE_DOC,
        STR_CORR_DOC: doc.STR_CORR_DOC,
        STR_PROVEEDOR: doc.STR_PROVEEDOR,
        STR_DIRECCION: doc.STR_DIRECCION,
        STR_MOTIVORENDICION: doc.STR_MOTIVORENDICION,
        STR_MONEDA: doc.STR_MONEDA,
        STR_AFECTACION: doc.STR_AFECTACION,
        STR_FECHA_DOC: doc.STR_FECHA_DOC,
        STR_COMENTARIOS: doc.STR_COMENTARIOS,
        STR_TOTALDOC: doc.STR_TOTALDOC,
        STR_TOTALDOC_CONVERTIDO: doc.STR_TOTALDOC_CONVERTIDO,
        detalles: doc.detalles.map(detalle => ({
          // ID: detalle.ID,
          COD_ARTICULO: detalle.STR_CODARTICULO,
          CONCEPTO: detalle.STR_CONCEPTO,
          ALMACEN: detalle.STR_ALMACEN,
          PROYECTO: detalle.STR_PROYECTO,
          UNIDAD_NEGOCIO: detalle.STR_DIM1,
          FILIAL: detalle.STR_DIM2,
          AREA: detalle.STR_DIM4,
          CENTRO_COSTO: detalle.STR_DIM5,
          IND_IMPUESTO: detalle.STR_INDIC_IMPUESTO,
          PRECIO: detalle.STR_PRECIO,
          CANTIDAD: detalle.STR_CANTIDAD,
          IMPUESTO: detalle.STR_IMPUESTO,
        }))
      }));

      // setDataEarExport(dataEarExport);
      setDataForExport(dataForExport);
      setDetalles(detallesDocumentos);

    } catch (error) {
      showError(error.Message);
    } finally {
      if (!fresh) setLoading(false);
    }
  }

  const confirmarImportacion = (event) => {
    confirmDialog({
      message: "¿Estás seguro de importar la plantilla? Verifica que la información del archivo sea correcta antes de continuar.",
      header: "Confirmación de Importación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, importar",
      rejectLabel: "No",
      accept: () => handleUpload(event),
      //reject: () => {}, // opcional
    });
  }

  const handleUpload = (event) => {
    setLoading(true);
    const allowedExtensions = ["xlsx"];

    try {
      event.files.forEach(async (file) => {
        const fileExtension = getFileExtension(file.name);
        if (allowedExtensions.includes(fileExtension.toLowerCase())) {
          let response = await importarPlantilla(file, rendicion.ID);

          if (response.status < 300) {
            if (response.data.Result.CodRespuesta != "99") {
              showSuccess("Se importó los documentos exitosamente");
              obtenerRendicionLocal();
            } else {
              showError(response.data.Result.DescRespuesta);
              setExcel(null);
              fileUploadRef.current.clear();
            }
          } else {
            showError(response.data);
            setExcel(null);
            fileUploadRef.current.clear();
          }
        } else {
          showError(
            `El archivo ${file.name} no tiene la extensión permitida(.xlsx).`
          );
          setExcel(null);
          fileUploadRef.current.clear();
        }
      });
    } catch (error) {
      showError("Error interno");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!rendicion || !rendicion.documentos || rendicion.documentos.length === 0) {
      showInfo("No hay documentos disponibles para exportar.");
      return;
    }

    setLoading(true);

    try {
      const response = await exportarDocumentosExcel(rendicion?.ID);
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${rendicion?.STR_NRRENDICION}.xlsx`); // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess("Documentos exportados exitosamente.");
      } else {
        showError("Error al exportar el archivo. Inténtalo nuevamente.");
      }
    } catch (error) {
      showError("Ocurrió un error al exportar el archivo. Cierra el archivo Excel de exportación de esta rendición si está abierto.");
    } finally {
      setLoading(false);
    }
  }

  const showEditButton = usuario.rol?.id == 1 && rendicion?.STR_ESTADO_INFO?.id < 10;

  const confirmReversion = () => {
    confirmDialog({
      message: `¿Estás seguro de revertir la aprobacion de la entrega a rendir #${rendicion?.STR_NRRENDICION}?`,
      header: "Revertir Rendicion",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () =>
        ReversionAprobacionLocal(id),
      //reject,
    });
  };

  const handleDownloadPlantilla = () => {
    const fileUrl = '/templates/PlantillaCargaDocumentos.xlsx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'PlantillaCargaDocumentos.xlsx'); // Nombre con el que se descargará el archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Limpia el enlace después de hacer clic
  };

  async function obtenerDataRendicion(idRendicion) {
    try {
      const response = await obtenerRendicion(idRendicion);

      if (response.status === 200 && response.data.Result && response.data.Result.length > 0) {
        const rendicion = response.data.Result[0];

        const totalSolicitado = parseFloat(rendicion?.SOLICITUDRD?.STR_TOTALSOLICITADO).toFixed(2);
        const totalRendido = parseFloat(rendicion?.STR_TOTALRENDIDO).toFixed(2);

        setMontoSolicitado(totalSolicitado);
        setMontoRendido(totalRendido);

        setRendicionData({ ...rendicion, totalRendido });
      } else {
      }
    } catch (error) {
      console.error('Error al obtener datos de la rendición:', error);
    }
  }

  useEffect(() => {
    if (id) {
      obtenerDataRendicion(id);
    }
  }, [id]);

  useEffect(() => {
    if (rendicion) {
      const totalSolicitado = parseFloat(rendicion?.SOLICITUDRD?.STR_TOTALSOLICITADO || 0).toFixed(2);
      const totalRendido = parseFloat(rendicion?.STR_TOTALRENDIDO || 0).toFixed(2);

      setMontoSolicitado(totalSolicitado);
      setMontoRendido(totalRendido);
    }
  }, [rendicion]); // <- Esto reacciona a cada cambio de rendicion

  const formatCurrency = (value, currency) => {
    return value.toLocaleString("es-PE", {
      style: "currency",
      currency: currency,
    });
  }

  return (
    <>
      <ConfirmDialog />
      <Toast ref={toast} />
      <div className="flex justify-content-between flex-wrap">
        <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              navigate(ruta + "/rendiciones");
            }}
          ></i>
          <div className={`flex ${responsiveSizeMobile ? `text-xl` : `text-2xl`
            } align - items - center`}>
            Rendición info
          </div>
        </div>
        <div div className="flex flex-row flex-wrap gap-2">
          {/*<Button
            icon="pi pi-refresh"
            onClick={() => {
              setFiltrado((prevFiltrado) => ({
                ...prevFiltrado,
              }));
            }}
            severity="secondary"
          />*/}
          {/*<Button
            icon="pi pi-eraser"
            onClick={() => {
                  setFiltrado({
                    rangoFecha: [new Date(now.getFullYear(), 0, 1), new Date()],
                    nrRendicion: null,
                    estados: null,
            });
            }}
            severity="secondary"
            />*/}
          <Button
            label="Agregar"
            icon="pi pi-plus"
            severity="success"
            onClick={() => {
              navigate(ruta + `/rendiciones/${rendicion?.ID}/documentos/agregar`);
            }}
            disabled={!showEditButton || loadingBtn}
          />

          <Button
            label="Exportar Documentos"
            icon="pi pi-upload"
            severity="secondary"
            style={{ backgroundColor: "black" }}
            onClick={() => {
              handleExportExcel();
            }}
          />

          <Button
            label='Descargar Plantilla'
            icon='pi pi-download'
            className='p-button-success'
            onClick={handleDownloadPlantilla}
          />

          <FileUpload
            ref={fileUploadRef}
            files={excel}
            mode="basic"
            name="demo[]"
            url="/api/upload"
            accept=".xlsx"
            customUpload
            maxFileSize={1000000}
            uploadHandler={(e) => confirmarImportacion(e)}
            // uploadHandler={handleUpload}
            className="justify-content-center text-base"
            chooseLabel="Importar Plantilla"
            chooseOptions={{
              icon: "pi pi-upload",
            }}
            progressBarTemplate
            // disabled={validaEditable}
            disabled={rendicion?.STR_ESTADO >= 10 || loadingBtn}
          />

        </div>
      </div>

      <Divider />
      <div className="grid mt-3">
        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">N° de la SR:</label>
          <InputText value={rendicion?.STR_SOLICITUD} disabled />
        </div>

        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">Empleado:</label>
          <InputText value={rendicion?.STR_EMPLD_NOMBRE} disabled />
        </div>

        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">Moneda:</label>
          <InputText value={rendicion?.STR_MONEDA?.name} disabled />
        </div>

        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">Monto Solicitado:</label>
          <InputText
            value={formatCurrency(rendicion?.SOLICITUDRD?.STR_TOTALSOLICITADO || 0, rendicion?.STR_MONEDA?.id || 'PEN')}
            disabled
          />
        </div>

        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">Monto Rendido:</label>
          <InputText
            value={formatCurrency(rendicion?.STR_TOTALRENDIDO || 0, rendicion?.STR_MONEDA?.id || 'PEN')}
            disabled
          />
        </div>

        <div className="col-12 md:col-6 lg:col-4">
          <label className="font-bold block mb-2">Diferencia:</label>
          <InputText
            value={formatCurrency(
              (rendicion?.SOLICITUDRD?.STR_TOTALSOLICITADO || 0) - (rendicion?.STR_TOTALRENDIDO || 0),
              rendicion?.STR_MONEDA?.id || 'PEN'
            )}
            disabled
          />
        </div>
      </div>
      <Divider />

      <div className="card flex flex-wrap  gap-3 mx-3">
      </div>
      <TableDT
        rendicion={rendicion}
        setRendicion={setRendicion}
        totalRedondeado={totalRedondeado}
      >
      </TableDT>
      <Divider />
      {

        <AnexPDF
          rendicion={rendicion}
          showSuccess={showSuccess}
          // usuario={usuario}
          showError={showError}
        >
        </AnexPDF>
      }
      <Divider />

      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
    </>
  )
}
