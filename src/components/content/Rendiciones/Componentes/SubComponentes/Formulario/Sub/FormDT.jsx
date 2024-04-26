
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import React, { useContext } from 'react'

import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';

import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../../../../../../App';
import Rendiciones from '../../../Rendiciones';
import { obtenerRendicion } from '../../../../../../../services/axios.service';
import { useState } from 'react';
import { useEffect } from 'react';
import TableDT from './TableDT';
import { setDate } from 'date-fns';
import { Calendar } from 'primereact/calendar';


export default function FormDT({   editable,
  fechaSolicitud,responsiveSizeMobile, rowData 
})

{
  const navigate = useNavigate();
  const { usuario, showError, ruta } = useContext(AppContext);

  const { id } = useParams()

  const [rendicion, setRendicion] = useState(null)
  async function obtenerData() {
    const response = await
      obtenerRendicion(id);

    const documentos = response.data.Result[0]?.documentos|| [];

    const documentosFormateados= documentos.map(doc=>({
      ID: doc.ID,
      STR_TIPO_DOC:doc.STR_TIPO_DOC,
      STR_FECHA_DOC:doc.STR_FECHA_DOC,
      STR_TOTALDOC:doc.STR_TOTALDOC,
 
      STR_PROVEEDOR: doc.STR_PROVEEDOR,
      STR_COMENTARIOS: doc.STR_COMENTARIOS,
    }))
    console.log(response.data.Result[0])

    setRendicion({ ...response.data.Result[0], documentos: documentosFormateados });
  }
  const fecBodyTemplate = (rowData) => {

    return <>{rowData.STR_FECHAREGIS}</>;
  };

  useEffect(() => {
    obtenerData();
  }, []);
 console.log("fecha",rendicion?.SOLICITUDRD.STR_FECHAREGIS)
 
  return (


    <>
      <div className="flex justify-content-between flex-wrap">
        <div
          className={`flex ${responsiveSizeMobile ? `text-xl` : `text-2xl`
            } align-items-center`}>
          Redincion info
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
            <Calendar
            value={fecBodyTemplate}

            // onChange={(e)=>setRendicion((prevDetalle)=>({
            // ...prevDetalle,STR_FECHAREGIS:e.target.value
            // }))}

            dateFormat="dd/mm/yy"
            disabled={editable}
            // minDate={getFechaLargo(fechaSolicitud)}
              locale='es'
              showIcon />
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

      <TableDT
      rendicion={rendicion}
    
      >
          
      </TableDT>


    </>
  )
}
