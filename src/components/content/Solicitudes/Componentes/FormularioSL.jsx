import React, { useContext, useEffect, useRef, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { saveAs } from "file-saver";
import { Dropdown } from "primereact/dropdown";
import {
  aceptarSolicitudSR,
  actualizarSolicitud,
  actualizarSolicitudDet,
  consultarPresupuesto,
  crearSolicitud,
  crearSolicitudDet,
  enviarSolicitudAproba,
  generaPDFSolicitudD,
  obtenerEmpleados,
  obtenerRutas,
  obtenerSolicitudR,
  obtenerTipoViaticos,
  obtieneAdjuntos,
  obtieneAprobadoresSL,
  rechazarSolicitudSR,
  uploadAdjunto,
  validacionSolicitud,
} from "../../../../services/axios.service";
import { Checkbox } from "primereact/checkbox";
import { AppContext } from "../../../../App";
import Direccion from "./subcomponentes/Direccion";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import GeneralSL from "./subcomponentes/GeneralSL";
import DetalleSL from "./subcomponentes/DetalleSL";
import AnexoSL from "./subcomponentes/AnexoSL";
import { FileUpload } from "primereact/fileupload";
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
  //const vencimientoRef = useRef(null);
  // Para pestraña de aprobaciones
  const [aprobadores, setAprobadores] = useState([]);
  // Valor inicial de la Solicitud RD
  const [solicitudRD, setSolicitudRD] = useState({
    empldRegi: null,
    nrSolicitud: null,
    nrRendicion: null,
    estado: 1,
    checkTrcr: false,
    ordenViaje: false,
    empldAsig: { id: usuario.empId, name: usuario.Nombres },
    fechaRegis: new Date(),
    ubigeo: null,
    ruta: { id: null, name: null },
    fechaVenc: null,
    fechaRango: null,
    comentarios: null,
    moneda: { name: "SOL" },
    tipoear: null,
    rutaAnexo: [],
    idAprobacion: null,
    totalSolicitado: null,
    motivoMigr: null,
    docEntry: null,
    STR_NOMBRES: usuario.Nombres,
  });
  const [detalles, setDetalles] = useState([]);
  const [adjuntos, setAdjuntos] = useState([]);
  const [pdfData, setPdfData] = useState(null);
  // Contiene Files
  const fileUploadRef = useRef(null);

  function changeFileTitle() {
    try {
      const fileUploadNode = ReactDOM.findDOMNode(
        fileUploadRef.current.props.emptyTemplate._owner.child.child.child.child
          .stateNode
      );
      //console.log(fileUploadNode);
      if (fileUploadNode) {
        const fileBadgeSpans = fileUploadNode.querySelectorAll(
          ".p-fileupload-file-badge"
        );
        //  console.log(fileBadgeSpans);
        fileBadgeSpans.forEach((fileBadgeSpan) => {
          if (solicitudRD.rutaAnexo.length > 0) {
            //console.log("cambiando estado");
            fileBadgeSpan.innerText = "Cargado";
            fileBadgeSpan.classList.remove("p-badge-warning");
            fileBadgeSpan.classList.add("p-badge-success");
          }
        });
      }
    } catch (error) {
      //  console.log(error);
    }
  }

  function obtenerDetallePresupuesto() {
    const listaDetalles = Object.values(
      detalles.reduce((acumulador, detalle) => {
        const { ceco, posFinanciera, precioTotal } = detalle;
        const clave = `${JSON.stringify(posFinanciera)}`;

        if (acumulador[clave]) {
          // Si ya existe, sumar el STR_TOTAL
          acumulador[clave].STR_TOTAL += precioTotal;
        } else {
          // Si no existe, crear una nueva entrada
          acumulador[clave] = {
            STR_POSFIN: posFinanciera.name,
            STR_TOTAL: precioTotal,
            STR_PENDIENTE: "1",
            STR_CENTCOST: ceco,
            STR_FECHAREGIS: solicitudRD.fechaRegis
              .toLocaleDateString("es-PE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .reverse()
              .join("-"),
          };
        }

        return acumulador;
      }, [])
    );
    return listaDetalles;
  }

  async function solicitarAprobacion() {
    setLoadingSkeleton(true);
    try {
      // const resultado = detalles.reduce((acc, detalle) => {
      //   const key =
      //     "${detalle.centCostos[0].name}_${detalle.posFinanciera.name}";

      //   if (!acc[key]) {
      //     acc[key] = {
      //       STR_TOTAL: detalle.STR_TOTAL,
      //       STR_CENTCOST: detalle.centCostos[0].name,
      //       STR_POSFIN: detalle.posFinanciera.name,
      //     };
      //   } else {
      //     // Si la clave ya existe, suma los valores actuales a los existentes
      //     acc[key].STR_TOTAL += detalle.STR_TOTAL;
      //   }
      //   return acc;
      // }, {});

      // const resultadoFinal = Object.values(resultado);

      //let p_Borradores = detalles.reduce();

      // Guardar Borrador

      // Generar Registro de la solicitud

      let id;
      if (solicitudRD.id == null) {
        // Si solicitudRD.id es nulo, llama a registrarSR y obtén el id
        const responseRegistrarSR = await registraRDSolo();
        //console.log(responseRegistrarSR);
        id = responseRegistrarSR;

        if (id == null) {
          showError("Se produjo un error al registrar solicitud");
          console.log("Se produjo un error al registrar solicitud");
          setLoading(false);
          return;
        }

        showSuccess(`Se creó la solicitud con código: ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        id = solicitudRD.id;
      }

      // Guardar Borrador
      if (!esModoRegistrar) {
        await registrarSR();
      }

      let presupuestoSuficiente = true;

      for (let i = 0; i < detalles.length; i++) {
        if (detalles[i].presupuesto < 1) {
          presupuestoSuficiente = false;
        }
      }
      if (presupuestoSuficiente == false) {
        showError("No se tiene presupuesto suficiente");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        let responsValida = await validacionSolicitud(id);

        if (responsValida.status != 200) {
          showError(responsValida.data.Message);
          console.log(responsValida.data.Message);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          navigate(ruta + "/solicitudes");
        } else {
          let p_Borradores = [];

          let response = await enviarSolicitudAproba(id, {
            usuarioId: usuario.empId,
            tipord: solicitudRD.tipoear.id,
            area: usuario.SubGerencia,
            monto: detalles.reduce(
              (acumulador, detalle) => acumulador + detalle.precioTotal,
              0
            ),
            estado: 1,
            p_Borradores: obtenerDetallePresupuesto(),
          });

          if (response.status == 200) {
            showSuccess(
              `Se envió la solicitud a los aprobadores con id: ${id}`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            navigate(ruta + "/solicitudes");
          } else {
            showError(response.data.Message);
            console.log(response.data.Message);
          }
        }
      }
    } catch (error) {
      showError(error.Message);
      console.log(error);
    } finally {
      setLoadingSkeleton(false);
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

  function obtieneJsonAregistrar() {
    //console.log(solicitudRD);
    let body = {
      STR_EMPLDREGI: usuario.empId,
      STR_NRSOLICITUD: solicitudRD.nrSolicitud,
      STR_NRRENDICION: solicitudRD.nrRendicion,
      STR_ESTADO: solicitudRD.estado,
      STR_EMPLDASIG: solicitudRD.empldAsig.id,
      STR_FECHAREGIS: solicitudRD.fechaRegis
        .toLocaleDateString("es-PE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-"),
      STR_UBIGEO: solicitudRD.ubigeo != null ? solicitudRD.ubigeo.Ubigeo : null,
      STR_RUTA: solicitudRD.ruta != null ? solicitudRD.ruta.id : null,
      STR_RUTAANEXO: Array.isArray(solicitudRD.rutaAnexo)
        ? solicitudRD.rutaAnexo.join(", ")
        : solicitudRD.rutaAnexo, // Si hay mas de 1 los guarda concatenado divido por coma (,)
      STR_MOTIVO: solicitudRD.comentarios,
      STR_FECHAINI:
        solicitudRD.fechaRango != null
          ? solicitudRD.fechaRango[0].toISOString().split("T")[0]
          : null,
      STR_FECHAFIN:
        solicitudRD.fechaRango != null
          ? solicitudRD.fechaRango[1].toISOString().split("T")[0]
          : null,
      STR_FECHAVENC:
        solicitudRD.fechaVenc != null
          ? solicitudRD.fechaVenc.toISOString().split("T")[0]
          : null,
      STR_MONEDA: solicitudRD.moneda.name,
      STR_TIPORENDICION:
        solicitudRD.tipoear != null ? solicitudRD.tipoear.id : null,
      STR_IDAPROBACION: solicitudRD.idAprobacion,
      STR_TOTALSOLICITADO: /*solicitudRD.totalSolicitado*/ detalles.reduce(
        (acumulador, detalle) => acumulador + detalle.precioTotal,
        0
      ),
      STR_MOTIVOMIGR: solicitudRD.motivoMigr,
      STR_DOCENTRY: solicitudRD.docEntry,
      STR_ORDENVIAJE: solicitudRD.ordenViaje == true ? "Y" : "N",
      STR_AREA: `${usuario.SubGerencia}`,
      STR_NOMBRES: solicitudRD.STR_NOMBRES,
    };
    //console.log(body);
    return body;
  }

  const registraRDSolo = async () => {
    setLoading(true);
    setSolicitando(true);
    let body = obtieneJsonAregistrar();
    let id = null;
    try {
      var response = await crearSolicitud(body);

      if (response.status == 200) {
        //console.log(response);
        id = response.data.Result[0].Id;

        for (let i = 0; i < detalles.length; i++) {
          const e = detalles[i];
          await crearSolicitudDet({ ...e, SR_ID: id });
        }

        // Retorna el id después de completar todas las operaciones
        return id;
      } else {
        showError(response.data.Message);
        console.log(response.data.Message);
      }
    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
    } finally {
      //setLoading(false);
      setSolicitando(false);
      //obtenerSolicitudLocal();
    }
  };

  async function validaUpload(id) {
    console.log("validaUpload", create);
    if (!esModoRegistrar && create == "PWB") {
      let response = await obtieneAdjuntos(id);
      if (response.status < 300) {
        let files = response.data.Result;

        const newList = response.data.Result.map((e) => {
          if (e.data != null) {
            const base64Data = e.data;
            const binaryData = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(binaryData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }

            // Crear un objeto Blob desde el array buffer
            const blob = new Blob([arrayBuffer], {
              type: e.type,
            });
            const blobUrl = URL.createObjectURL(blob);
            //console.log(blobUrl);
            e.objectURL = blobUrl;
            /*
            const blob = new Blob([blobData]);
            const blobUrl = URL.createObjectURL(blob);
            e.objectURL = blobUrl;
            console.log(blobUrl);
          */
          }
          return e;
        });

        setAdjuntos(newList);
      } else {
        console.log("No tiene adjuntos");
      }
    }
  }

  const registrarSR = async () => {
    setLoading(true);

    let body = obtieneJsonAregistrar();

    if (solicitudRD.id == null) {
      try {
        console.log(body);
        var response = await crearSolicitud(body);

        if (response.status == 200) {
          console.log(response);
          let id = response.data.Result[0].Id;

          if (detalles.length < 1) {
            navigate(ruta + "/solicitudes");
          }

          for (let i = 0; i < detalles.length; i++) {
            const e = detalles[i];
            await crearSolicitudDet({ ...e, SR_ID: id });
          }

          navigate(ruta + "/solicitudes");
          //navigate("/solicitudes");
          showSuccess("Registrado exitosamente");
        } else {
          showError(response.data.Message);
          console.log(response.data.Message);
        }
      } catch (error) {
        showError(error.Message);
        console.log(error.Message);
      } finally {
        setLoading(false);
      }
    } else {
      await actualizarSolicitud(solicitudRD.id, body)
        .then(async (response) => {
          let _detalles = detalles;

          for (let i = 0; i < _detalles.length; i++) {
            if (_detalles[i].ID !== undefined) {
              await actualizarSolicitudDet(_detalles[i].ID, _detalles[i]);
            } else {
              let response = await crearSolicitudDet({
                ..._detalles[i],
                SR_ID: solicitudRD.id,
              });
              _detalles[i].ID = response.data.Result[0].id;
            }
          }

          setDetalles(_detalles);
          showSuccess("Actualizado exitosamente");
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err.message);
          showError("Se tuvo un erro al actualizar la Solicitud");
        })
        .finally(() => {
          console.log("Se terminó de actualizar la solicitud");
        });
    }
    return;
  };

  function getFechaLargo(fechaCorta) {
    const fechaArray = fechaCorta.split("/");

    const fechaAnio = fechaArray[2];

    const fechaJs = new Date(
      fechaAnio.substring(0, 4),
      fechaArray[1] - 1,
      fechaArray[0]
    );
    // console.log("getFechaLargo");
    // console.log(fechaJs);

    return new Date(`${fechaJs}`);
    // const fechaArray = fechaCorta.split("/");

    // // Asegúrate de obtener el año completo
    // const añoCompleto = fechaArray[2].split(" ")[0];

    // const fechaJs = new Date(
    //   parseInt(añoCompleto, 10),
    //   parseInt(fechaArray[1], 10) - 1,
    //   parseInt(fechaArray[0], 10)
    // );

    // console.log(fechaJs);

    // return fechaJs;
  }

  async function obtenerSolicitudLocal() {
    // setLoadingSkeleton(true);
    if (!esModoRegistrar) {
      setLoadingSkeleton(true);
      await obtenerSolicitudR(id, create)
        .then((response) => {
          try {
            let solicitud = response.data.Result[0];
            let validaTercero =
              solicitud.STR_EMPLDREGI != solicitud.STR_EMPLDASIG;

            //console.log(solicitud);
            setSolicitudRD({
              id: solicitud.ID,
              checkTrcr: validaTercero,
              nrRendicion: solicitud.STR_NRRENDICION,
              nrSolicitud: solicitud.STR_NRSOLICITUD,
              estado: solicitud.STR_ESTADO,
              empldAsig: (solicitud.STR_EMPLEADO_ASIGNADO = null
                ? null
                : {
                    id: solicitud.STR_EMPLEADO_ASIGNADO.empID,
                    name: solicitud.STR_EMPLEADO_ASIGNADO.Nombres.toUpperCase(),
                  }),
              ubigeo: solicitud.STR_DIRECCION,
              ruta:
                solicitud.STR_RUTA_INFO == null
                  ? null
                  : {
                      id: solicitud.STR_RUTA_INFO.Nombre,
                      name: solicitud.STR_RUTA_INFO.Descripcion,
                    },
              rutaAnexo: solicitud.STR_RUTAANEXO,
              comentarios: solicitud.STR_MOTIVO,
              fechaRegis: getFechaLargo(solicitud.STR_FECHAREGIS),
              fechaRango:
                (solicitud.STR_FECHAINI == "") |
                (solicitud.STR_FECHAINI == null)
                  ? null
                  : [
                      getFechaLargo(solicitud.STR_FECHAINI),
                      getFechaLargo(solicitud.STR_FECHAFIN),
                    ],
              fechaVenc:
                solicitud.STR_FECHAVENC == ""
                  ? null
                  : getFechaLargo(solicitud.STR_FECHAVENC),
              moneda: {
                name: solicitud.STR_MONEDA == "" ? "SOL" : solicitud.STR_MONEDA,
              },
              tipoear:
                solicitud.STR_TIPORENDICION_INFO == null
                  ? null
                  : {
                      id: solicitud.STR_TIPORENDICION_INFO.Nombre,
                      name: solicitud.STR_TIPORENDICION_INFO.Descripcion,
                    },
              idAprobacion: solicitud.STR_IDAPROBACION,
              totalSolicitado: solicitud.STR_TOTALSOLICITADO,
              docEntry: solicitud.STR_DOCENTRY,
              ordenViaje: solicitud.STR_ORDENVIAJE == "Y" ? true : false,
            });
            //console.log(solicitud.SOLICITUD_DET);

            let lista = solicitud.SOLICITUD_DET;
            if (lista.length > 0) {
              lista.forEach(async (elemento) => {
                /*elemento.articulo = {
                  id: elemento.articulo.id,
                  name: elemento.articulo.name,
                  posFinanciera: elemento.articulo.posFinanciera,
                };
                */
                // Solo para los estados

                let response = await consultarPresupuesto(
                  //elemento.centCostos[0].name,
                  elemento.ceco,
                  elemento.posFinanciera.id,
                  new Date().getFullYear(),
                  solicitud.STR_ESTADO == 1 ? -1 * elemento.precioTotal : 0
                );

                elemento.presupuesto = response.data.Result[0].name;
              });
              //  console.log(lista);
              setDetalles(lista);
            }
            validaUpload(solicitud.ID);
            if (solicitud.STR_ESTADO > 1) {
              obtieneAprobadoresLocal(solicitud.ID);
            }
          } catch (error) {
            console.log(error);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          //console.log("Termino de obtener Solicitudes");
          setLoadingSkeleton(false);
        });
    }
  }

  const confirm1 = () => {
    //console.log("fonr");
    confirmDialog({
      message: `¿Estás seguro de Enviar a aprobar la solicitud de rendición?`,
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

  function completeSolicitudDetalle() {
    if (detalles.length > 0) {
      detalles.map((e) => {});
    }
  }

  async function obtieneAprobadoresLocal(id) {
    try {
      //console.log("obtieneAprobadoresLocal");
      let response = await obtieneAprobadoresSL(id);
      //console.log(response);
      if (response.status < 300) {
        let body = response.data.Result;
        //console.log(body);
        let ord = 0;
        let aprobadores1 = body.map((e) => {
          ord += 1;
          e.aprobadores = e.aprobadores.map((r) => {
            return { ...r, orden: ord };
          });
          return e.aprobadores;
        });
        let _aprobadores = [].concat(...aprobadores1);
        //console.log(_aprobadores);
        //console.log(aprobadores);

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
      console.log(error);
    }
  }

  const confirmAceptacion = () => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Solicitud de Aprobación con código #${solicitudRD.id}?`,
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
    const [comments, setComments] = useState("");

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
      message: `¿Estás seguro de rechazar la Solicitud de Aprobación con código #${solicitudRD.id}?`,
      header: "Confirmación solicitud",
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
        solicitudRD.id,
        usuario.empId,
        comentarios,
        usuario.SubGerencia
      );
      //console.log(response);
      if (response.status == 200) {
        showInfo("Se rechazó la solicitud");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/solicitudes");
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      showError(error.Message);
      console.log(error);
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
        solicitudRD.id,
        usuario.empId,
        usuario.SubGerencia
      );
      if (response.status == 200) {
        //console.log(response.data.Result[0].AprobacionFinalizada);
        if (response.data.Result[0].AprobacionFinalizada ?? 0 == 1) {
          showSuccess(
            `Se acepto la solicitud, se logró realizar la migración a SAP con el número ${response.data.Result[0].DocNum}`
          );

          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          showInfo(
            "Se aceptó la primera aprobación, quedá pendiente de la segunda"
          );

          await new Promise((resolve) => setTimeout(resolve, 3000));

          //console.log("fsafs");
        }
      } else {
        showError(
          "Se presentó error al realizar la migración: ",
          response.data
        );
        console.log(response.data);
      }
    } catch (error) {
      showError(error.response?.data.Message);
      console.log(error);
    } finally {
      setLoadingSkeleton(false);
      return navigate(ruta + "/solicitudes");
    }
  }

  useEffect(() => {
    obtenerSolicitudLocal();

    const handleKeyDown = (event) => {
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      if (isCtrlPressed) {
        switch (event.key) {
          case "ArrowLeft":
            setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
            break;
          case "ArrowRight":
            setActiveIndex((prevIndex) =>
              Math.min(
                tabViewRef.current.props.children.filter((c) => c != false)
                  .length - 1,
                prevIndex + 1
              )
            );
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function obtieneViaticos() {
    await obtenerTipoViaticos()
      .then((response) => {
        const viaticos = response.data.Result.map((e) => ({
          id: e.Nombre,
          name: e.Descripcion,
        }));

        setViaticos(viaticos);
        const nuevaFechaVencimiento = new Date();
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 10);
        // Por defecto escoje el tipo VIATICO
        setSolicitudRD((prevSolicitud) => ({
          ...prevSolicitud,
          tipoear: {
            id: response.data.Result[0].Nombre,
            name: response.data.Result[0].Descripcion,
          },
          fechaVenc: nuevaFechaVencimiento,
        }));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Se terminó de obtener los tipos de viaticos");
      });
  }

  useEffect(() => {
    if (detalles.length > 0) {
      console.log("validaDetallesPresupuestar");
      //validaDetallesPresupuestar();
    }
  }, [detalles]);

  async function validaDetallesPresupuestar() {
    let _detalles = detalles;
    console.log(_detalles);
    try {
      const updatedDetalles = await Promise.all(
        detalles.map(async (detalle) => {
          const response = await consultarPresupuesto(
            detalle.centCostos[0].name,
            detalle.posFinanciera.id,
            new Date().getFullYear(),
            -1 * detalle.precioTotal
          );

          let updatedPresupuesto = 0.0;

          return {
            ...detalle,
            presupuesto: updatedPresupuesto,
          };
        })
      );
      if (!arraysEqual(detalles, updatedDetalles)) {
        setDetalles(updatedDetalles);
      }
    } catch (error) {
      console.log(error);
    } finally {
      //setDetalles(_detalles);
    }
  }

  function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }

  async function obtienePresupuestoRestado() {
    // setDetalles((prevDetalles) => ({
    //   ...prevDetalles
    // }))
    let _detalles = detalles;
    for (let i = 0; i < _detalles.length; i++) {
      _detalles[i].presupuesto = await consultarPresupuesto(
        _detalles[i].centCostos[0].name,
        _detalles[i].posFinanciera.id,
        new Date().getFullYear(),
        0
      ).data.Result[0].name;
    }

    setDetalles(_detalles);
  }

  useEffect(() => {
    console.log(solicitudRD.STR_ESTADO);
    obtieneViaticos();
  }, []);

  // useEffect(() => {
  //   if (solicitudRD.STR_ESTADO > 1) {
  //     obtienePresupuestoRestado();
  //   }
  // }, [solicitudRD]);

  useEffect(() => {
    changeFileTitle();
  }, [AnexoSL]);

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
            Solicitud de Rendición {!esModoRegistrar && `- #${solicitudRD.id}`}{" "}
          </div>
        </div>

        {!esModoRegistrar && (
          <div className="flex text-2xl align-items-center gap-2 p-2">
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
        {/* {(solicitudRD.estado > 5) & (solicitudRD.estado != 7) && (
          <div className="flex text-2xl align-items-center gap-2 p-2">
            <Button
              type="button"
              icon="pi pi-file-pdf"
              severity="warning"
              rounded
              onClick={downloadAndOpenPdf}
              data-pr-tooltip="PDF"
            />
          </div>
        )} */}
      </div>
      <Divider />
      <TabView
        ref={tabViewRef}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Nueva Solicitud de Dinero">
          <SolicitudNuevaSL
          />
        </TabPanel>
        {/* <TabPanel header="General">
          <GeneralSL
            solicitudRD={solicitudRD}
            setSolicitudRD={setSolicitudRD}
            usuario={usuario}
            solicitando={solicitando}
            setDetalles={setDetalles}
            estadosEditables={estadosEditables}
            //vencimientoRef={vencimientoRef}
          />
        </TabPanel>
        <TabPanel header="Detalle">
          <DetalleSL
            solicitudRD={solicitudRD}
            setSolicitudRD={setSolicitudRD}
            usuario={usuario}
            nOrden={nOrden}
            setNorden={setNorden}
            detalles={detalles}
            setDetalles={setDetalles}
            solicitando={solicitando}
            showSuccess={showSuccess}
            showError={showError}
            setLoading={setLoading}
            estadosEditables={estadosEditables}
            viaticos={viaticos}
          />
        </TabPanel>
        <TabPanel header="Anexos">
          <AnexoSL
            setLoadingSkeleton={setLoadingSkeleton}
            solicitudRD={solicitudRD}
            setSolicitudRD={setSolicitudRD}
            usuario={usuario}
            adjuntos={adjuntos}
            setAdjuntos={setAdjuntos}
            fileUploadRef={fileUploadRef}
            changeFileTitle={changeFileTitle}
            solicitando={solicitando}
            estadosEditables={estadosEditables}
            showError={showError}
            showSuccess={showSuccess}
          />
        </TabPanel>
        {/* ([10, 11, 13, 14, 16, 17, 18, 19].includes(rowData.STR_ESTADO)) }

        {[2, 3, 4, 5, 6, 7].includes(solicitudRD.estado) && (
          <TabPanel header="Aprobadores">
            <Aprobaciones
              solicitudRD={solicitudRD}
              setSolicitudRD={setSolicitudRD}
              usuario={usuario}
              adjuntos={adjuntos}
              setAdjuntos={setAdjuntos}
              fileUploadRef={fileUploadRef}
              changeFileTitle={changeFileTitle}
              solicitando={solicitando}
              estadosEditables={estadosEditables}
              showError={showError}
              showSuccess={showSuccess}
              aprobadores={aprobadores}
              setAprobadores={setAprobadores}
            />
          </TabPanel>
        )}
         */}
      </TabView>
      <div className="card flex flex-wrap  gap-3 mx-3">
        {usuario.TipoUsuario == 1 ? (
          <Button
            label={`${id != null ? "Actualizar" : "Guardar"} Borrador`}
            severity="info"
            size="large"
            style={{ backgroundColor: "black", borderColor: "black" }}
            onClick={(e) => {
              setSolicitando(false);
              registrarSR();
              // if (esModoRegistrar) {
              //   navigate("/solicitudes");
              // }
            }}
            loading={loading}
            disabled={!estadosEditables.includes(solicitudRD.estado)}
          />
        ) : (
          <Button
            label={`Aprobar Solicitud`}
            severity="success"
            size="large"
            onClick={(e) => {
              setSolicitando(false);
              confirmAceptacion();
            }}
            loading={loading}
            disabled={(solicitudRD.estado > 3) | (solicitudRD.estado == 1)}
          />
        )}
        {usuario.TipoUsuario == 1 ? (
          <Button
            label="Solicitar Aprobación"
            size="large"
            onClick={confirm1}
            disabled={!estadosEditables.includes(solicitudRD.estado) | loading}
          />
        ) : (
          <Button
            label="Rechazar Solicitud"
            severity="danger"
            size="large"
            onClick={confirmRechazo}
            disabled={(solicitudRD.estado > 3) | (solicitudRD.estado == 1)}
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
