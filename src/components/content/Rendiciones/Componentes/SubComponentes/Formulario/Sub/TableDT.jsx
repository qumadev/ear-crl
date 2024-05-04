import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../../../../../../App'
import { SplitButton } from 'primereact/splitbutton'

export default function TableDT({
    rendicion,
    setRendicion,

}) {
    // console.log("pr", rendicion?.documentos)

    const navigate = useNavigate();
    const { usuario, ruta } = useContext(AppContext);

    const items= [

        {
            label: 'Editar',
            icon: 'pi pi-external-link',
            command: () => {
                navigate(ruta+`/rendiciones/${documentos.ID}/documentos/detail`)
                // window.location.href = `/rendiciones/${rendicion.ID}/documentos/detail`;
            }
        },

    ];
    const actionverDoc= (documentos) => {
        const items = [
            {
              label: "Editar",
              icon: "pi pi-pencil",
              command: () => {
                navigate(
                  ruta +
                  `/rendiciones/${documentos.ID}/documentos/editar`
                );
              },
            },
          ];
        return (
            <div className="split-button">
              <Button
                onClick={() => {
                  navigate(
                    ruta +
                      `/rendiciones/${documentos.ID}/documentos/detail`
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






        // <SplitButton
        
        // label="ver"
        // icon="pi pi-eye"
        // onClick={() => {
        //         navigate(ruta + 
        //                 `/rendiciones/${documentos.ID}/documentos/detail`);
        //           }} 
        //           model={items}

        // />

        // <Button
        //   label="ver"
        //   icon="pi pi-eye"
        //   severity="success"
        //   onClick={() => {
        //     navigate(ruta + 
        //         `/rendiciones/${documentos.ID}/documentos/detail`);
        //   }}

        // />


      
    }

    //exportar po excel 

      
    return (
        <>


            <div className="card">
                <DataTable
                    value={rendicion?.documentos}
                    sortMode="multiple"
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    tableStyle={{ minWidth: "100rem" }}
                    // header={header}
                    emptyMessage="No se encontro Data"
                >
                    <Column
                        header="#"
                        headerStyle={{ width: "3rem" }}
                        body={(data, options) => options.rowIndex + 1}
                    ></Column>

                    <Column

                        header="N° documentado"
                        field="ID"
                        style={{ width: "3rem" }}
                        
                    ></Column>

                    <Column
                        field='STR_TIPO_DOC.name'
                        header="Tipo"
                        style={{ width: "3rem" }}
                        
                    ></Column>

                    <Column
                        field='STR_FECHA_DOC'
                        header="Fecha del Documento"
                        style={{ width: "3rem" }}
                        
                    ></Column>

                    <Column
                        field='STR_TOTALDOC'
                        header="Monto Rendido"

                        style={{ width: "3rem" }}
                        
                    ></Column>
                    <Column
                        field='STR_PROVEEDOR.CardName'
                        header="Proveedor"
                        style={{ width: "3rem" }}
                        
                    ></Column>
                    <Column
                        field='STR_COMENTARIOS'
                        header="Comentario"
                        style={{ width: "3rem" }}
                        
                    ></Column>
                    <Column
                        header="Estado"
                        style={{ width: "3rem" }}
                        
                    ></Column>
                    <Column
                        header="Acciones"
                        style={{ width: "3rem" }}
                        body={actionverDoc}
                        exportable={false}
                     
                        frozen
                        alignFrozen="right"
                    ></Column>



                </DataTable>
            </div>
        </>
    )
}
