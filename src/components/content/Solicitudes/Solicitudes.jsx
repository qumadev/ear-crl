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

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

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

  const formatCurrency = (value) => {
    return value.toLocaleString("es-PE", {
      style: "currency",
      currency: "SOL",
    });
  };

  const priceBodyTemplate = (product) => {
    return formatCurrency(product.STR_TOTALSOLICITADO);
  };

  const fecBodyTemplate = (rowData) => {
    return <>{rowData.STR_FECHAREGIS}</>;
  };

  async function aceptacionLocal(data) {
    setLoading(true);
    setLoadingBtn(true);
    try {
      let response = await aceptarSolicitudSR(
        data.ID,
        usuario.empId,
        usuario.SubGerencia
      );
      console.log(response.data.Result[0].AprobacionFinalizada);
      if (response.status == 200) {
        if (response.data.Result[0].AprobacionFinalizada == 1) {
          showSuccess(
            `Se acepto la solicitud, se logró realizar la migración a SAP con el número ${response.data.Result[0].DocNum}`
          );
        } else {
          showInfo(
            "Se aceptó la primera aprobación, quedá pendiente de la segunda"
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //listarSolicitudes();
      } else {
        showError(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.log(error);
      showError(error.response.data.Message);
      console.log(error.response.data.Message);
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
      console.log(response);
      if (response.status == 200) {
        showInfo("Se rechazó la solicitud");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        listarSolicitudes();
      } else {
        console.log(response);
        showError(response.data?.Message);
      }
    } catch (error) {
      console.log(error.Message);
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
        console.log(
          "Se realizó la migración exitosamente con número " + data.DocNum
        );
      } else {
        showError(response.data.Message);
        console.log(response.data);
      }
    } catch (error) {
      showError(error.response.data.Message);
      console.log(error);
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

  const actionBodyTemplate = (rowData) => {
    const items = [
      {
        label: "Ver",
        icon: "pi pi-eye",
        command: () => {
          navigate(
            ruta +
              `/solicitudes/editar/${
                rowData.CREATE == "PWB" ? rowData.ID : rowData.STR_DOCENTRY
              }`,
            {
              state: {
                create: rowData.CREATE == "PWB" ? "PWB" : "SAP",
              },
            }
          );
        },
      },
    ];

    if (
      (usuario.TipoUsuario != 1) &
      ((rowData.STR_ESTADO == 2) | (rowData.STR_ESTADO == 3))
    ) {
      items.push({
        label: "Aceptar",
        icon: "pi pi-check",
        command: () => {
          confirmAceptacion(rowData);
        },
      });
    }

    if (
      (usuario.TipoUsuario != 1) &
      ((rowData.STR_ESTADO == 2) | (rowData.STR_ESTADO == 3))
    ) {
      items.push({
        label: "Rechazar",
        icon: "pi pi-times",
        command: () => {
          confirmRechazo(rowData);
        },
      });
    }
    if (
      ((rowData.STR_ESTADO == 1) | (rowData.STR_ESTADO == 5)) &
      (usuario.TipoUsuario == 1)
    ) {
      items.push({
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => {
          navigate(
            ruta +
              `/solicitudes/editar/${
                rowData.CREATE == "PWB" ? rowData.ID : rowData.STR_DOCENTRY
              }`,
            {
              state: {
                create: rowData.CREATE == "PWB" ? "PWB" : "SAP",
              },
            }
          );
        },
      });
    }

    if ((rowData.STR_ESTADO == 7) & (usuario.TipoUsuario == 4)) {
      items.push({
        label: "Reintentar Migracion",
        icon: "pi pi-pencil",
        command: () => {
          reintentarMigracion(rowData.ID);
          // navigate(`/solicitud/aprobacion/reintentar/${rowData.ID}`);
        },
      });
    }

    if (rowData.STR_ESTADO == 6) {
      items.push({
        label: "Descargar Solicitud",
        icon: "pi pi-file-pdf",
        command: () => {
          downloadAndOpenPdf(
            rowData.STR_DOCENTRY,
            rowData.STR_NRRENDICION,
            rowData.STR_TIPORENDICION
          );
          // navigate(`/solicitud/aprobacion/reintentar/${rowData.ID}`);
        },
      });
    }

    if (rowData.STR_ESTADO == 1 && usuario.TipoUsuario == 1) {
      items.push({
        label: "Enviar Aprobación",
        icon: "pi pi-send",
        command: () => {
          confirm1(rowData);
        },
      });
    }

    const downloadAndOpenPdf = async (docEntry, numRendi, tipoEar) => {
      setLoading(true);
      try {
        const host = import.meta.env.VITE_REACT_APP_BASE_URL;
        const tk = localStorage.getItem("tk_pw");
        const response = await fetch(
          `${host}reporte?id=${docEntry}&numRendicion=${numRendi}&tipo=${tipoEar}`,
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
        saveAs(pdfBlob, `${numRendi}.pdf`);
      } catch (error) {
        console.error("Error al obtener el PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    /******************************************************* */
    // Enviar Solicitud de Aprobación

    const confirm1 = (data) => {
      //console.log("fonr");
      confirmDialog({
        message: `¿Estás seguro de Enviar a aprobar la solicitud de rendición?`,
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
            console.log(data);
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
        let responsValida = await validacionSolicitud(data.ID);

        if (responsValida.status != 200) {
          showError(responsValida.data.Message);
          console.log(responsValida.data.Message);
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
            console.log(response.data.Message);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    /******************************************************* */

    // var items2 = [
    //   {
    //     label: "export",
    //     onClick: () => {
    //       console.log("exported");
    //     },
    //   },
    // ];

    let items3 = [
      {
        label: "export",
        onClick: () => {
          console.log("exported");
        },
      },
      {
        label: "export",
        onClick: () => {
          console.log("exported");
        },
      },
      {
        label: "export",
        onClick: () => {
          console.log("exported");
        },
      },
    ];

    const handleMainButtonClick = () => {
      console.log("Main button clicked");
    };

    return (
      <div className="split-button">
        <Button
          onClick={() => {
            navigate(
              ruta +
                `/solicitudes/editar/${
                  rowData.CREATE == "PWB" ? rowData.ID : rowData.STR_DOCENTRY
                }`,
              {
                state: {
                  create: rowData.CREATE == "PWB" ? "PWB" : "SAP",
                },
              }
            );
          }}
          severity="success"
        >
          <div className="flex gap-3 align-items-center justify-content-center">
            <span>Ver</span>
            <i className="pi pi-chevron-down" style={{ color: "white" }}></i>
          </div>
        </Button>
        <div className="dropdown-content">
          {items.map((data, key) => (
            <Button
              key={key}
              onClick={() => {
                data.command();
              }}
            >
              <i className={`${data.icon}`} style={{ color: "black" }}></i>{" "}
              {data.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // async function obtenerEstadoLocal() {
  //   await obtenerEstados("<8")
  //     .then((response) => {
  //       console.log(response.data.Result);

  //       setRepresentatives(
  //         response.data.Result.map((estado) => ({
  //           id: estado.Id,
  //           name: estado.Nombre,
  //         }))
  //       );
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       console.log("Termino de obtener Estados");
  //     });
  // }
  /* 
  <SplitButton
          label="Ver"
          onClick={() => {
            navigate(
              ruta +
                `/solicitudes/editar/${
                  rowData.CREATE == "PWB" ? rowData.ID : rowData.STR_DOCENTRY
                }`,
              {
                state: {
                  create: rowData.CREATE == "PWB" ? "PWB" : "SAP",
                },
              }
            );
          }}
          icon="pi pi-plus"
          model={items}
          rounded
          loading={loadingBtn}
        >
          {" "}
        </SplitButton> 
  */

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
    let fechaInicial = "";
    let fechaFin = "";
    let nrendicion = filtrado.nrRendicion != null ? filtrado.nrRendicion : "";

    let estado =
      filtrado.estados != null
        ? filtrado.estados.map((dato) => dato.Id).join(",")
        : "";

    if (filtrado.rangoFecha?.length > 1) {
      fechaInicial = obtieneFecha(filtrado.rangoFecha[0]);
      fechaFin = obtieneFecha(filtrado.rangoFecha[1]);
    }

    await listarSolicitud(
      usuario.empId,
      usuario.TipoUsuario == 1
        ? usuario.empId
        : filtrado.empleadoAsig == null
        ? null
        : filtrado.empleadoAsig.id,
      tipousuario,
      fechaInicial,
      fechaFin,
      nrendicion,
      estado,
      usuario.SubGerencia
    )
      .then((response) => {
        console.log(response.data);
        setSolicitudes(response.data.Result);
        console.log(response.data.Result);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        console.log("Se terminó de traer solicitud");
        setLoading(false);
      });
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
    //obtenerEstadoLocal();
    if (usuario.TipoUsuario != null) {
      listarSolicitudes();
    }
  }, [filtrado, usuario]);

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={solicitudes}
        sortMode="multiple"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "12rem" }}
        header={header}
        loading={loading}
        emptyMessage="No se encontraron Solicitudes"
        // scrollable
        // scrollHeight="400px"
      >
        {/* {responsiveSizeMobile ? (
          <></>
        ) : (
          <> */}
        <Column
          header="#"
          headerStyle={{ width: "3rem" }}
          body={(data, options) => options.rowIndex + 1}
        ></Column>
        <Column
          field="ID"
          header="Código"
          style={{ width: "7rem" }}
          className="font-bold"
        ></Column>
        <Column
          field="STR_NRRENDICION"
          header="N° Rendición"
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="STR_ESTADO_INFO"
          header="Estado"
          style={{ minWidth: "8rem" }}
          body={statusBodyTemplate}
        ></Column>
        <Column
          field="STR_EMPLDASIG"
          header="Emp. Asignado"
          style={{ minWidth: "5rem" }}
        ></Column>
        <Column
          field="STR_NRSOLICITUD"
          header="N° de la SR"
          style={{ minWidth: "8rem" }}
        ></Column>
        <Column
          field="STR_FECHAREGIS"
          header="Fecha de Solicitud"
          style={{ minWidth: "10rem" }}
          body={fecBodyTemplate}
        ></Column>
        <Column
          field="STR_TOTALSOLICITADO"
          body={priceBodyTemplate}
          header="Monto Solicitado"
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="STR_DOCENTRY"
          header="DocEntry"
          style={{ minWidth: "10rem" }}
        ></Column>
        <Column
          field="STR_CARGADOCS"
          header="Carga Docs"
          style={{ minWidth: "7rem" }}
        ></Column>
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "10rem" }}
          // frozen={true}
          rowSpan={3}
          // alignFrozen="right"
        ></Column>
        <Column
          field="STR_MOTIVOMIGR"
          header="Mensaje de Migración"
          style={{ minWidth: "20rem" }}
          // frozen={true}
          // alignFrozen="right"
        ></Column>
        {/* </>
        )} */}
      </DataTable>
    </div>
  );
}

export default Solicitudes;
