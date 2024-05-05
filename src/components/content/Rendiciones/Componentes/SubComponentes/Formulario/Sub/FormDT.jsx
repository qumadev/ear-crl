
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
  enviarAprobRendicion
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


export default function FormDT({ editable,
  fechaSolicitud, responsiveSizeMobile, rowData
}) {
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const [excel, setExcel] = useState();
  const [rendicion, setRendicion] = useState(null)

  const estadosEditablesUsr = [8, 9, 12];

  async function obtenerData(fresh = false) {
    if (!fresh) setLoading(true);
    try {
      const response = await obtenerRendicion(id);
      const documentos = response.data.Result[0]?.documentos || [];
      const documentosFormateados = documentos.map(doc => ({
        ID: doc.ID,
        STR_TIPO_DOC: doc.STR_TIPO_DOC,
        STR_FECHA_DOC: doc.STR_FECHA_DOC,
        STR_TOTALDOC: doc.STR_TOTALDOC,
        STR_PROVEEDOR: doc.STR_PROVEEDOR,
        STR_COMENTARIOS: doc.STR_COMENTARIOS,
      }))

      setRendicion({ ...response.data.Result[0], documentos: documentosFormateados });
      console.log(rendicion?.STR_ESTADO)

    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
    } finally {
      if (!fresh) setLoading(false);
    }
  }

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
        rendicion.ID, rendicion.SOLICITUDRD.ID, usuario.usuarioId,
        rendicion.STR_ESTADO, usuario.branch
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
    console.log("validacion")
    confirm1();
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
          <Button
            className='mr-2'
            label={"Solicitar Aprobación"}
            size="large"
            onClick={(e) => {
              ValidacionEnvio();
            }}
          // loading={loadingBtn}
          // disabled={validaEditable}
          />
          {/* <Button
                    className='col-6 md:col-6 lg:col-12 flex align-items-center gap-5'
                    icon="pi pi-trash"
                    label=""
                    // onClick={() => { }}
                /> */}
          <Button
            label={"Aceptar aprobación"}
            size="large"
            onClick={(e) => {
              confirmAceptacion();
            }}
            loading={loadingBtn}
          // disabled={validaEditableBtn}
          />
        </div>
      </div>
    )
  }

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
    const data = rendicion?.documentos.map((doc) => ({
      "N° documentado": doc.ID ?? "",
      "Tipo": doc.STR_TIPO_DOC.name ?? "",
      "Fecha del Documento": doc.STR_FECHA_DOC ?? "",
      "Monto Rendido": doc.STR_TOTALDOC ?? "",
      "Proveedor": doc.STR_PROVEEDOR.CardName ?? "",
      "Comentario": doc.STR_COMENTARIOS ?? "",
      // "Estado": doc.ESTADO ?? "",
    }));
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet1");
    XLSX.writeFile(workBook, "export.xlsx");
  };


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
            onClick={() => {
              exportExcel();
            }}
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
              value={rendicion?.STR_ESTADO}
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
              value={rendicion?.STR_TOTALRENDIDO}
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
            <InputText
              value={rendicion?.STR_FECHAREGIS}
              disabled
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
              // value={rendicion?.}
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
              value={rendicion?.STR_DOCENTRY}
              placeholder="DocEntry"
              disabled
            />
          </div>
        </div>
      </div>
      <Divider />

      <div className="card flex flex-wrap  gap-3 mx-3">

        {/* Botones por rol */}
        {
          usuario.rol?.id === "2" && rendicion?.STR_ESTADO === 10 ? (
            <Button
              label="Revertir Aprobación"
              size="large"
              onClick={() => confirmReversion(rendicion?.ID)}
            // disabled={
            //   !estadosEditables.includes(solicitudRD.STR_ESTADO) | loading
            // }
            />
          ) :

            usuario.rol?.id == "3" ? (
              <Button
                label="Autorizar Edicion"
                severity="danger"
                size="large"
                onClick={() => confirmAutorizarReversion(rendicion?.ID)}
              // disabled={
              //   (solicitudRD.STR_ESTADO > 3) | (solicitudRD.STR_ESTADO == 1)
              // }
              />
            ) : ""}
      </div>
      <TableDT
        rendicion={rendicion}
      >
      </TableDT>
      <Divider />
      <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
    </>
  )
}
