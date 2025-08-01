import React, { useContext, useEffect, useRef, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { saveAs } from "file-saver";
import {
  aceptarSolicitudSR,
  actualizarSolicitud,
  actualizarSolicitudDet,
  consultarPresupuesto,
  crearSolicitud,
  crearSolicitudDet,
  createSolicitud,
  enviarSolicitudAproba,
  generaPDFSolicitudD,
  obtenerEmpleados,
  obtenerRutas,
  obtenerSolicitud,
  obtenerSolicitudR,
  obtenerTipoViaticos,
  obtieneAdjuntos,
  obtieneAprobadoresSL,
  rechazarSolicitudSR,
  uploadAdjunto,
  validacionSolicitud,
} from "../../../../services/axios.service";
import { AppContext } from "../../../../App";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import ReactDOM from "react-dom";
import { Toast } from "primereact/toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Axios } from "axios";
import { jsPDF } from "jspdf";
import Aprobaciones from "./subcomponentes/Aprobaciones";
import SolicitudNuevaSL from "./subcomponentes/SolicitudNuevaSL";

function FormularioSL() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabViewRef = useRef(null);
  const estadosEditables = [1, 5];
  const location = useLocation();
  const esModoRegistrar = location.pathname.includes("agregar");
  const create = location.state && location.state.create;
  const { id } = useParams();
  const toast = useRef(null);
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const [nOrden, setNorden] = useState(0);
  const [solicitando, setSolicitando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSkeleton, setLoadingSkeleton] = useState(false);
  const [viaticos, setViaticos] = useState(null);
  const [comments, setComments] = useState("");

  //const vencimientoRef = useRef(null);
  // Para pestraña de aprobaciones
  const [aprobadores, setAprobadores] = useState([]);
  // Valor inicial de la Solicitud RD
  const [solicitudRD, setSolicitudRD] = useState({
    ID: null,
    STR_EMPLDREGI: {
      ...usuario,
    },
    STR_EMPLDASIG: {
      ...usuario,
    },
    STR_NRSOLICITUD: null,
    STR_NRRENDICION: null,
    STR_ESTADO_INFO: "",
    STR_ESTADO: 1,
    STR_FECHAREGIS: obtieneFecha(new Date()),
    STR_MONEDA: {
      id: "SOL",
      name: "SOL",
    },
    STR_TIPORENDICION: {
      id: "2",
      name: "EAR",
    },
    // STR_MOTIVORENDICION: {
    //   id: "VIA",
    //   name: "Viaticos",
    // },
    STR_MOTIVORENDICION: null,
    STR_TOTALSOLICITADO: 0.0,
    STR_MOTIVOMIGR: null,
    STR_AREA: usuario.branch,
    STR_DOCENTRY: null,
    CREATE: "PWB",
    STR_COMENTARIO: null,
  });

  async function solicitarAprobacion() {
    setLoading(true);

    const camposRequeridos = [
      "STR_TIPORENDICION",
      "STR_MONEDA",
      "STR_TOTALSOLICITADO",
      "STR_MOTIVORENDICION",
      "STR_FECHA_EVENTO_INICIAL",
      "STR_FECHA_EVENTO_FINAL",
      "STR_PROYECTO",
      "STR_CENTRO_COSTO",
      "STR_CCI",
      "STR_TIPO_IDENTIFICACION",
      "STR_COMENTARIO"
    ];

    const faltantes = camposRequeridos.filter((campo) => {
      const valor = campo.split('.').reduce((obj, key) => obj?.[key], solicitudRD);
      return !valor || valor === "" || (typeof valor === "number" && valor <= 0);
    });

    if (faltantes.length > 0) {
      showError("Por favor, complete todos los campos obligatorios marcados en rojo.");
      setLoading(false);
      return;
    }

    try {
      let ID;

      // GUARDAR BORRADOR Y EDITAR
      if (!esModoRegistrar) {
        const updateResponse = await actualizarSolicitud(solicitudRD);
        if (updateResponse.status >= 300) {
          showError("Error al actualizar la solicitud antes de solicitar aprobación.");
          setLoading(false);
          return;
        }
        showSuccess("Se ha actualizado la solicitud exitosamente.");
        ID = solicitudRD.ID;
      } else {
        // Crear la solicitud si está en modo registrar
        const createResponse = await createSolicitud(solicitudRD);
        if (createResponse.status >= 300) {
          showError("Error al crear la solicitud.");
          setLoading(false);
          return;
        }
        const body = createResponse.data.Result[0];
        ID = body.ID;
        showSuccess("Se ha creado la solicitud exitosamente.");
      }

      // // Guardar Borrador
      // if (esModoRegistrar) {
      //   var res = await createSolicitud(solicitudRD);
      //   if (res.status < 300) {
      //     let body = res.data.Result[0];
      //     showSuccess(`Se ha creado la solicitud exitosamente`);
      //     ID = body.ID;
      //   } else {
      //     showError("Se tuvo un error al crear la solicitud");
      //   }
      // } else {
      //   ID = solicitudRD.ID;
      // }

      let response = await enviarSolicitudAproba(ID, {
        usuarioId: usuario.sapID,
        tipord: solicitudRD.STR_MOTIVORENDICION.id,
        area: solicitudRD.STR_AREA,
        monto: solicitudRD.STR_TOTALSOLICITADO,
        estado: 1,
        // p_Borradores: obtenerDetallePresupuesto(),
      });

      if (response.status == 200) {
        showSuccess(`Se ha enviado la solicitud hacia los aprobadores`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/solicitudes");
      } else {
      }
    } catch (error) {
      showError(error.Message);
    } finally {
      setLoading(false);
    }
  }

  const showSuccess = (mensaje) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: mensaje,
      life: 3000,
    });
  };

  const showError = (mensaje) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 3000,
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

  const registrarSR = async () => {
    setLoading(true);

    try {
      if (id == null) {
        var response = await createSolicitud(solicitudRD);

        if (response.status < 300) {
          let body = response.data.Result[0];
          showSuccess(`Se ha creado la solicitud exitosamente`);
          navigate(ruta + "/solicitudes");
          setLoading(false);
          return body.ID;
        } else {
          showError("Se tuvo un error al crear la solicitud");
        }

      } else {
        var response = await actualizarSolicitud(solicitudRD);
        if (response.status < 300) {

          showSuccess(`Se ha actualizado la solicitud exitosamente`);
          navigate(ruta + "/solicitudes");
        } else {
          showError("Se tuvo un error al actualizar la solicitud");
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const confirm1 = () => {
    confirmDialog({
      message: `¿Estás seguro de enviar a aprobar la solicitud de rendición?`,
      header: "Confirmación solicitud",
      icon: "pi pi-check",
      defaultFocus: "accept",
      accept,
      acceptLabel: "Si",
      rejectLabel: "No",
      //reject,
    });
  };

  const accept = () => {
    solicitarAprobacion();
  };

  async function obtieneAprobadoresLocal(id) {
    try {
      let response = await obtieneAprobadoresSL(id);
      if (response.status < 300) {
        let body = response.data.Result;
        let ord = 0;
        let aprobadores1 = body.map((e) => {
          ord += 1;
          e.aprobadores = e.aprobadores.map((r) => {
            return { ...r, orden: ord };
          });
          return e.aprobadores;
        });
        let _aprobadores = [].concat(...aprobadores1);

        // Description: 0 no es aprobador  / 1 ya aprobó
        setAprobadores(_aprobadores);

        // if (body.aprobadores.lenght > 0) {
        //   body.aprobadores.forEach((dat) => {
        //     setAprobadores(
        //       { ...dat, aprobado: valorNuevo },
        //       dat.id == body.aprobadorId ? true : false
        //     );
        //   });
        // }
      }
    } catch (error) {
    }
  }

  const confirmAceptacion = () => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Solicitud de Aprobación con código #${solicitudRD.ID}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: aceptacionLocal,
      //reject,
    });
  };

  const ConfirmDialogWithComments = ({ message, header, icon, accept }) => {
    const handleAccept = () => {
      // Pasa los comentarios al manejador de aceptación
      accept(comments);
    };

    return (
      <div>
        <div>{message}</div>
        <InputTextarea
          rows={5}
          cols={30}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Agrega tus comentarios aquí"
        />
        <div className="p-d-flex p-jc-end">
          <Button label="Aceptar" icon="pi pi-check" onClick={handleAccept} />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={reject}
            className="p-ml-2"
          />
        </div>
      </div>
    );
  };

  const confirmRechazo = () => {
    confirmDialog({
      message: `¿Estás seguro de rechazar la Solicitud de Aprobación con código #${solicitudRD.ID}?`,
      header: "Rechazar solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      accept: (comments) => rechazoLocal(comments),
      acceptLabel: "Si",
      rejectLabel: "No",
      //reject,
      content: <ConfirmDialogWithComments />,
    });
  };

  async function rechazoLocal(comentarios = "") {
    setLoading(true);
    try {
      let response = await rechazarSolicitudSR(
        solicitudRD.ID,
        usuario.sapID,
        comentarios,
        usuario.branch,
        solicitudRD.STR_ESTADO
      );
      if (response.status == 200) {
        showInfo("Se rechazó la solicitud");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/solicitudes");
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      showError(error.Message);
    } finally {
      setLoading(false);
    }
  }

  const downloadAndOpenPdf = async (
    id = solicitudRD.estado < 6 ? solicitudRD.id : solicitudRD.docEntry,
    numrendicion = solicitudRD.nrRendicion
  ) => {
    setLoadingSkeleton(true);
    try {
      let docentry =
        solicitudRD.estado < 6 ? solicitudRD.id : solicitudRD.docEntry;
      const host = import.meta.env.VITE_REACT_APP_BASE_URL;
      const tk = localStorage.getItem("tk_pw");
      const response = await fetch(
        `${host}reporte?id=${docentry}&numRendicion=${numrendicion}&tipo=${solicitudRD.tipoear.id}`,
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
      saveAs(pdfBlob, `${solicitudRD.nrRendicion}.pdf`);

      if (solicitudRD.ordenViaje == true) {
        const response = await fetch(
          `${host}reporte?id=${docentry}&numRendicion=${numrendicion}&tipo=ORD`,
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
        saveAs(pdfBlob, `${solicitudRD.nrRendicion}.pdf`);
      }
    } catch (error) {
      console.error("Error al obtener el PDF:", error);
    } finally {
      setLoadingSkeleton(false);
    }
  };

  async function aceptacionLocal() {
    setLoadingSkeleton(true);
    try {
      let response = await aceptarSolicitudSR(
        solicitudRD.ID,
        usuario.sapID,
        usuario.branch,
        solicitudRD.STR_ESTADO
      );
      if (response.status == 200) {
        if (response.data.Result[0].AprobacionFinalizada ?? 0 == 1) {
          showSuccess(
            `Se acepto la solicitud, se logró realizar la migración a SAP con el número ${response.data.Result[0].DocNum}`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));  // Retraso de 1 segundo
          showSuccess('Se envió a su correo la aprobación de dicha solicitud');
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          showInfo(
            "Se aceptó la primera aprobación, queda pendiente de la segunda"
          );

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } else {
        showError(
          "Se presentó error al realizar la migración: ",
          response.data
        );
      }
    } catch (error) {
      showError(error.response?.data.Message);
    } finally {
      setLoadingSkeleton(false);
      return navigate(ruta + "/solicitudes");
    }
  }

  function obtieneFecha(fecha) {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  function getFechaLargo(fechaCorta) {
    if (!fechaCorta || typeof fechaCorta !== "string") {
      console.error("Fecha inválida:", fechaCorta);
      return null; // O maneja el caso según la lógica del negocio
    }

    const fechaArray = fechaCorta.split("/"); // Divide la cadena en un array [día, mes, año]

    if (fechaArray.length !== 3 || isNaN(fechaArray[0]) || isNaN(fechaArray[1]) || isNaN(fechaArray[2])) {
      console.error("Formato de fecha inválido:", fechaCorta);
      return null; // O maneja el caso según la lógica del negocio
    }

    const fechaJs = new Date(
      parseInt(fechaArray[2], 10), // Año
      parseInt(fechaArray[1], 10) - 1, // Mes (0 indexado)
      parseInt(fechaArray[0], 10) // Día
    );

    if (isNaN(fechaJs.getTime())) {
      console.error("Fecha no válida:", fechaCorta);
      return null; // O maneja el caso según la lógica del negocio
    }

    return fechaJs;
  }

  async function obtenerSolicitudLocal() {
    if (id != null) {
      setLoadingSkeleton(true);
      var response = await obtenerSolicitud(id);

      if (response.status < 300) {
        let body = response.data.Result[0];

        body.STR_FECHA_EVENTO_INICIAL = getFechaLargo(body.STR_FECHA_EVENTO_INICIAL)
        body.STR_FECHA_EVENTO_FINAL = getFechaLargo(body.STR_FECHA_EVENTO_FINAL)

        setSolicitudRD(body);

        if (body.STR_ESTADO > 1) {
          obtieneAprobadoresLocal(body.ID);
        }
      }
      setLoadingSkeleton(false);
    }
  }

  useEffect(() => {
    obtenerSolicitudLocal();
  }, []);

  if (loadingSkeleton) {
    return (
      <div className="card flex justify-content-center">
        <Toast ref={toast} />
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex  flex-wrap gap-2">
        <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              navigate(ruta + "/solicitudes");
            }}
          ></i>
          <div>
            Solicitud de Rendición {!esModoRegistrar && `- #${solicitudRD.ID}`}{" "}
          </div>
        </div>

        {!esModoRegistrar && (
          <div className="flex text-2xl align-items-center gap-2 p-2">
          </div>
        )}
      </div>
      <Divider />
      <TabView
        ref={tabViewRef}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Formulario">
          <SolicitudNuevaSL
            solicitudRD={solicitudRD}
            setSolicitudRD={setSolicitudRD}
            estadosEditables={estadosEditables}
          />
        </TabPanel>
        {solicitudRD.STR_ESTADO != "1" && (
          <TabPanel header="Aprobadores">
            <Aprobaciones
              solicitudRD={solicitudRD}
              aprobadores={aprobadores}
            />
          </TabPanel>
        )}
      </TabView>
      <div className="card flex flex-wrap  gap-3 mx-3">
        {usuario.rol.id == "1" ? (
          <Button
            label={`${id != null ? "Actualizar" : "Guardar"} Borrador`}
            severity="info"
            size="large"
            style={{ backgroundColor: "black", borderColor: "black" }}
            onClick={(e) => {
              registrarSR();
            }}
            loading={loading}
            disabled={!estadosEditables.includes(solicitudRD.STR_ESTADO)}
          />
        ) : (
          <Button
            label={`Aprobar Solicitud`}
            severity="success"
            size="large"
            onClick={(e) => {
              //setSolicitando(false);
              confirmAceptacion();
            }}
            loading={loading}
            disabled={
              // Deshabilitar para rol 3 si está en estado 1 o 2
              (usuario.rol.id === "3" && (solicitudRD.STR_ESTADO === 1 || solicitudRD.STR_ESTADO === 2))
              ||
              // Deshabilitar para rol 2 si está en estado 3
              (usuario.rol.id === "2" && solicitudRD.STR_ESTADO === 3)
              ||
              // Deshabilitar si el estado es mayor a 3 o igual a 1
              (solicitudRD.STR_ESTADO > 3 || solicitudRD.STR_ESTADO === 1)
            }
          />
        )}
        {usuario.rol.id == "1" ? (
          <Button
            label="Solicitar Aprobación"
            size="large"
            onClick={confirm1}
            disabled={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) | loading
            }
          />
        ) : (
          <Button
            label="Rechazar Solicitud"
            severity="danger"
            size="large"
            onClick={confirmRechazo}
            disabled={
              // Deshabilitar para rol 3 si está en estado 1 o 2
              (usuario.rol.id === "3" && (solicitudRD.STR_ESTADO === 1 || solicitudRD.STR_ESTADO === 2))
              ||
              // Deshabilitar para rol 2 si está en estado 3
              (usuario.rol.id === "2" && solicitudRD.STR_ESTADO === 3)
              ||
              // Deshabilitar si el estado es mayor a 3 o igual a 1
              (solicitudRD.STR_ESTADO > 3 || solicitudRD.STR_ESTADO === 1)
            }
            loading={loading}
          />
        )}
        <Button
          label="Cancelar"
          severity="secondary"
          size="large"
          onClick={() => navigate(ruta + "/solicitudes")}
        />
      </div>
    </div>
  );
}

export default FormularioSL;
