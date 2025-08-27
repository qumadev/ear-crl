import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
//import { SpeedDial } from "primereact/speeddial";
import { SplitButtonComponent } from "@syncfusion/ej2-react-splitbuttons";
import { Toast } from "primereact/toast";
import {
  aceptarSolicitudSR,
  enviarSolicitudAproba,
  getDescripcionEstado,
  listarSolicitud,
  obtenerEstados,
  obtenerSolicitudR,
  rechazarSolicitudSR,
  reintentarEnvio,
  validacionSolicitud,
  obtenerSolicitud
} from "../../../services/axios.service";
import { AppContext } from "../../../App";
import { useNavigate } from "react-router-dom";
//import { SplitButton } from "react-split-button";
import { SplitButton } from "primereact/splitbutton";
import { format } from "date-fns";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
//import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
//import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";

function Solicitudes({
  header,
  filtrado,
  solicitudes,
  setSolicitudes,
  responsiveSizeMobile,
}) {
  const toast = useRef(null);
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const estadosEditables = [1, 5];
  const [representatives, setRepresentatives] = useState([]);
  const [comentarios, setComentarios] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  //AQUI
  //const [montoSolicitud, setMontoSolicitud] = useState(0);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const Solicitudes = () => {
    const [montoSolicitado, setMontoSolicitado] = useState(0);
  }

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const formatCurrency = (value, currency) => {
    return value.toLocaleString("es-PE", {
      style: "currency",
      currency: currency,
    });
  };

  const priceBodyTemplate = (rowData) => {
    const currency = rowData.STR_MONEDA?.id || "SOL";
    return formatCurrency(rowData.STR_TOTALSOLICITADO, currency);
  };

  const presupuestadoBodyTemplate = (rowData) => {
    return (
      <span style={{ fontWeight: "bold" }}>
        {rowData.STR_PRESUPUESTADO ? "Sí" : "No"}
      </span>
    )
  }

  const fecBodyTemplate = (rowData) => {
    return <>{rowData.STR_FECHAREGIS}</>;
  };

  const fechasEventoConcatenadas = (rowData) => {
    return <>{rowData.STR_FECHA_EVENTO_INICIAL} - {rowData.STR_FECHA_EVENTO_FINAL}</>
  }

  async function aceptacionLocal(data) {
    setLoading(true);
    setLoadingBtn(true);
    try {
      let response = await aceptarSolicitudSR(
        data.ID,
        usuario.empId,
        usuario.SubGerencia
      );
      if (response.status == 200) {
        if (response.data.Result[0].AprobacionFinalizada == 1) {
          showSuccess(
            `Se acepto la solicitud, se logró realizar la migración a SAP con el número ${response.data.Result[0].DocNum}`
          );
        } else {
          showInfo(
            "Se aceptó la primera aprobación, queda pendiente de la segunda"
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //listarSolicitudes();
      } else {
        showError(response.data);
      }
    } catch (error) {
      showError(error.response.data.Message);
    } finally {
      setLoadingBtn(false);
      setLoading(false);
      listarSolicitudes();
    }
  }

  async function rechazoLocal(data) {
    setLoading(true);
    try {
      let response = await rechazarSolicitudSR(
        data.ID,
        usuario.empId,
        comentarios,
        usuario.SubGerencia
      );
      if (response.status == 200) {
        showInfo("Se rechazó la solicitud");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        listarSolicitudes();
      } else {
        showError(response.data?.Message);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function reintentarMigracion(id) {
    try {
      setLoading(true);
      let response = await reintentarEnvio(id);
      if (response.status < 300) {
        let data = response.data.Result[0];
        showSuccess(
          "Se realizó la migración exitosamente con número " + data.DocNum
        );
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      showError(error.response.data.Message);
    } finally {
      listarSolicitudes();
      setLoading(false);
    }
  }

  const confirmAceptacion = (data) => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Solicitud de Aprobación con código #${data.ID}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () => aceptacionLocal(data),
      //reject,
    });
  };

  const confirmRechazo = (data) => {
    confirmDialog({
      message: `¿Estás seguro de rechazar la Solicitud de Aprobación con código #${data.ID}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-info-circle",
      defaultFocus: "accept",
      acceptClassName: "p-button-danger",
      accept: () => rechazoLocal(data),
      acceptLabel: "Si",
      rejectLabel: "No",

      //reject,
    });
  };

  const options = [
    "Create a merge commit",
    "Squash and merge",
    "Rebase and merge",
  ];

  async function obtenerDataSolicitud(id) {
    setLoading(true);
    try {
      let response = await obtenerSolicitud(id);

      if (response && response.status < 300) {
        return response.data.Result[0]; // Asumiendo que `data.Result` es el formato esperado
      } else {
        showError(response.Message);
      }
    } catch (error) {
      showError(error.response ? error.response.data.Message : "Error interno");
    }
    return null;
  }

  async function aceptarAprobacionSolicitudLocal(idSolicitud) {
    setLoading(true);
    try {
      let rowData = await obtenerDataSolicitud(idSolicitud);

      if (!rowData) {
        showError("No se encontraron datos para la solicitud");
        setLoading(false);
        return;
      }

      let response = await aceptarSolicitudSR(
        rowData.ID,
        usuario.sapID,
        usuario.branch,
        rowData.STR_ESTADO
      );

      if (response.status < 300) {
        let body = response.data.Result[0];

        if (body.AprobacionFinalizada == 0) {
          showSuccess("Se aceptó la primera aprobación, queda pendiente de la segunda");
        }
        if (body.AprobacionFinalizada == 1) {
          showSuccess(`Se migró a SAP la solicitud con número ${body.DocNum}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));  // Retraso de 1 segundo
          showSuccess('Se envió a su correo la aprobación de dicha solicitud');
        }

      } else {
        showError(response.Message);
      }
    } catch (error) {
      showError(error.response ? error.response.data.Message : "Error interno");
    } finally {
      listarSolicitudes();
      setLoading(false);
    }
  }

  async function rechazarAprobacionSolicitudLocal(idSolicitud) {
    setLoading(true);
    try {
      let rowData = await obtenerDataSolicitud(idSolicitud);

      if (!rowData) {
        showError("No se encontraron datos para la solicitud");
        setLoading(false);
        return;
      }

      let response = await rechazarSolicitudSR(
        rowData.ID,
        usuario.sapID,
        rowData.STR_COMENTARIO || "",
        usuario.branch,
        rowData.STR_ESTADO
      );

      if (response.status < 300) {
        let body = response.data.Result[0];

        if (body.AprobacionFinalizada == 0) {
          showInfo(`Se rechazó la solicitud`);
        } else {
          showInfo(`Se rechazó la solicitud`);
        }

        listarSolicitudes();

      } else {
        showError(response.Message);
      }
    } catch (error) {
      showError(error.response ? error.response.data.Message : "Error interno");
    } finally {
      setLoading(false);
    }
  }

  const confirmarAceptacion = (rowData) => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Solicitud con código #${rowData.ID}`,
      header: "Confimar Solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Sí",
      rejectLabel: "No",
      accept: async () => {
        await aceptarAprobacionSolicitudLocal(rowData.ID)
      }
    });
  };

  const rechazarAceptacion = (rowData) => {
    confirmDialog({
      message: `¿Estás seguro de rechazar la Solicitud con código #${rowData.ID}`,
      header: "Rechazar Solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Sí",
      rejectLabel: "No",
      accept: async () => {
        await rechazarAprobacionSolicitudLocal(rowData.ID)
      }
    })
  }

  const confirmarReversion = (rowData) => {
    confirmDialog({
      message: `¿Estás seguro de revertir la aprobación de la Solicitud con código #${rowData.ID}?`,
      header: "Revertir Solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () =>
        ReversionAprobacionLocal(rowData.ID),
    });
  };

  const actionBodyTemplate = (rowData) => {
    const showAprobacionButton =
      (
        (usuario.rol?.id === "3" && ![1, 2, 6].includes(rowData?.STR_ESTADO)) ||
        (usuario.rol?.id === "2" && rowData?.STR_ESTADO !== 3 && rowData?.STR_ESTADO !== 6)
      ) &&
      rowData?.STR_ESTADO >= 2 &&
      rowData?.STR_ESTADO !== 5 &&
      rowData?.STR_ESTADO !== 7;

    const showRevertirAprobacionButton =
      (
        (usuario.rol?.id === "3" && ![1, 2, 6].includes(rowData?.STR_ESTADO)) ||
        (usuario.rol?.id === "2" && rowData?.STR_ESTADO !== 3 && rowData?.STR_ESTADO !== 6)
      ) &&
      rowData?.STR_ESTADO >= 2 &&
      rowData?.STR_ESTADO !== 5;

    const showReintentarMigracionButton = (usuario.rol?.id === "3" && rowData?.STR_ESTADO === 7);

    const items = [
      ...(showAprobacionButton ? [{
        label: "Aprobar Solicitud",
        icon: "pi pi-check",
        command: () => {
          confirmarAceptacion(rowData)
        }
      }] : []),

      ...(showRevertirAprobacionButton ? [{
        label: "Rechazar Solicitud",
        icon: "pi pi-undo",
        command: () => {
          rechazarAceptacion(rowData)
        }
      }] : []),

      ...(showReintentarMigracionButton ? [{
        label: "Reintentar Migración",
        icon: "pi pi-refresh",
        command: () => {
          reintentarMigracion(rowData.ID);
        }
      }] : []),
    ];

    /******************************************************* */
    // Enviar Solicitud de Aprobación

    const confirm1 = (data) => {
      confirmDialog({
        message: `¿Estás seguro de enviar a aprobar la solicitud de rendición?`,
        header: "Confirmación solicitud",
        icon: "pi pi-check",
        defaultFocus: "accept",
        accept: () => {
          enviarAprobacion(data);
        },
        acceptLabel: "Si",
        rejectLabel: "No",
        //reject,
      });
    };

    // Obtiene detalles Presupuesto
    function obtenerDetallePresupuesto(data, detalles) {
      const listaDetalles = Object.values(
        detalles.reduce((acumulador, detalle) => {
          const { ceco, posFinanciera, precioTotal } = detalle;
          const clave = `${JSON.stringify(posFinanciera)}`;

          if (acumulador[clave]) {
            // Si ya existe, sumar el STR_TOTAL
            acumulador[clave].STR_TOTAL += precioTotal;
          } else {
            // Si no existe, crear una nueva entrada
            let fecha = data.STR_FECHAREGIS.split("/");
            acumulador[clave] = {
              STR_POSFIN: posFinanciera.name,
              STR_TOTAL: precioTotal,
              STR_PENDIENTE: "1",
              STR_CENTCOST: ceco,
              STR_FECHAREGIS: `${fecha[2]}-${fecha[1]}-${fecha[0]}`,
            };
          }

          return acumulador;
        }, [])
      );
      return listaDetalles;
    }

    const enviarAprobacion = async (data) => {
      setLoading(true);
      try {
        if (responsValida.status != 200) {
          showError(responsValida.data.Message);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          //navigate(ruta + "/solicitudes");
        } else {
          let responseSoli = await obtenerSolicitudR(data.ID, "PWB");
          let detalles = responseSoli.data.Result[0].SOLICITUD_DET;
          //let presupuesto =

          let response = await enviarSolicitudAproba(data.ID, {
            usuarioId: usuario.empId,
            tipord: data.STR_TIPORENDICION,
            area: usuario.SubGerencia,
            monto: data.STR_TOTALSOLICITADO,
            estado: 1,
            p_Borradores: obtenerDetallePresupuesto(data, detalles),
          });

          if (response.status == 200) {
            showSuccess(
              `Se envió la solicitud a los aprobadores con id: ${data.ID}`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            //navigate(ruta + "/solicitudes");
            listarSolicitudes();
          } else {
            showError(response.data.Message);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="split-button">
        {items.length > 0 ? (
          <SplitButton
            label="Ver"
            icon="pi pi-eye"
            style={{ width: '118px' }}
            model={items}
            onClick={() => {
              navigate(
                ruta +
                `/solicitudes/editar/${rowData.CREATE === "PWB" ? rowData.ID : rowData.STR_DOCENTRY}`,
                {
                  state: {
                    create: rowData.CREATE === "PWB" ? "PWB" : "SAP",
                  },
                }
              );
            }}
          />
        ) : (
          <Button
            label="Ver"
            icon="pi pi-eye"
            className="button-left-align"
            style={{ width: '118px' }}
            onClick={() => {
              navigate(
                ruta +
                `/solicitudes/editar/${rowData.CREATE === "PWB" ? rowData.ID : rowData.STR_DOCENTRY}`,
                {
                  state: {
                    create: rowData.CREATE === "PWB" ? "PWB" : "SAP",
                  },
                }
              );
            }}
          />
        )}
      </div>
    );
  };

  function obtieneFecha(fecha) {
    const date = new Date(fecha);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  }

  const getSeverity = (status) => {
    switch (status) {
      case 5:
      case 7:
      case 12:
      case 15:
      case 17:
        return "danger";

      case 4:
      case 6:
      case 8:
      case 9:
      case 10:
      case 13:
      case 14:
      case 16:
      case 18:
      case 19:
        return "success";

      case 1:
      case 11:
        return "info";

      case 2:
      case 3:
        return "warning";

      case "renewal":
        return null;
    }
  };

  async function listarSolicitudes() {
    setLoading(true);
    let tipousuario = usuario.TipoUsuario;
    let empNombre = filtrado.empNombre || "";
    let fechaInicial = "";
    let fechaFin = "";
    let numeroSolicitud = filtrado.numeroSolicitudORendicion != null ? filtrado.numeroSolicitudORendicion : "";

    let estado = filtrado.estados != null ? filtrado.estados.map((data) => data.id).join(",") : "";

    if (filtrado.rangoFecha?.length > 1) {
      fechaInicial = obtieneFecha(filtrado.rangoFecha[0]);
      fechaFin = obtieneFecha(filtrado.rangoFecha[1]);
    }

    try {
      const response = await listarSolicitud(
        usuario.sapID,
        usuario.rol?.id == 1
          ? usuario.sapID
          : filtrado.empleadoAsig == null
            ? null
            : filtrado.empleadoAsig.id,
        empNombre,
        usuario.rol.id,
        fechaInicial,
        fechaFin,
        numeroSolicitud,
        estado,
        usuario.branch
      );


      setSolicitudes(response.data.Result);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        className="font-bold"
        value={rowData.STR_ESTADO_INFO}
        severity={getSeverity(rowData.STR_ESTADO)}
      />
    );
  };


  const showSuccess = (mensaje) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
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

  const showError = (mensaje) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 3000,
    });
  };

  useEffect(() => {
    if (usuario.sapID != null) {
      listarSolicitudes();
    }
  }, [filtrado, usuario]);

  const comentarioBodyTemplate = (rowData) => {
    const comentario = rowData.STR_COMENTARIO || "";
    const maxLength = 50;

    return (
      <div
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3, // Máximo 3 líneas
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordWrap: "break-word",
          maxWidth: "15rem", // Ajusta el ancho si es necesario
          whiteSpace: "normal",
        }}
      >
        {comentario.length > maxLength ? comentario.substring(0, maxLength) + "..." : comentario}
      </div>
    );
  };


  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={solicitudes.filter(rowData => {
          switch (usuario.rol?.id) {
            case "1": return true;
            case "2": return rowData.STR_ESTADO >= 2;
            case "3": return true;
          }
        })}
        sortMode="multiple"
        paginator
        rows={25}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "12rem" }}
        header={header}
        loading={loading}
        emptyMessage={
          <div style={{ textAlign: 'center', padding: '10px' }}>
            No se encontraron solicitudes registradas
          </div>
        }
        cellStyle={{ border: '5px solid #ddd' }}
        className="p-datatable-gridlines"
      >
        <Column
          header="#"
          headerStyle={{ width: "3rem" }}
          body={(data, options) => options.rowIndex + 1}
        ></Column>
        <Column
          field="ID"
          header="Código"
          style={{ width: "3rem", textAlign: "center" }}
          className="font-bold"
          bodyClassName="text-center"
        ></Column>
        <Column
          field="STR_NRSOLICITUD"
          header="N° de la Solicitud"
          style={{ minWidth: "12rem", textAlign: "center" }}
        ></Column>
        <Column
          field="STR_FECHAREGIS"
          header="Fecha de Solicitud"
          style={{ minWidth: "15rem", textAlign: "center" }}
          body={fecBodyTemplate}
        ></Column>
        <Column
          header="Tipo"
          style={{ minWidth: "10rem", textAlign: "center" }}
          body={(rowData) => rowData.STR_MOTIVORENDICION?.name}
        ></Column>
        <Column
          header="Rango fecha del evento"
          style={{ minWidth: "15rem", textAlign: "center" }}
          body={fechasEventoConcatenadas}
        ></Column>
        <Column
          header="Motivo"
          style={{ minWidth: "10rem", textAlign: "center" }}
          body={(rowData) => rowData.STR_TIPORENDICION?.name}
        ></Column>
        <Column
          field="STR_EMPLDASIG_NOMBRE"
          header="Empleado Asignado"
          style={{ minWidth: "15rem", textAlign: "center" }}
        ></Column>
        <Column
          field="STR_TOTALSOLICITADO"
          body={priceBodyTemplate}
          header="Monto Solicitado"
          style={{ minWidth: "12rem", textAlign: "center" }}
        ></Column>
        <Column
          header="Presupuestado"
          style={{ minWidth: "15rem", textAlign: "center" }}
          body={presupuestadoBodyTemplate}
        ></Column>
        <Column
          header="Proyecto"
          field="STR_PROYECTO.name"
          style={{ minWidth: "10rem", textAlign: "center" }}
        ></Column>
        <Column
          header="Centro de Costo (CeCo)"
          field="STR_CENTRO_COSTO.name"
          style={{ minWidth: "10rem", textAlign: "center" }}
        ></Column>
        <Column
          header="N° de cuenta corriente y/o CCI"
          field="STR_CCI"
          style={{ minWidth: "10rem", textAlign: "center" }}
        ></Column>
        <Column
          header="N° DNI, pasaporte, RUC o CE"
          field="STR_TIPO_IDENTIFICACION"
          style={{ minWidth: "10rem", textAlign: "center" }}
        ></Column>
        <Column
          header="Comentario"
          style={{ minWidth: "15rem", textAlign: "center" }}
          body={comentarioBodyTemplate}
        />
        <Column
          field="STR_ESTADO_INFO"
          header="Estado"
          style={{ minWidth: "9rem", textAlign: "center" }}
          body={statusBodyTemplate}
        ></Column>
        {/* <Column
          field="STR_DOCENTRY"
          header="DocEntry"
          style={{ minWidth: "10rem" }}
        ></Column> */}
        <Column
          field="STR_MOTIVOMIGR"
          header="Mensaje de Migración"
          style={{ minWidth: "12rem", textAlign: "center" }}
        // frozen={true}
        // alignFrozen="right"
        ></Column>
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "10rem", textAlign: "center" }}
          // frozen={true}
          rowSpan={3}
        // alignFrozen="right"
        ></Column>
        {/* <Column
          field="STR_NRRENDICION"
          header="N° Rendición"
          style={{ minWidth: "12rem" }}
        ></Column> */}
        {/* <Column
          field="STR_CARGADOCS"
          header="Carga Docs"
          style={{ minWidth: "7rem" }}
        ></Column> */}
      </DataTable>
    </div>
  );
}

export default Solicitudes;
