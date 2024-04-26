import { DataTable } from "primereact/datatable";
import React, { Children, useEffect, useRef, useState } from "react";
import { obtieneAprobadoresSL } from "../../../../../services/axios.service";
import { Column } from "primereact/column";

function Aprobaciones({
  solicitudRD,
  setSolicitudRD,
  adjuntos,
  setAdjuntos,
  children,
  fileUploadRef,
  changeFileTitle,
  solicitando,
  showError,
  estadosEditables,
  showSuccess,
  usuario,
  aprobadores,
  setAprobadores,
}) {
  const aprobBodyTemplate = (rowData) => {
    return (
      <>
        {rowData.finalizado == 1 ? (
          <i
            className="pi pi-check"
            style={{ fontSize: "1.5rem", color: "green" }}
          ></i>
        ) : aprobadores.filter(
            (e) => e.orden === rowData.orden && e.finalizado === 1
          ).length > 0 ? (
          <i className="pi pi-minus" style={{ fontSize: "1.5rem" }}></i>
        ) : (
          <i
            className="pi pi-minus"
            style={{ fontSize: "1.5rem", color: "#fab710" }}
          ></i>
        )}
      </>
    );
  };
  return (
    <div className="card">
      <DataTable
        value={aprobadores}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No se encontraron aprobadores"
      >
        <Column field="orden" header="Nivel"></Column>
        <Column field="aprobadorNombre" header="Usuario"></Column>
        <Column
          field="finalizado"
          header="Aprobado"
          body={aprobBodyTemplate}
        ></Column>
        <Column field="fechaRegistro" header="Fecha de Aprobación"></Column>
      </DataTable>
    </div>
  );
}

export default Aprobaciones;
