
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
import Rendiciones from '../../../Rendiciones';


export default function FormDT({ responsiveSizeMobile, rowData }) {
  const navigate = useNavigate();
  const { usuario, showError, ruta } = useContext(AppContext);

  console.log("pruebas", rowData)
  let emptyProduct = {
    STR_ITEM: {
      ItemCode: null,
      ItemName: null,
      U_BPP_TIPUNMED: null,
      WhsCode: null,
      Stock: 0,
    },


    STR_CANTIDAD: 0,
    STR_COSTO: 0,

    STR_FECHAREQ: new Date(),
    STR_PROVEEDOR: { CardName: null, LicTradNum: null },
    STR_PROYECTO: { id: null, name: null },


    STR_DIM1: { id: null, name: null },
    STR_DIM2: { id: null, name: null },
    STR_DIM3: { id: null, name: null },
    STR_DIM4: { id: null, name: null },
    STR_DIM5: { id: null, name: null },
    STR_COMENTARIO: null,
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
              value=''
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

      <Rendiciones
        emptyProduct={emptyProduct}
      >

      </Rendiciones>



    </>
  )
}
