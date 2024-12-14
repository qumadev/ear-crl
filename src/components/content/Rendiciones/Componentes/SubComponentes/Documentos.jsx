import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { SplitButton } from "primereact/splitbutton";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import {
  borrarDocumento,
  consultaComprobante,
} from "../../../../../services/axios.service";
import { Toast } from "primereact/toast";
import { AppContext } from "../../../../../App";

export function Documentos({
  header,
  loading,
  documentos,
  idRendicion,
  empAsignado,
  idDetalle,
  rendicion,
  almacen,
  setRendicion,
  setLoading,
  showSuccess,
  showError,
  obtenerRendicionLocal,
  handleConsultSunat,
  borrarDocumentoLocal,
  loadingBtn,
  ValidaEditable,
  editable,
  fechaSolicitud,
}) {
  const navigate = useNavigate();
  const [selectDocs, setSelectDocs] = useState([]);
  const { ruta } = useContext(AppContext);
  /* Templates  */
  const docBodyTemplate = (rowData) => {
    return (
      <>
        {rowData.STR_TIPO_DOC?.id}-{rowData.STR_SERIE_DOC}-
        {rowData.STR_CORR_DOC}
      </>
    );
  };

  const fecBodyTemplate = (rowData) => {
    // const memoizedFecha = useMemo(() => {
    //   const parts = rowData.STR_FECHA_DOC.split(" ");
    //   const dateParts = parts[0].split("/");
    //   const timeParts = parts[1].split(":");
    //   return new Date(
    //     parseInt(dateParts[2], 10),
    //     parseInt(dateParts[1], 10) - 1,
    //     parseInt(dateParts[0], 10),
    //     parseInt(timeParts[0], 10),
    //     parseInt(timeParts[1], 10),
    //     parseInt(timeParts[2], 10)
    //   );
    // }, [rowData.STR_FECHA_DOC]);

    return <>{rowData.STR_FECHA_DOC}</>;
  };

  const formatCurrency = (value, moneda) => {
    let modeloCurrency =
      moneda == "SOL" ? "en-PE" : moneda == "EUR" ? "de-DE" : "en-US";

    return value.toLocaleString(modeloCurrency, {
      style: "currency",
      currency: moneda,
    });
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.STR_TOTALDOC, rowData.STR_MONEDA.name);
  };
  /* --- */

  const validSUNATTemplate = (rowData) => {
    if (rowData.STR_VALIDA_SUNAT == true) {
      return (
        <div className="flex justify-content-center">
          <i className="pi pi-check" style={{ color: "green" }}></i>
        </div>
      );
    } else {
      return (
        <div className="flex justify-content-center">
          {" "}
          <i className="pi pi-times" style={{ color: "red" }}></i>{" "}
        </div>
      );
    }
  };

  const actionBodyTemplate = (rowData) => {
    let items = [];
    if (!editable) {
      items = [
        {
          label: "Modificar",
          icon: "pi pi-file-edit",
          command: () => {
            navigate(ruta + `/rendiciones/${idRendicion}/documentos/editar`, {
              state: {
                idDocumento: rowData.ID,
                empleadoAsignado: empAsignado,
                idDetalle: idDetalle,
                tipoRendicion: rendicion,
                almacen: almacen,
                fechaSolicitud: fechaSolicitud,
              },
            });
          },
        },
        {
          label: "Eliminar",
          icon: "pi pi-delete-left",
          command: async () => {
            try {
              const promises = [];
              if (selectDocs.length === 0) {
                promises.push(
                  borrarDocumentoLocal(rowData.ID, idRendicion, false)
                );
              } else {
                //showSuccess("Se consulta ante SUNAT");
                selectDocs.forEach((e) => {
                  promises.push(borrarDocumentoLocal(e.ID, idRendicion, false));
                });
              }
              await Promise.all(promises);
            } catch (error) {
            } finally {
              obtenerRendicionLocal();
            }

            //borrarDocumentoLocal(rowData.ID, idRendicion);
          },
        },
        {
          label: "Consultar a SUNAT",
          icon: "pi pi-search",
          command: async () => {
            try {
              const promises = [];
              if (selectDocs.length === 0) {
                promises.push(
                  handleConsultSunat(
                    rowData.STR_FECHA_DOC,
                    rowData.STR_TIPO_DOC?.id,
                    rowData.STR_SERIE_DOC,
                    rowData.STR_CORR_DOC,
                    rowData.STR_TOTALDOC,
                    rowData.STR_PROVEEDOR?.LicTradNum,
                    rowData.ID
                  )
                );
              } else {
                //showSuccess("Se consulta ante SUNAT");
                selectDocs.forEach((e) => {
                  promises.push(
                    handleConsultSunat(
                      e.STR_FECHA_DOC,
                      e.STR_TIPO_DOC?.id,
                      e.STR_SERIE_DOC,
                      e.STR_CORR_DOC,
                      e.STR_TOTALDOC,
                      e.STR_PROVEEDOR?.LicTradNum,
                      e.ID
                    )
                  );
                });
              }
              await Promise.all(promises);
            } catch (error) {
            } finally {
              obtenerRendicionLocal();
            }
          },
        },
      ];
    }
    
    return (
      <React.Fragment>
        <SplitButton
          label="Ver"
          onClick={() =>
            navigate(ruta + `/rendiciones/${idRendicion}/documentos/editar`, {
              state: {
                idDocumento: rowData.ID,
                empleadoAsignado: empAsignado,
                idDetalle: idDetalle,
                tipoRendicion: rendicion,
                almacen: almacen,
                editable: editable,
                fechaSolicitud: fechaSolicitud,
              },
            })
          }
          icon="pi pi-plus"
          model={items}
          loading={loadingBtn}
          rounded
        />
      </React.Fragment>
    );
  };

  const totalColumns = () => {
    //setLoading(true);
    let total = 0;
    let moneda = documentos[0].STR_MONEDA.name;

    for (let sale of documentos) {
      total += sale.STR_TOTALDOC;
    }
    return formatCurrency(total, moneda);
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Totales:"
          colSpan={3}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={totalColumns} />
      </Row>
    </ColumnGroup>
  );

  return (
    <>
      <div>
        <DataTable
          value={documentos}
          sortMode="multiple"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "12rem" }}
          header={header}
          loading={loading}
          emptyMessage="No se encontraron documentos registrados"
          selection={selectDocs}
          onSelectionChange={(e) => setSelectDocs(e.value)}
          //dataKey="STR_CORR_DOC"
          // footerColumnGroup={footerGroup}
        >
          {" "}
          {!ValidaEditable && (
            <Column selectionMode="multiple" exportable={false}></Column>
          )}
          <Column
            header="#"
            headerStyle={{ width: "3rem" }}
            body={(data, options) => options.rowIndex + 1}
          ></Column>
          <Column
            field="STR_CORR_DOC"
            header="N° de Documento"
            style={{ width: "10rem" }}
            //className="font-bold"
            body={docBodyTemplate}
          ></Column>
          <Column
            field="STR_TIPO_DOC.name"
            header="Tipo de Documento"
            style={{ width: "10rem" }}
          ></Column>
          <Column
            field="STR_FECHA_DOC"
            header="Fecha del Documento"
            style={{ minWidth: "2rem" }}
            body={fecBodyTemplate}
            sortable
          ></Column>
          <Column
            field="STR_TOTALDOC"
            header="Monto Rendido"
            style={{ minWidth: "5rem" }}
            body={priceBodyTemplate}
            sortable
          ></Column>
          <Column
            field="STR_PROVEEDOR.CardName"
            header="Proveedor"
            style={{ minWidth: "8rem" }}
          ></Column>
          <Column
            header="Acciones"
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "10rem" }}
            frozen
            alignFrozen="right"
          ></Column>
          <Column
            header="Existe en SUNAT?"
            body={validSUNATTemplate}
            exportable={false}
            style={{ minWidth: "10rem" }}
            frozen
            alignFrozen="right"
          ></Column>
          {/* //<Columnas /> */}
        </DataTable>
      </div>
    </>
  );
}
