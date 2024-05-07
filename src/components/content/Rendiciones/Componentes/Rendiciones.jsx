import { DataTable } from "primereact/datatable";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Column } from "primereact/column";
import {
  aceptarAprobRendicion,
  actualizaRendicion,
  autorizarReversionAprobRendicion,
  enviarAprobRendicion,
  listarRendiciones,
  obtenerEstadosRendiciones,
  obtenerRendicion,
  rechazarAprobRendicion,
  reintentarRendi,
  revertirAprobRendicion,
  validacionDocumento,
} from "../../../../services/axios.service";
import { AppContext } from "../../../../App";
import { Tag } from "primereact/tag";
import { SplitButton } from "primereact/splitbutton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import FormDT from "./SubComponentes/Formulario/Sub/FormDT";

function Rendiciones({
  header,
  rendiciones,
  setRendiciones,
  filtrado,
  emptyProduct,
}) {

const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        className="font-bold"
        value={rowData.STR_ESTADO_INFO?.name}
        severity={getSeverity(rowData.STR_ESTADO)}
      />
    );
  };

  // const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [primerCarga, setPrimerCarga] = useState(true);
  const primerCargaRef = useRef(true);

  //   const [rendiciones,rendiciones]= useState(

  //     {
  // ID:null
  //     }
  //    )
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

  async function autorizarReversionLocal(
    rendicionId
  ) {
    setLoading(true);
    try {
      let response = await autorizarReversionAprobRendicion(
        rendicionId
      );
      if (response.status < 300) {
        let body = response.data.Result[0];

        // if (body.AprobacionFinalizada == 0) {
        showSuccess(`Se autorizo la reversion de la rendición`);
        // } else {
        //   showSuccess(
        //     `Se migró a a SAP la rendición con número ${body.DocNum}`
        //   );
        // }
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      listarRendicionesLocal(true);
      setLoading(false);
    }
  }

  async function ReversionAprobacionLocal(
    rendicionId
  ) {
    setLoading(true);
    try {
      let response = await revertirAprobRendicion(
        rendicionId
      );
      if (response.status < 300) {
        let body = response.data.Result[0];

        // if (body.AprobacionFinalizada == 0) {
        showSuccess(`Se revertio la aprobacion de la rendición`);
        // } else {
        //   showSuccess(
        //     `Se migró a a SAP la rendición con número ${body.DocNum}`
        //   );
        // }
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      listarRendicionesLocal(true);
      setLoading(false);
    }
  }

  const fecBodyTemplate = (rowData) => {

    return <>{rowData.STR_FECHAREGIS}</>;
  };

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
      case 13:
      case 14:
      case 16:
      case 18:
      case 19:
      case 11:
        return "success";

      case 1:
      case 9:
        return "info";

      case 10:
      case 2:
      case 3:
        return "warning";

      case "renewal":
        return null;
    }
  };

  const [estados, setEstados] = useState([])
  async function obtenerEstadosLocalR() {
    let response = await obtenerEstadosRendiciones();
    let body = response.data.Result;

    setEstados(response.data.Result);
  }



  useEffect(() => {
    obtenerEstadosLocalR();
  }, []);

  async function actualizarRendiEnCarga(body) {
    try {
      let _body = { ...body };
      _body.STR_ESTADO = 9;
      await actualizaRendicion(_body);
    } catch (error) {
      console.log(error);
    }
  }

  const formatCurrency = (value) => {
    return value.toLocaleString("es-PE", {
      style: "currency",
      currency: "SOL",
    });
  };

  const priceBodyTemplate = (product) => {
    return formatCurrency(product.STR_TOTALRENDIDO);
  };

  async function aceptarAprobacionLocal(
    idSoli,
    idUsr,
    area,
    estado,
    rendicionId,
    areas
  ) {
    setLoading(true);
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

        if (body.AprobacionFinalizada == 0) {
          showSuccess(`Se aprobó la rendición`);
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
      listarRendicionesLocal(true);
      setLoading(false);
    }
  }

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
        showInfo("Se rechazó la solicitud");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //navigate(ruta + "/rendiciones");
      } else {
        showError(response.data.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      listarRendicionesLocal(true);
      setLoadingBtn(false);
    }
  }

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

  const confirmReversion = (
    id
  ) => {
    confirmDialog({
      message: `¿Estás seguro de revertir la aprobacion de Rendición con código #${id}?`,
      header: "Revertir Rendicion",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () =>
        ReversionAprobacionLocal(
          id
        ),
      //reject,
    });
  };

  const downloadAndOpenPdf = async (numRendi) => {
    setLoading(true);
    try {
      const host = import.meta.env.VITE_REACT_APP_BASE_URL;
      const tk = localStorage.getItem("tk_pw");
      const response = await fetch(`${host}reporte?numRendicion=${numRendi}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tk}`,
        },
      });
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

  const confirmAceptacion = (
    solicitud,
    empId,
    subGerencia,
    estado,
    id,
    subGerencia2
  ) => {
    confirmDialog({
      message: `¿Estás seguro de aceptar la Rendición con código #${id}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () =>
        aceptarAprobacionLocal(
          solicitud,
          empId,
          subGerencia,
          estado,
          id,
          subGerencia2
        ),
      //reject,
    });
  };

  const confirmRechazo = (
    solicitud,
    empId,
    subGerencia,
    estado,
    id,
    subGerencia2
  ) => {
    confirmDialog({
      message: `¿Estás seguro de rechazar la Rendición con código #${id}?`,
      header: "Confirmación solicitud",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptClassName: "p-button-danger",
      accept: () =>
        rechazarAprobacionLocal(
          solicitud,
          empId,
          subGerencia,
          estado,
          id,
          subGerencia2
        ),
      acceptLabel: "Si",
      rejectLabel: "No",
      //reject,
    });
  };

  const confirmEnvio = (data) => {
    confirmDialog({
      message: `¿Estás seguro de Enviar a aprobar la rendición con código #${data.ID}?`,
      header: "Confirmación Rendición",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      acceptLabel: "Si",
      rejectLabel: "No",
      accept: () => {
        eniarAprobacion(data);
      },
      //reject,
    });
  };

  async function eniarAprobacion(data) {
    setLoading(true);
    try {
      // Obtiene Documentos
      let response = await obtenerRendicion(data.ID);
      if (response.status < 300) {
        let _rendicion = response.data.Result[0];
        let todosDocumentosValidos = true;
        //---------------------------------------- Necesita los documentos
        const todosValidados = _rendicion.documentos.every(
          (doc) => doc.STR_VALIDA_SUNAT === true
        );

        for (const e of _rendicion.documentos) {
          try {
            // setLoadingBtn(true);
            // console.log(e);
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
          const body = {
            usuarioId: usuario.empId,
            tipord: _rendicion.SOLICITUDRD.STR_TIPORENDICION,
            area: _rendicion.STR_EMPLEADO_ASIGNADO.SubGerencia,
            monto: _rendicion.STR_TOTALRENDIDO,
            cargo: _rendicion.STR_EMPLEADO_ASIGNADO.jobTitle,
            conta: usuario.TipoUsuario == 3 ? 0 : 1,
          };
          let response = await enviarAprobRendicion(
            _rendicion.ID,
            _rendicion.SOLICITUDRD.ID,
            usuario.empId,
            _rendicion.STR_ESTADO,
            usuario.SubGerencia
          );
          if (response.status < 300) {
            showSuccess(
              "Rendición fue enviada a aprobación. Se le notificará por correo electronico cuando se tenga respuesta"
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            //navigate(ruta + "/rendiciones");
            listarRendicionesLocal();
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const actionBodyver = (rowData) => (

    <Button
      label="Ver"
      icon="pi pi-eye"
      severity="success"
      onClick={() => {
        navigate(
          ruta +
          `/rendiciones/info/${rowData.ID}`,
        )
      }}
    />
  )

  const actionBodyTemplate = (rowData) => {
    const items = [
      {
        label: "Ver",
        icon: "pi pi-eye",
        command: async () => {
          try {
            if (rowData.STR_ESTADO == 8) {
              await actualizarRendiEnCarga(rowData);
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          } catch (error) {
          } finally {
            navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
          }
        },
      },
    ];

    if (
      ((usuario.TipoUsuario == 1) &
        ((rowData.STR_ESTADO == 8) |
          (rowData.STR_ESTADO == 9) |
          (rowData.STR_ESTADO == 12))) |
      ((usuario.TipoUsuario == 3) & (rowData.STR_ESTADO == 10))
    ) {
      items.push({
        label:
          rowData.STR_ESTADO == 8 ||
            rowData.STR_ESTADO == 12 ||
            rowData.STR_ESTADO == 15
            ? "Rendir"
            : "Modificar",
        icon: "pi pi-pencil",
        command: () => {
          try {
            if (
              rowData.STR_ESTADO == 8 ||
              rowData.STR_ESTADO == 12 ||
              rowData.STR_ESTADO == 15
            ) {
              actualizarRendiEnCarga(rowData);
            }
          } catch (error) {
          } finally {
            navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
          }
        },
      });
    }


    if (true) {
      items.push({
        label: "Autorizar Reversion",
        icon: "pi pi-check",
        command: () => {
          confirmAutorizarReversion(
            rowData.ID
          );
        },
      });
    }

    if (true) {
      items.push({
        label: "Confirmar Reversion",
        icon: "pi pi-check",
        command: () => {
          confirmReversion(
            rowData.ID
          );
        },
      });
    }

    console.log(usuario.TipoUsuario)
    console.log(rowData.STR_ESTADO)
    if (
      ((usuario.TipoUsuario != 1) &
        ((rowData.STR_ESTADO == 10) | (rowData.STR_ESTADO == 11))) |
      (rowData.STR_ESTADO == 13)
    ) {
      items.push({
        label: "Aceptar",
        icon: "pi pi-check",
        command: () => {
          confirmAceptacion(
            rowData.STR_SOLICITUD,
            usuario.empId,
            usuario.SubGerencia,
            rowData.STR_ESTADO_INFO.Id,
            rowData.ID,
            usuario.SubGerencia
          );
        },
      });
    }

    if (
      ((usuario.TipoUsuario != 1) &
        ((rowData.STR_ESTADO == 10) | (rowData.STR_ESTADO == 11))) |
      (rowData.STR_ESTADO == 13)
    ) {
      items.push({
        label: "Rechazar",
        icon: "pi pi-times",
        command: () => {
          confirmRechazo(
            rowData.STR_SOLICITUD,
            usuario.empId,
            usuario.SubGerencia,
            rowData.STR_ESTADO_INFO.Id,
            rowData.ID,
            usuario.SubGerencia
          );
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
          navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
        },
      });
    }

    if (
      (rowData.STR_ESTADO == 16) |
      (rowData.STR_ESTADO == 18) |
      (rowData.STR_ESTADO == 19)
    ) {
      items.push({
        label: "Descargar Liquidación",
        icon: "pi pi-file-pdf",
        command: () => {
          downloadAndOpenPdf(rowData.STR_NRRENDICION);
        },
      });
    }

    if ((rowData.STR_ESTADO == 17) & (usuario.TipoUsuario == 4)) {
      items.push({
        label: "Reintentar Migracion",
        icon: "pi pi-pencil",
        command: () => {
          reintentarMigracion(rowData.ID);
        },
      });
    }

    if ((rowData.STR_ESTADO == 17) & (usuario.TipoUsuario == 4)) {
      items.push({
        label: "Reintentar Migracion",
        icon: "pi pi-pencil",
        command: () => {
          reintentarMigracion(rowData.ID);
        },
      });
    }


    if ([10, 11, 13, 14, 16, 17, 18, 19].includes(rowData.STR_ESTADO)) {
      items.push({
        label: "Ver Aprobadores",
        icon: "pi pi-eye",
        command: () => {
          navigate(ruta + `rendiciones/aprobadores/${rowData.ID}`);
        },
      });
    }

    if (usuario.TipoUsuario == 1 && rowData.STR_ESTADO == 9) {
      items.push({
        label: "Enviar Aprobación",
        icon: "pi pi-send",
        command: () => {
          confirmEnvio(rowData);
        },
      });
    }

    async function reintentarMigracion(id) {
      try {
        setLoading(true);
        let response = await reintentarRendi(id);
        if (response.status < 300) {
          let data = response.data.Result[0];
          showSuccess(
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
        listarRendicionesLocal();
        setLoading(false);
      }
    }

    return (
      <div className="split-button">
        <Button
          onClick={() => {
            try {
              if (rowData.STR_ESTADO == 8) {
                actualizarRendiEnCarga(rowData);
              }
            } catch (error) {
            } finally {
              // navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
              navigate(ruta + `/rendiciones/8/documentos/agregar`);
            }
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



  function obtieneFecha(fecha) {
    const date = new Date(fecha);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  }

  async function listarRendicionesLocal() {
    setLoading(true);
    let tipousuario = usuario.TipoUsuario;
    let fechaInicial = "";
    let fechaFin = "";
    let nrendicion = filtrado.nrRendicion != null ? filtrado.nrRendicion : "";

    let estado =filtrado.estados != null? filtrado.estados.map((data) => data.id).join(",")
        : "";

    if (filtrado.rangoFecha?.length > 1) {
      fechaInicial = obtieneFecha(filtrado.rangoFecha[0]);
      fechaFin = obtieneFecha(filtrado.rangoFecha[1]);
    }

    await listarRendiciones(
      usuario.sapID,
      usuario.rol?.id == 1
        ? usuario.sapID
        : filtrado.empleadoAsig == null
          ? null
          : filtrado.empleadoAsig.id,
      usuario.rol.id,
      fechaInicial,
      fechaFin,
      nrendicion,
      estado,
      usuario.branch //usuario.SubGerencia
    )
      .then((response) => {
        setRendiciones(response.data.Result);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        console.log("Se terminó de traer solicitud");
        setLoading(false);
      });
  }

  useEffect(() => {
   
    if (usuario.sapID != null) {
      listarRendicionesLocal();
    }
  }, [filtrado, usuario]);


  const [productDialog, setProductDialog] = useState(false);
  const openNew = () => {

    setProductDialog(true);
  };

  // const pruebas{
 console.log( "ren",rendiciones)
  // }
  useEffect(() => {
    //obtenerEstadoLocal();
    console.log("USER: ",usuario.rol?.id)
    console.log("LISTA: ",usuario.rol?.id === "2" ?
    rendiciones.filter(rendicion => rendicion.STR_ESTADO > 10) :
    usuario.rol?.id === "3" ?
    rendiciones.filter(rendicion => rendicion.STR_ESTADO > 11) :
    rendiciones)
  }, [rendiciones]);

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable
        value={
            // rendiciones
            usuario.rol?.id === "2" ?
            rendiciones.filter(rendicion => rendicion.STR_ESTADO > 10) :
            usuario.rol?.id === "3" ?
            rendiciones.filter(rendicion => rendicion.STR_ESTADO > 11) :
            rendiciones
        }
        sortMode="multiple"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "12rem" }}
        header={header}
        loading={loading}
      >
        <Column
          header="#"
          headerStyle={{ width: "3rem" }}
          body={(data, options) => options.rowIndex + 1}
        ></Column>
        <Column
          field="ID"
          header="Código"
          style={{ width: "3rem" }}
          className="font-bold"
        ></Column>
        <Column
          field="STR_NRRENDICION"
          header="N° Rendición"
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="STR_ESTADO"
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
          field="STR_SOLICITUD"
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
          field="STR_TOTALRENDIDO"
          body={priceBodyTemplate}
          header="Monto Rendido"
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="STR_FECHAREGIS"
          header="Fecha RD"
          style={{ minWidth: "10rem" }}
          body={fecBodyTemplate}
        ></Column>
        <Column
          field="STR_NRCARGA"
          header="Carga Docs"
          style={{ minWidth: "7rem" }}
        ></Column>
        <Column
          field="STR_DOCENTRY"
          header="DocEntry"
          style={{ minWidth: "7rem" }}
        ></Column>

        <Column
          field="STR_MOTIVOMIGR"
          header="Mensaje de Migración"
          style={{ minWidth: "20rem" }}
        ></Column>
        <Column
          header="Acciones"
          body={actionBodyver}
          // body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "10rem" }}
          frozen
          alignFrozen="right"
        ></Column>
      </DataTable>
      {/* <Button
        label="ver"
        icon="pi pi-eye"
        severity="success"
        onClick={() => {
          navigate(ruta + `/rendiciones/6/documentos/editar`);
        }}
      /> */}
      {/* <Button
        label="ver2"
        icon="pi pi-eye"
        severity="success"
        onClick={() => {
          navigate(ruta + `/rendiciones/info/1`);
        }}
      /> */}
      {/* <div>
      <Button
      <div>
        <Button label="ver" icon="pi pi-eye" severity="success"
            onClick={() => {
            navigate(ruta + "/rendiciones/8/documentos/agregar");
          }}

      {/* <Button label="ver" icon="pi pi-eye" severity="success"
        onClick={() => {
          navigate(ruta + "/rendiciones/8/documentos/detail");
        }}

      /> */}

      {/* <button
      consola
      onClick={prueba}
      >

      </button> */}

    </div>



  );
}

export default Rendiciones;
