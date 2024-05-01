
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import React, { useContext, useRef } from 'react'

import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';

import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../../../../../../App';
import Rendiciones from '../../../Rendiciones';
import { obtenerRendicion,autorizarReversionAprobRendicion,
  revertirAprobRendicion,validacionDocumento,
  enviarAprobRendicion } 
from '../../../../../../../services/axios.service';
import { useState } from 'react';
import { useEffect } from 'react';
import TableDT from './TableDT';
import { setDate } from 'date-fns';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";


export default function FormDT({ editable,
  fechaSolicitud, responsiveSizeMobile, rowData
}) {
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);

  const { id } = useParams();
  const toast = useRef(null);
  const [rendicion, setRendicion] = useState(null)
  const [loading, setLoading] = useState(false);

  async function obtenerData() {
    const response = await
    obtenerRendicion(id);
    const documentos = response.data.Result[0]?.documentos || [];
    const documentosFormateados = documentos.map(doc => ({
      ID: doc.ID,
      STR_TIPO_DOC: doc.STR_TIPO_DOC,
      STR_FECHA_DOC: doc.STR_FECHA_DOC,
      STR_TOTALDOC: doc.STR_TOTALDOC,
      STR_PROVEEDOR: doc.STR_PROVEEDOR,
      STR_COMENTARIOS: doc.STR_COMENTARIOS,
    }))
    // console.log(response.data.Result[0])
    setRendicion({ ...response.data.Result[0], documentos: documentosFormateados });
  }

  const fecBodyTemplate = (rendicion) => {

    return <>{rendicion.STR_FECHAREGIS}</>;
  };

  useEffect(() => {
    obtenerData();
  }, []);
  // console.log("fecha", rendicion?.SOLICITUDRD.STR_FECHAREGIS)

  // enviando solicitud
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
        rendicion.ID,rendicion.SOLICITUDRD.ID,usuario.usuarioId,
        rendicion.STR_ESTADO,usuario.branch
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
      accept,
      //reject,
    });
  };
  //Solicitar Aprobacion
  const [loadingBtn, setLoadingBtn] = useState(false);
  async function ValidacionEnvio() {
    // const todosValidados = rendicion.documentos.every(
    //   (doc) => doc.STR_VALIDA_SUNAT === true
    // );
    // if (todosValidados) {
    console.log("user: ",usuario)
    confirm1();
      // let todosDocumentosValidos = true;
      // for (const e of rendicion.documentos) {
      //   try {
      //     setLoadingBtn(true);
      //     console.log(e);
      //     const response = await validacionDocumento(e.ID);
      //     if (response.status !== 200) {
      //       showError(response.Message);
      //       todosDocumentosValidos = false;
      //     }
      //   } catch (error) {
      //     console.log(error.response.data.Message);
      //     showError(error.response.data.Message);
      //     todosDocumentosValidos = false;
      //   }
      // }
      // if (todosDocumentosValidos) {
      //   confirm1();
      // }
      // setLoadingBtn(false);
    // } else {
    //   showError("Tienes que tener todos los documentos validados ante SUNAT");
    // }
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
          {usuario.rol?.id==="1" ? 
              <Button
                className='col-12 md:col-12 lg:col-12'
                label={"Solicitar Aprobación"}
                onClick={(e) => {
                  ValidacionEnvio();
                }}
                // loading={loadingBtn}
                // disabled={validaEditable}
              />
            :
              ""
          }
          {/* <Button
                    className='col-6 md:col-6 lg:col-12 flex align-items-center gap-5'
                    icon="pi pi-trash"
                    label=""
                    // onClick={() => { }}
                /> */}
        </div>
      </div>
    )
  }
  // messages toast
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
  // autorizar
  async function autorizarReversionLocal(rendicionId) {
    setLoading(true);
    try {
      let response = await autorizarReversionAprobRendicion(
        rendicionId
      );
      if (response.status < 300) {
        let body = response.data.Result[0];
        showSuccess(`Se autorizo la reversion de la rendición`);
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      setTimeout(() => {
        setLoading(false);
        navigate(ruta + "/rendiciones");
      }, 1500);
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



  // reversion
  async function ReversionAprobacionLocal(rendicionId) {
    setLoading(true);
    try {
      let response = await revertirAprobRendicion(
        rendicionId
      );
      if (response.status < 300) {
        let body = response.data.Result[0];
        showSuccess(`Se revertio la aprobacion de la rendición`);
      } else {
        console.log(response.Message);
        showError(response.Message);
      }
    } catch (error) {
      console.log(error.response.data.Message);
      showError("Error interno");
    } finally {
      setTimeout(() => {
        setLoading(false);
        navigate(ruta + "/rendiciones");
      }, 1500);
    }
  }

  const confirmReversion = (id) => {
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
    });
  };
  return (
    <>
      <Toast ref={toast}/>
      <ConfirmDialog/>
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
              navigate(ruta +
                `/rendiciones/${rendicion?.ID}/documentos/agregar`);
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
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column  justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Estado:
            </label>
            <InputText
              value={rendicion?.STR_ESTADO}
              placeholder="Estado"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column justify-content-center">
            <label htmlFor="buttondisplay" className="font-bold block mb-2">
              Monto Rendido:
            </label>
            <InputText
              value={rendicion?.STR_TOTALRENDIDO}
              placeholder=" N° Rendición"
              disabled
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
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
        <div className="col-12 md:col-6 lg:col-3">
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
        </div>
        <div className="col-12 md:col-6 lg:col-3">
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
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 mx-1 mb-2">
        {/* Botones por rol */}
        {usuario.rol?.id == "2" ? (
          <Button
            label="Revertir Aprobación"
            size="large"
            onClick={()=>confirmReversion(rendicion?.ID)}
            // disabled={
            //   !estadosEditables.includes(solicitudRD.STR_ESTADO) | loading
            // }
          />
        ) : usuario.rol?.id == "3" ? (
          <Button
            label="Autorizar Edicion"
            severity="danger"
            size="large"
            onClick={()=>confirmAutorizarReversion(rendicion?.ID)}
            // disabled={
            //   (solicitudRD.STR_ESTADO > 3) | (solicitudRD.STR_ESTADO == 1)
            // }
          />
        ) : ""}
      </div>

      <Divider />

      <TableDT
        rendicion={rendicion}
      >
      </TableDT>



      <Divider />
      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>



    </>
  )
}
