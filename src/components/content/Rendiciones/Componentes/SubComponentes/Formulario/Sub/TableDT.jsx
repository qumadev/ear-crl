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
                    tableStyle={{ minWidth: "12rem" }}
                // header={header}
                // loading={loading}
                >
                    <Column
                        header="#"
                        headerStyle={{ width: "3rem" }}
                    // body={(data, options) => options.rowIndex + 1}
                    ></Column>

                    <Column
                        header="codigo"
                        headerStyle={{ width: "3rem" }}
                    // body={(data, options) => options.rowIndex + 1}
                    ></Column>
                    <Column
                        header="dato2"
                        headerStyle={{ width: "3rem" }}
                    // body={(data, options) => options.rowIndex + 1}
                    ></Column>
                                        <Column
                        header="data3"
                        headerStyle={{ width: "3rem" }}
                    // body={(data, options) => options.rowIndex + 1}
                    ></Column>


                </DataTable>
            </div>
        </>
    )
}
