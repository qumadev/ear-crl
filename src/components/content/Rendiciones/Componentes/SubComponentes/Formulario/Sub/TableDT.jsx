import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React from 'react'

export default function TableDT(props) {


    return (
        <>


            <div className="card">
                <DataTable
                    // value={rendiciones}
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
                        header="Cod.
                            Arti/Serv"
                            style={{ width: "3rem" }}
                            className="font-bold"
                    ></Column>

                    <Column
                        header="Concepto"
                        style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>

                    <Column
                        header="Almacen"
                        style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>

                    <Column
                        header="Proyecto"
                          
                        style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Unidad de negocio"
                        style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Filial"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Areas"
                        style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Centro Costo"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Ind. Impuesto"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Precio"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Cantidad"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Impuesto"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>
                    <Column
                        header="Subtotal"
                         style={{ width: "3rem" }}
                        className="font-bold"
                    ></Column>


                </DataTable>
            </div>
        </>
    )
}
