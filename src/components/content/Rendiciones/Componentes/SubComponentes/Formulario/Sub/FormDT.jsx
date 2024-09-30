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
  importarPlantilla
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
  const [montoRendido, setMontoRendido] = useState(0);
  // const [dataEarExport, setDataEarExport] = useState([]);

  const [habilitado, setHabilitado] = useState(false);

  const estadosEditablesUsr = [8, 9, 12];

  console.log("TOT RED: ", totalRedondeado);

  // const handleNuevoTotal = (total) => {
  //   setTotalRedondeado(total);
  // }

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
        STR_PROVEEDOR: doc.STR_PROVEEDOR,
        STR_COMENTARIOS: doc.STR_COMENTARIOS,
        STR_SERIE: doc.STR_SERIE_DOC,
        STR_MONEDA: doc.STR_MONEDA
      }))

      console.log("Data para exportar:", documentosFormateados);

      setRendicion({ ...response.data.Result[0], documentos: documentosFormateados });
      console.log("respuesta de APIREN: ", { ...response.data.Result[0], documentos: documentosFormateados });

    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
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
        console.log(response.data.Message);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      navigate(ruta + "/rendiciones");
    }
  }

  // aceptar
  const accept = () => {
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

  /*
  const enviarAprobacionConDiferenciaMontos = () => {
    EnviarSolicitud();
  };
  */

  const confirmarDiferenciaMontos = () => {
    let diferencia = rendicion.SOLICITUDRD.STR_TOTALSOLICITADO - montoRendido;
    let mensaje = diferencia < 0 ?
      `Monto Solicitado : ${rendicion.SOLICITUDRD.STR_TOTALSOLICITADO}
    Monto Rendido : ${montoRendido}
    ¿Estás seguro de Enviar a aprobar la rendición #${rendicion.ID} con un reembolso de ${(-1) * diferencia} ?`
      : diferencia > 0 ? `¿Estás seguro de Enviar a aprobar la rendición #${rendicion.ID} con una devolucion de ${diferencia}?`
        : `¿Estás seguro de Enviar a aprobar la rendición #${rendicion.ID}`
    confirmDialog({
      message: mensaje,
      header: "Confirmación Rendición",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: accept,
      //reject,
    });
  };

  //Solicitar Aprobacion
  const [loadingBtn, setLoadingBtn] = useState(false);
  async function ValidacionEnvio() {
    const todosValidados = rendicion.documentos.every(
      (doc) => doc.STR_VALIDA_SUNAT === true
    );
    if (true) {

      let todosDocumentosValidos = true;

      for (const e of rendicion.documentos) {
        try {
          setLoadingBtn(true);
          console.log(e);
          const response = await validacionDocumento(e.ID);
          if (response.status !== 200) {
            showError(response.Message);
            todosDocumentosValidos = false;
          }
        } catch (error) {
          console.log(error.response.data.Message);
          showError(error.response.data.Message);
          todosDocumentosValidos = false;
        }
      }

      if (todosDocumentosValidos) {
        confirmarDiferenciaMontos()
        //confirm1();
      }
      setLoadingBtn(false);
    } else {
      showError("Tienes que tener todos los documentos validados ante SUNAT");
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
                /*
                if (rendicion.SOLICITUDRD.STR_TOTALSOLICITADO - rendicion.STR_TOTALRENDIDO === 0) {
                //if (true) {
                  ValidacionEnvio();
                } else {
                  //ValidacionEnvio();
                  e.preventDefault();
                  confirmarDiferenciaMontos()
                  //showError(`El Monto Rendido no es suficiente para cubrir el Monto Solicitado: ${rendicion.SOLICITUDRD.STR_TOTALSOLICITADO}`);
                }
                */
              }}
            // loading={loadingBtn}
            // disabled={validaEditable}
            />
          )}
          {/* <Button
            className='col-6 md:col-6 lg:col-12 flex align-items-center gap-5'
            icon="pi pi-trash"
            label=""
            // onClick={() => { }}
          /> */}
          {(usuario.rol?.id === "2" || usuario.rol?.id === "3") && ( //Verificar si el usuario es de rol 2
            <Button
              label={"Aceptar Aprobación"}
              size="large"
              className="mr-5"
              onClick={(e) => {
                confirmAceptacion();
              }}
              loading={loadingBtn}
            // disabled={validaEditableBtn}
            />
          )}
          {usuario.rol?.id === "2" && rendicion?.STR_ESTADO <= 12 && ( // Verificar si el usuario es de rol 2 y el estado es menor o igual a 12
            <Button
              label="Revertir Aprobación"
              size="large"
              style={{ borderColor: "#1686CB", backgroundColor: "#1686CB" }}
              onClick={() => confirmReversion(rendicion?.ID)}
            // disabled={!estadosEditables.includes(solicitudRD.STR_ESTADO) || loading}
            />
          )}
          {/* {usuario.rol?.id == "3" ? (
              <Button
                label="Autorizar Edicion"
                severity="danger"
                size="large"
                onClick={() => confirmAutorizarReversion(rendicion?.ID)}

              />
            ) : ""} */}
        </div>
        {/*<div className="d-flex col-12 md:col-12 lg:col-12">
          <Button 
              label={"test"}
              onClick={(e) => {
                if (rendicion.SOLICITUDRD.STR_TOTALSOLICITADO - rendicion.STR_TOTALRENDIDO === 0) {
                  alert("asies")
                } else {
                  alert("ono")
                };
              }}
          />
        </div>*/}
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
    setLoading(true);
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
        console.log(response.data);

        if (body.AprobacionFinalizada == 0) {
          showSuccess(`Se aprobó la rendición`);
        } else {
          showSuccess(`Se migró a a SAP la rendición con número ${body.DocNum}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones");
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError(error.response.data.Message);
    } finally {
      setLoading(false);
    }
  }

  const confirmAceptacion = () => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Rendición con código #${rendicion.ID}?`,
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
    setLoading(true);
    try {
      let response = await revertirAprobRendicion(rendicionId);
      if (response.status < 300) {
        //let body = response.data.Result[0];
        // if (body.AprobacionFinalizada == 0) {
        showSuccess(`Se revertio la aprobacion de la rendición`);
        // } else {
        //   showSuccess(
        //     `Se migró a a SAP la rendición con número ${body.DocNum}`
        //   );
        // }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error);
      showError("Error interno");
    } finally {
      navigate(ruta + "/rendiciones");
      setLoading(false);
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
      console.log(response.data.Result);
    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
    } finally {
      if (!fresh) setLoading(false);
    }
  }

  // OBTENER PROPIEDADES DE UN DOCUMENTO EN ESPECIFICO
  async function fetchDocumentDetails(id) {
    try {
      const response = await obtenerDocumento(id);
      if (response.status === 200) {
        console.log(`Detalles del documento ${id}:`, response.data);
        return response.data;
      } else {
        console.error(`Error al obtener el documento ${id}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error al obtener el documento ${id}:`, error);
    }
  }

  // RECORRIDO PARA OBTENER LOS DETALLES DE TODOS LOS DOCUMENTOS ENLISTADOS
  async function obtenerDataDocumento(fresh = false) {
    if (!fresh) setLoading(true);
    try {
      const response = await obtenerRendicion(id);
      const documentos = response.data.Result[0]?.documentos || [];
      console.log("DOC OBTENIDOS: ", documentos);
      console.log("RENDICION: ", response.data);

      setRendicion({ ...response.data.Result[0], documentos });

      // Obtener detalles de cada documento
      const detallesDocumentos = [];
      for (const doc of documentos) {
        const detalle = await fetchDocumentDetails(doc.ID);
        console.log(`Detalle para documento ${doc.ID}:`, detalle); // Verifica el detalle
        if (detalle && detalle.Result && detalle.Result.length > 0) {
          const detalleDocumento = detalle.Result[0]; // Accede al primer resultado
          detallesDocumentos.push(detalleDocumento);
        }
      }

      // const dataEarExport = documentos.map(doc => ({
      //   N_EAR: doc.STR_NRRENDICION,
      // }))

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

      // console.log("N EAR: ", dataEarExport);
      console.log("detallesDOC: ", detallesDocumentos);
      console.log("Data para exportar:", dataForExport);

      // Opcional: hacer algo con los detalles de los documentos obtenidos
      console.log("Detalles de todos los documentos:", detallesDocumentos);

    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
    } finally {
      if (!fresh) setLoading(false);
    }
  }

  const handleUpload = (event) => {
    setLoading(true);
    const allowedExtensions = ["xlsx"];

    //console.log(event.files);

    try {
      event.files.forEach(async (file) => {
        const fileExtension = getFileExtension(file.name);
        console.log(fileExtension);
        if (allowedExtensions.includes(fileExtension.toLowerCase())) {
          let response = await importarPlantilla(file, rendicion.ID);

          if (response.status < 300) {
            if (response.data.Result.CodRespuesta != "99") {
              showSuccess("Se agregó exitosamente");
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
            `El archivo ${file.name} no tiene la extensión permitida (.xlsx).`
          );
          setExcel(null);
          fileUploadRef.current.clear();
        }
      });
    } catch (error) {
      showError("Error interno");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // const validaEditable =
  //   usuario.rol?.id == 1
  //     ? !estadosEditablesUsr.includes(rendicion.STR_ESTADO)
  //     : usuario.TipoUsuario == 3
  //       ? !estadosEditablesCont.includes(rendicion.STR_ESTADO)
  //       : true;


  const exportExcel = () => {
    const data = dataForExport.flatMap(doc =>
      doc.detalles.map(detalle => ({
        "N° Rendicion": doc.STR_RD_ID,
        "N° documento": doc.ID,
        "Tipo": doc.STR_TIPO_DOC.name,
        "Serie": doc.STR_SERIE,
        "Correlativo": doc.STR_CORR_DOC,
        "RUC": doc.STR_PROVEEDOR.LicTradNum,
        "Razon Social": doc.STR_PROVEEDOR.CardName,
        "Direccion": doc.STR_DIRECCION,
        "Motivo": doc.STR_MOTIVORENDICION.name,
        "Moneda": doc.STR_MONEDA.name,
        "Afectacion": doc.STR_AFECTACION.name,
        "Fecha de Creacion": doc.STR_FECHA_DOC,
        "Comentarios": doc.STR_COMENTARIOS,
        "Importe Total": doc.STR_TOTALDOC,
        "": "", // Columna en blanco
        "Codigo de Articulo": detalle.COD_ARTICULO.ItemCode,
        "Concepto": detalle.CONCEPTO,
        "Almacen": detalle.ALMACEN,
        "Proyecto": detalle.PROYECTO.name,
        "Unidad de Negocio": detalle.UNIDAD_NEGOCIO.name,
        "Filial": detalle.FILIAL.name,
        "Area": detalle.AREA.name,
        "Centro Costo": detalle.CENTRO_COSTO.name,
        "Indicador Impuesto": detalle.IND_IMPUESTO.name,
        "Precio": detalle.PRECIO,
        "Cantidad": detalle.CANTIDAD,
        "Impuesto": detalle.IMPUESTO
      }))
    );
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 15 }, // COLUMNA EN BLANCO
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    workSheet["!cols"] = columnWidths;

    // const rendicionId = dataEarExport[0]?.N_EAR;
    const fileName = `${rendicion.STR_NRRENDICION}.xlsx`;

    XLSX.utils.book_append_sheet(workBook, workSheet, "DOCUMENTOS");
    XLSX.writeFile(workBook, fileName);
  };

  const showEditButton = usuario.rol?.id == 1 && rendicion?.STR_ESTADO_INFO?.id < 10;
  const confirmReversion = (id) => {
    confirmDialog({
      message: `¿Estás seguro de revertir la aprobacion de Rendición con código #${id}?`,
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
    const fileUrl = '/templates/PlantillaDocumentos.xlsx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'Plantila de Documentos.xlsx'); // Nombre con el que se descargará el archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Limpia el enlace después de hacer clic
  };

  async function obtenerDataRendicion(idRendicion) {
    try {
      console.log(`Obteniendo datos de la rendición con ID: ${idRendicion}`);

      const response = await obtenerRendicion(idRendicion);

      if (response.status === 200 && response.data.Result && response.data.Result.length > 0) {
        const rendicion = response.data.Result[0];

        console.log('Datos de la rendición:', rendicion);

        const totalSTR_TOTALDOC = rendicion.documentos.reduce((sum, documento) => {
          return sum + (documento.STR_TOTALDOC || 0); // Asegurarse de que no sea undefined
        }, 0);

        console.log("Total STR_TOTALDOC: ", totalSTR_TOTALDOC)

        setMontoRendido(totalSTR_TOTALDOC);

        setRendicionData({ ...rendicion, totalSTR_TOTALDOC });
      } else {
        console.log("No se encotnraron datos para la rendicion")
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
            } align-items-center`}>
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
              navigate(ruta +
                `/rendiciones/${rendicion?.ID}/documentos/agregar`);
            }}


            disabled={!showEditButton}
          />

          <Button
            label="Exportar"
            icon="pi pi-upload"
            severity="secondary"
            style={{ backgroundColor: "black" }}
            onClick={() => {
              exportExcel();
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
            uploadHandler={handleUpload}
            className="justify-content-center text-base"
            chooseLabel="Importar Plantilla"
            chooseOptions={{
              icon: "pi pi-upload",
            }}
            progressBarTemplate
            // disabled={validaEditable}
            disabled={false}
          />

        </div>
      </div>

      <Divider />
      <div className="grid mt-3">
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Código:
            </label>
            <InputText
              value={rendicion?.ID}
              placeholder="codigo"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              N° Rendición:
            </label>
            <InputText
              value={rendicion?.STR_NRRENDICION}
              placeholder=" N° Rendición"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Estado:
            </label>
            <InputText
              value={rendicion?.STR_ESTADO_INFO?.name}
              placeholder="Estado"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Emp.Asignado:
            </label>
            <InputText
              value={rendicion?.STR_EMPLDASIG}
              placeholder="Emp.Asignado"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              N° de la SR:
            </label>
            <InputText
              value={rendicion?.STR_SOLICITUD}
              placeholder="N° de la SR"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Fecha de Solicitud:
            </label>
            <InputText
              value={rendicion?.SOLICITUDRD.STR_FECHAREGIS}
              // onChange={(rendicion) => fecBodyTemplate(rendicion.value.)}
              dateFormat="dd/mm/yy"
              disabled
              locale='es'
              showIcon />
            {/* <p>{fecBodyTemplate ? `Fecha seleccionada: ${new Date(fecBodyTemplate).toLocaleDateString('es-ES')}` : ''}</p> */}
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Monto Rendido:
            </label>
            <InputText
              value={`${rendicion?.STR_MONEDA?.name || ''} ${montoRendido} `} // Mostrar el valor del monto y el tipo de moneda
              placeholder="Monto Rendido"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              FechaRD:
            </label>
            <InputText
              value={rendicion?.STR_FECHAREGIS}
              disabled
              // onChange={(e) => setDate(e.value)} 
              showIcon />
          </div>
        </div>
        {/* <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              CargaDocs:
            </label>
            <InputText
              // value={rendicion?.}
              placeholder="CargaDocs"
              disabled
            />
          </div>
        </div> */}
        {/* <div className="col-12 md:col-5 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              DocEntry:
            </label>
            <InputText
              value={rendicion?.STR_DOCENTRY}
              placeholder="DocEntry"
              disabled
            />
          </div>
        </div> */}
      </div>
      <Divider />

      <div className="card flex flex-wrap  gap-3 mx-3">

        {/* Botones por rol */}
        {/*usuario.rol?.id === "2" && rendicion?.STR_ESTADO <= 12 ? (
            <Button
              label="Revertir Aprobación"
              size="large"
              style={{ backgroundColor: "#FFA500" }}
              onClick={() => confirmReversion(rendicion?.ID)}
            // disabled={
            //   !estadosEditables.includes(solicitudRD.STR_ESTADO) | loading
            // }
            />
          )*/}

        {/*usuario.rol?.id == "3" ? (
              <Button
                label="Autorizar Edicion"
                severity="danger"
                size="large"
                onClick={() => confirmAutorizarReversion(rendicion?.ID)}
              // disabled={
              //   (solicitudRD.STR_ESTADO > 3) | (solicitudRD.STR_ESTADO == 1)
              // }
              />
            ) : ""*/}
      </div>
      <TableDT
        rendicion={rendicion}
        setRendicion={setRendicion}
        totalRedondeado={totalRedondeado}
      >
      </TableDT>
      <Divider />
      {
        //  usuario.rol?.id == "1" && rendicion?.STR_ESTADO_INFO.id === "9" ? (

        <AnexPDF
          rendicion={rendicion}
          showSuccess={showSuccess}
          // usuario={usuario}
          showError={showError}
        >
        </AnexPDF>
        // ) : null
      }
      <Divider />

      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
    </>
  )
}
