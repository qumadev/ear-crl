
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import React, { useContext } from 'react'
import TableDT from './TableDT';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../../../../../../App';


export default function FormDT({ responsiveSizeMobile }) {
    const navigate = useNavigate();
    const { usuario, showError, ruta } = useContext(AppContext);
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
            navigate(ruta + `/rendiciones/${id}/documentos`);
          }
        },
      },
    ];


    if (usuario.rol.id == 2) {
      items.push(
        {
          label: "Aprobar",
          icon: "pi pi-eye",
          command: () => {
            console.log("aprobando solicitud")
          },
        },
      )
    }

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

          // aceptacionLocal(rowData);
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
          //rechazoLocal(rowData);
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
          // navigate(`/solicitud/aprobacion/reintentar/${rowData.ID}`);
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

    return (


        <>
            <div className="flex justify-content-between flex-wrap">
                <div
                    className={`flex ${responsiveSizeMobile ? `text-xl` : `text-2xl`
                        } align-items-center`}>
                    Redicion info
                </div>
                <div div className="flex flex-row flex-wrap gap-2">
                    <Button
                        icon="pi pi-refresh"
                        onClick={() => {
                            setFiltrado((prevFiltrado) => ({
                                ...prevFiltrado,
                            }));
                        }}
                        severity="secondary"
                    />
                    <Button
                        icon="pi pi-eraser"
                        // onClick={() => {
                        //      setFiltrado({
                        //         rangoFecha: [new Date(now.getFullYear(), 0, 1), new Date()],
                        //         nrRendicion: null,
                        //        estados: null,
                        // });
                        // }}
                        severity="secondary"
                    />
                    <Button
                        label="Agregar"
                        icon="pi pi-plus"
                        severity="success"
                        onClick={() => {
                            navigate(ruta + `/rendiciones/8/documentos/agregar`);
                        }}
                    // disabled={usuario.TipoUsuario != 1}
                    />
                    <Button
                        label="Exportar"
                        icon="pi pi-upload"
                        severity="secondary"
                        style={{ backgroundColor: "black" }}
                    // onClick={() => {
                    //     exportExcel();
                    // }}
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
                        <Calendar 
                        // value={date} 
                        // onChange={(e) => setDate(e.value)} 
                        showIcon />
                    </div>
                </div>
                <div className="col-12 md:col-5 lg:col-3">
                    <div className="mb-3 flex flex-column  justify-content-center">
                        <label htmlFor="buttondisplay" className="font-bold block mb-2">
                            Monto Rendido:
                        </label>
                        <InputText
                            placeholder=" N° Rendición"
                            disabled
                        />
                    </div>
                </div>
                <div className="col-12 md:col-5 lg:col-3">
                    <div className="mb-3 flex flex-column  justify-content-center">
                        <label htmlFor="buttondisplay" className="font-bold block mb-2">
                            FechaRD:
                        </label>
                        <Calendar 
                        // value={date} 
                        // onChange={(e) => setDate(e.value)} 
                        showIcon />
                    </div>
                </div>
                <div className="col-12 md:col-5 lg:col-3">
                    <div className="mb-3 flex flex-column  justify-content-center">
                        <label htmlFor="buttondisplay" className="font-bold block mb-2">
                            CargaDocs:
                        </label>
                        <InputText
                            placeholder="CargaDocs"
                            disabled
                        />
                    </div>
                </div>
                <div className="col-12 md:col-5 lg:col-3">
                    <div className="mb-3 flex flex-column  justify-content-center">
                        <label htmlFor="buttondisplay" className="font-bold block mb-2">
                            DocEntry:
                        </label>
                        <InputText
                            placeholder="DocEntry"
                            disabled
                        />
                    </div>
                </div>
            </div>
            <Divider />

            <TableDT>


            </TableDT>



        </>
    )
}
