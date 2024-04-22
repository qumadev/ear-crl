import { Checkbox } from '@mui/material';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useContext, useEffect, useState } from 'react';
import { obtenerAreas, obtenerArticulos, obtenerCentroCosto, obtenerFilial, obtenerMotivos, obtenerProveedores, obtenerProyectos, obtenerTipos, obtenerUnidadNegocio } from '../../../../../../services/axios.service';
import { Calendar } from 'primereact/calendar';
import FormDetalleDocumento from './FormDetalleDocumento';
import { Navigate, useParams } from 'react-router-dom';


function DocumentoSustentado() {

    const { usuario,ruta } = useContext(AppContext);


    const { id } = useParams()


    const addDocumentSustentado = () => {
        Navigate(ruta + "/rendiciones/ver");
     }

    

    return (
        <div>
            <h1>Rendicion {id}:</h1>
            <Button
                className='col-6'
                label="Agregar Documento Sustentado"
                onClick={addDocumentSustentado}
            />
            <div className="col-12 md:col-6 lg:col-12">
                <div className="mb-3 flex flex-column">

                    <DataTable
                        value={articulos}
                        sortMode="multiple"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: "12rem" }}
                        header="Detalle de Rendicion"
                    // loading={loading}
                    >
                        <Column
                            header="N°"
                            headerStyle={{ width: "3rem" }}
                        // body={(data, options) => options.rowIndex + 1}
                        >
                        </Column>
                        <Column
                            field="Cod"
                            header="Cod. Articulo/Servicio"
                            style={{ width: "3rem" }}
                            className="font-bold"
                        ></Column>
                        <Column
                            field="Concepto"
                            header="Concepto"
                            style={{ minWidth: "12rem" }}
                        ></Column>
                        <Column
                            field="Almacen"
                            header="Almacen"
                            style={{ minWidth: "8rem" }}
                        // body={statusBodyTemplate}
                        ></Column>
                        <Column
                            field="Proyecto"
                            header="Proyecto"
                            style={{ minWidth: "5rem" }}
                        ></Column>
                        <Column
                            field="UnidadNegocio"
                            header="Unidad de Negocio"
                            style={{ minWidth: "8rem" }}
                        ></Column>
                        <Column
                            field="Filial"
                            header="Filial"
                            style={{ minWidth: "10rem" }}
                        // body={fecBodyTemplate}
                        ></Column>
                        <Column
                            field="Areas"
                            // body={priceBodyTemplate}
                            header="Areas"
                            style={{ minWidth: "12rem" }}
                        ></Column>
                        <Column
                            field="CentroCosto"
                            header="Centro Costo"
                            style={{ minWidth: "10rem" }}
                        // body={fecBodyTemplate}
                        ></Column>
                        <Column
                            field="IndImpuesto"
                            header="Ind. Impuesto"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Precio"
                            header="Precio"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Cantidad"
                            header="Cantidad"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Impuesto"
                            header="Impuesto"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                    </DataTable>

                </div>
            </div>

        </div>
    );
}

export default DocumentoSustentado;