import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import React, { useContext, useEffect, useRef, useState } from "react";
import { HeaderDoc } from "./SubComponentes/HeaderDoc";
import { Documentos } from "./SubComponentes/Documentos";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  aceptarAprobRendicion,
  actualizaRendicion,
  actualizarSntDoc,
  borrarDocumento,
  consultaComprobante,
  enviarAprobRendicion,
  extraerPlantilla,
  importarPlantilla,
  obtenerRendicion,
  rechazarAprobRendicion,
  validacionDocumento,
} from "../../../../services/axios.service";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import DocsHeader from "./SubComponentes/DocsHeader";
import { FileUpload } from "primereact/fileupload";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { AppContext } from "../../../../App";

export function BodyDocs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, ruta } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [excel, setExcel] = useState();
  //const [documentos, setDocumentos] = useState([]);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const [rendicion, setRendicion] = useState({
    STR_NRRENDICION: null,
    STR_EMPLEADO_ASIGNADO: {
      Nombres: null,
    },
    STR_TOTALRENDIDO: 0.0,
    STR_ESTADO_INFO: {
      Nombre: null,
    },
    SOLICITUDRD: {
      STR_TOTALSOLICITADO: 0.0,
    },
  });
  // Estados editables
  const estadosEditablesUsr = [8, 9, 12];
  const estadosEditablesCont = [10];
  const estadosEditablesAut = [11, 13];

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

  async function ValidacionEnvio() {
    const todosValidados = rendicion.documentos.every(
      (doc) => doc.STR_VALIDA_SUNAT === true
    );
    if (todosValidados) {
      // confirm1();

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
        confirm1();
      }

      // const promises = [];

      // rendicion.documentos.forEach((e) => {
      //   validacionDocumento(e.ID);
      // });

      // await Promise.all(promises);

      //showSuccess("Se procede con la aprobación");
      setLoadingBtn(false);
    } else {
      showError("Tienes que tener todos los documentos validados ante SUNAT");
    }
  }

  const accept = () => {
    EnviarSolicitud();
    // toast.current.show({
    //   severity: "info",
    //   summary: "Confirmación",
    //   detail: `Se envió la solicitud de Rendición con código ${rendicion.ID}`,
    //   life: 3000,
    // });
  };

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
      let response = await enviarAprobRendicion(
        rendicion.ID,
        rendicion.SOLICITUDRD.ID,
        usuario.empId,
        rendicion.STR_ESTADO,
        usuario.SubGerencia
      );
      if (response.status < 300) {
        console.log(
          "Rendición fue enviada a aprobación. Se le notificará por correo electronico cuando se tenga respuesta"
        );
        showSuccess(
          "Rendición fue enviada a aprobación. Se le notificará por correo electronico cuando se tenga respuesta"
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones");
      } else {
        showError("Ocurrio error interno");
        console.log(response.data.Message);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      obtenerRendicionLocal(true);
      navigate(ruta + "/rendiciones");
    }
  }
  async function descargarPlantilla() {
    try {
      let response = await extraerPlantilla();

      console.log(response);
      console.log(typeof response.data); // Debería ser "string"
      //let result = response.data.Result[0];
      //console.log(result);
      const url = URL.createObjectURL(new Blob([response.data]));
      console.log(url);
      // Crear un elemento <a> temporal
      const link = document.createElement("a");
      link.href = url;
      link.download = "PlantillaPortalEAR.xlsx"; // Especifica el nombre del archivo que se descargará

      // Simular un clic en el enlace
      document.body.appendChild(link);
      link.click();

      // Eliminar el enlace temporal
      document.body.removeChild(link);
    } catch (error) {
      showError("Error interno");
      console.log(error);
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

  async function handleConsultSunat(
    fechaDoc,
    tipoDoc,
    serieDoc,
    corrDoc,
    totalDoc,
    proveedor,
    id
  ) {
    try {
      setLoadingBtn(true);
      console.log(proveedor, tipoDoc, serieDoc, corrDoc, fechaDoc);
      if (
        proveedor != null &&
        tipoDoc != null &&
        serieDoc != null &&
        corrDoc != null //&&
        // fechaDocumento != null
      ) {
        let fechaISO = fechaDoc.split(" ")[0];

        var comprobanteReq = {
          numRuc: proveedor,
          codComp: tipoDoc,
          numeroSerie: serieDoc,
          numero: corrDoc,
          fechaEmision: fechaISO,
          monto: totalDoc,
        };
        let response = await consultaComprobante(comprobanteReq);
        let compResponse = response.data.Result[0];
        console.log(compResponse);
        if (
          (compResponse.data == null) |
          (compResponse.data?.estadoCp == "0")
        ) {
          await actualizarSntDoc(id, "0");
          showError(
            `El comprobante ${tipoDoc}-${serieDoc}-${corrDoc} no se encontró`
          );
          setLoading(false);

          /*setDocumento((prevDocumento) => ({
            ...prevDocumento,
            STR_VALIDA_SUNAT: false,
          }));*/
          //setCompExisteSunat(false);
        } else {
          showSuccess(
            `El comprobante ${tipoDoc}-${serieDoc}-${corrDoc} es existente`
          );
          await actualizarSntDoc(id, "1");
          //obtenerRendicionLocal();
          //setLoading(false);
          /*setDocumento((prevDocumento) => ({
            ...prevDocumento,
            STR_VALIDA_SUNAT: true,
          }));*/
          //setCompExisteSunat(true);
        }
      } else {
        showError(
          "No se completó el ruc, tipo, serie, fecha de doc y/o correlativo"
        );
        // setDocumento((prevDocumento) => ({
        //   ...prevDocumento,
        //   STR_VALIDA_SUNAT: false,
        // }));
        //setCompExisteSunat(false);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      showError("Error al consultar el comprobante");
      setLoading(false);
      // setDocumento((prevDocumento) => ({
      //   ...prevDocumento,
      //   STR_VALIDA_SUNAT: false,
      // }));
      //setCompExisteSunat(false);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoadingBtn(false);
    }
  }

  async function borrarDocumentoLocal(id, idRendicion, fresh = true) {
    try {
      await borrarDocumento(id, idRendicion).then((resp) => {
        let data = resp.data.Result[0];
        showSuccess(`Se eliminó documento ${data.id} exitosamente`);
      });
    } catch (error) {
      console.log(error);
      showError("Error interno");
    } finally {
      if (fresh) obtenerRendicionLocal();
    }
  }

  async function aceptarAprobacionLocal() {
    setLoading(true);
    try {
      let response = await aceptarAprobRendicion(
        rendicion.SOLICITUDRD.ID,
        usuario.empId,
        usuario.SubGerencia,
        rendicion.STR_ESTADO_INFO.Id,
        rendicion.ID,
        usuario.SubGerencia
      );
      if (response.status < 300) {
        let body = response.data.Result[0];
        console.log(response.data);

        if (body.AprobacionFinalizada == 0) {
          showSuccess(`Se aprobó la rendición`);
        } else {
          showSuccess(
            `Se migró a a SAP la rendición con número ${body.DocNum}`
          );
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

  async function rechazarAprobacionLocal() {
    setLoadingBtn(true);
    try {
      let response = await rechazarAprobRendicion(
        rendicion.SOLICITUDRD.ID,
        usuario.empId,
        usuario.SubGerencia,
        rendicion.STR_ESTADO_INFO.Id,
        rendicion.ID,
        usuario.SubGerencia
      );
      if (response.status == 200) {
        showInfo("Se rechazó la rendición");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones");
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      console.log(error);
      showError("Error interno");
    } finally {
      setLoadingBtn(false);
    }
  }

  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  async function actualizarRendiEnCarga(body) {
    try {
      let _body = { ...body };
      _body.STR_ESTADO = 9;
      await actualizaRendicion(_body);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // if (rendicion.STR_ESTADO == 8) {
    //   actualizarRendiEnCarga(rendicion);
    // }

    if (id == null) {
      navigate(ruta + "/rendiciones");
    } else {
      obtenerRendicionLocal();
    }
  }, []);

  const validaEditable =
    usuario.TipoUsuario == 1
      ? !estadosEditablesUsr.includes(rendicion.STR_ESTADO)
      : usuario.TipoUsuario == 3
      ? !estadosEditablesCont.includes(rendicion.STR_ESTADO)
      : true;

  const validaEditableBtn =
    usuario.TipoUsuario == 1
      ? !estadosEditablesUsr.includes(rendicion.STR_ESTADO)
      : usuario.TipoUsuario == 3
      ? !estadosEditablesCont.includes(rendicion.STR_ESTADO)
      : usuario.TipoUsuario == 2
      ? !estadosEditablesAut.includes(rendicion.STR_ESTADO)
      : true;

  const downloadAndOpenPdf = async () => {
    setLoading(true);
    try {
      const host = import.meta.env.VITE_REACT_APP_BASE_URL;
      const tk = localStorage.getItem("tk_pw");
      const response = await fetch(
        `${host}reporte?numRendicion=${rendicion.STR_NRRENDICION}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tk}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
      saveAs(pdfBlob, `${rendicion.STR_NRRENDICION}.pdf`);
    } catch (error) {
      console.error("Error al obtener el PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <>
      <Toast ref={toast} />
      <div className="flex justify-content-between flex-wrap">
        <div className="flex">
          <div className="flex text-2xl align-items-center gap-2">
            <i
              className="pi pi-chevron-left cursor-pointer"
              onClick={() => {
                navigate(ruta +"/rendiciones");
              }}
            ></i>

            <div>Lista de Documentos - Rendición #{rendicion.ID}</div>
          </div>
          {(rendicion.STR_ESTADO_INFO.Id == 16) |
            (rendicion.STR_ESTADO_INFO.Id == 18) |
            (rendicion.STR_ESTADO_INFO.Id == 19) && (
            <div className="flex text-2xl p-2">
              <Button
                type="button"
                icon="pi pi-file-pdf"
                severity="warning"
                rounded
                onClick={downloadAndOpenPdf}
                data-pr-tooltip="PDF"
              />
            </div>
          )}
        </div>

        <div className="flex flex-row flex-wrap gap-2">
          <Button
            label="Agregar"
            icon="pi pi-plus"
            severity="success"
            onClick={() => {
              navigate(ruta + `/rendiciones/${id}/documentos/agregar`, {
                state: {
                  tipoRendicion: rendicion.SOLICITUDRD.STR_TIPORENDICION,
                  empleadoAsignado: rendicion.STR_EMPLDASIG,
                  idDetalle: rendicion.STR_SOLICITUD,
                  almacen: rendicion.STR_EMPLEADO_ASIGNADO.fax,
                  fechaSolicitud: rendicion.SOLICITUDRD.STR_FECHAINI,
                },
              });
            }}
            disabled={validaEditable}
          />
        </div>
      </div>
      <Divider />
      <DocsHeader
        nrendicon={rendicion.STR_NRRENDICION}
        nombre={rendicion.STR_EMPLEADO_ASIGNADO.Nombres}
        totalRendido={rendicion.STR_TOTALRENDIDO}
        moneda={rendicion.SOLICITUDRD.STR_MONEDA}
        estado={rendicion.STR_ESTADO_INFO.Nombre}
        totalSolicitado={rendicion.SOLICITUDRD.STR_TOTALSOLICITADO}
      />
    </>
  );

  const confirm1 = () => {
    confirmDialog({
      message: `¿Estás seguro de Enviar a aprobar la rendición con código #${rendicion.ID}?`,
      header: "Confirmación Rendición",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept,
      //reject,
    });
  };

  /*
  async function aceptarAprobacionLocal(
    idSoli,
    idUsr,
    area,
    estado,
    rendicionId,
    areas
  ) {
    setLoadingBtn(true);
    try {
      let response = await aceptarAprobRendicion(
        idSoli,
        idUsr,
        area,
        estado,
        rendicionId,
        areas
      );
      if (response.status < 300) {
        let body = response.data.Result[0];
        console.log(response.data);

        if (body.AprobacionFinalizada == 0) {
          showSuccess(`Se aprobó la rendición`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          navigate(ruta + "/rendiciones");
        } else {
          showSuccess(
            `Se migró a a SAP la rendición con número ${body.DocNum}`
          );
        }
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      setLoadingBtn(false);
    }
  }*/
  /*
  async function rechazarAprobacionLocal(
    idSoli,
    idUsr,
    area,
    estado,
    rendicionId,
    areas
  ) {
    setLoadingBtn(true);
    try {
      let response = await rechazarAprobRendicion(
        idSoli,
        idUsr,
        area,
        estado,
        rendicionId,
        areas
      );
      if (response.status == 200) {
        showInfo("Se rechazó la rendición");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones");
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      setLoadingBtn(false);
    }
  }
*/
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

  const confirmRechazo = () => {
    confirmDialog({
      message: `¿Estás seguro de rechazar la Rendición con código #${rendicion.ID}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptClassName: "p-button-danger",
      accept: () => rechazarAprobacionLocal(),
      acceptLabel: "Si",
      rejectLabel: "No",
      //reject,
    });
  };

  if (loading) {
    return (
      <div className="card flex justify-content-center">
        <Toast ref={toast} />
        <ProgressSpinner />
      </div>
    );
  }

  function ValidaEditable() {
    console.log(usuario.TipoUsuario, rendicion.STR_ESTADO_INFO.Id);
    if (
      usuario.TipoUsuario == 1 &&
      (rendicion.STR_ESTADO_INFO.Id == 9) | (rendicion.STR_ESTADO_INFO.Id == 8)
    )
      return false;
    else if (usuario.TipoUsuario == 3 && rendicion.STR_ESTADO_INFO.Id == 10)
      return false;
    return true;
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="card">
        <HeaderDoc header={header} />
        <Documentos
          header={header}
          loading={loading}
          documentos={rendicion.documentos}
          idRendicion={rendicion.ID}
          empAsignado={rendicion.STR_EMPLDASIG}
          idDetalle={rendicion.STR_SOLICITUD}
          rendicion={rendicion.SOLICITUDRD.STR_TIPORENDICION}
          almacen={rendicion.STR_EMPLEADO_ASIGNADO.fax}
          fechaSolicitud={rendicion.SOLICITUDRD.STR_FECHAINI}
          setRendicion={setRendicion}
          setLoading={setLoading}
          showSuccess={showSuccess}
          handleConsultSunat={handleConsultSunat}
          showError={showError}
          obtenerRendicionLocal={obtenerRendicionLocal}
          borrarDocumentoLocal={borrarDocumentoLocal}
          loadingBtn={loadingBtn}
          ValidaEditable={!ValidaEditable}
          editable={validaEditable}
        />
        <Divider />
      <div className="card flex flex-wrap  gap-3 mx-3">
          {usuario.TipoUsuario == 1 ? (
            <Button
              label={"Solicitar Aprobación"}
              size="large"
              onClick={(e) => {
                ValidacionEnvio();
              }}
              loading={loadingBtn}
              disabled={validaEditable}
            />
          ) : (
            <Button
              label={"Aprobar"}
              size="large"
              onClick={(e) => {
                confirmAceptacion();
              }}
              loading={loadingBtn}
              disabled={validaEditableBtn}
            />
          )}

          {usuario.TipoUsuario == 1 ? (
            <Button
              label={"Cancelar"}
              severity="secondary"
              size="large"
              onClick={(e) => {
                navigate(ruta + "/rendiciones");
              }}
              loading={loadingBtn}
            />
          ) : (
            <Button
              label={"Rechazar Rendición"}
              severity="danger"
              size="large"
              onClick={(e) => {
                confirmRechazo();
              }}
              loading={loadingBtn}
              disabled={validaEditableBtn}
            />
          )}

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
            disabled={validaEditable}
          />
          {/* </Button> */}
          <Button
            label={"Descargar Plantilla"}
            size="large"
            severity="warning"
            onClick={descargarPlantilla}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
