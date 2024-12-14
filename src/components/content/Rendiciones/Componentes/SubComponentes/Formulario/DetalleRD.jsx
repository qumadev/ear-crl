import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Row } from "primereact/row";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import { FormDetalle } from "./FormDetalle";
import { obtenerSolicitudDet } from "../../../../../../services/axios.service";

function DetalleRD({
  setDetalles,
  detalles,
  moneda,
  setDocumento,
  selectedOptionDefault,
  complementoOptionDefault,
  showSuccess,
  showError,
  setLoading,
  items,
  proyectos,
  indicadores,
  cups,
  setCups,
  centroCosto,
  idDetalle,
  almacen,
  tpoOperacion,
  documentoId,
  editable,
}) {
  const [submitted, setSubmitted] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [selectedDetalles, setSelectedDetalles] = useState(null);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [detalleSolicitud, setDetalleSolicitud] = useState({});
  const dt = useRef(null);

  let emptyProduct = {
    ID: null,
    STR_CODARTICULO: {
      id: null,
      name: null,
      POSFINANCIERA: null,
    },
    STR_SUBTOTAL: 0.0,
    STR_INDIC_IMPUESTO: indicadores[1],
    STR_PROYECTO: {
      id: null,
      name: null,
    },
    STR_CENTCOSTO: centroCosto[0],
    posFinanciera: null,
    STR_CUP: {
      id: null,
      name: null,
    },
    STR_ALMACEN: almacen,
    STR_CANTIDAD: 1,
    STR_TPO_OPERACION: tpoOperacion,
  };

  const monedas = [
    {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "SOL",
      name: "SOL",
    },
    {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "USD",
      name: "USD",
    },
    { Descripcion: null, Id: 0, Nombre: null, id: "EUR", name: "EUR" },
  ];

  const [detalle, setDetalle] = useState(emptyProduct);

  const selectedOptionTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.name}</span>;
  };

  const complementoOptionTemplate = (option) => {
    return (
      <div className="flex">
        <div>{option.name}</div>
      </div>
    );
  };

  const editDetalle = (detalle) => {
    setDetalle({ ...detalle });
    setProductDialog(true);
  };

  const confirmDeleteDetalle = (detalle) => {
    setDetalle(detalle);
    setDeleteProductDialog(true);
  };

  const formatCurrency = (value) => {
    let modeloCurrency =
      moneda.name == "SOL" ? "en-PE" : moneda.name == "EUR" ? "de-DE" : "en-US";
    return value.toLocaleString(modeloCurrency, {
      style: "currency",
      currency: moneda.name,
    });
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.STR_SUBTOTAL);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => editDetalle(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteDetalle(rowData)}
          disabled={editable}
        />
      </React.Fragment>
    );
  };

  const openNew = () => {
    setDetalle(emptyProduct);
    //obtenerCentroCostoLocal();
    setSubmitted(false);
    setProductDialog(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2 align-items-center">
        <Button
          label="Agregar"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
          disabled={editable}
          // disabled={
          //   solicitudRD.ordenDeViaje |
          //   (solicitudRD.tipoear == null) |
          //   !estadosEditables.includes(solicitudRD.estado)
          // }
        />
        <label style={{ color: "red" }}>
          {/* {solicitudRD.ordenDeViaje == true
            ? "No se permite subir Articulos con orden de viaje"
            : false} */}
        </label>
      </div>
    );
  };

  const totalColumns = () => {
    let total = 0;

    for (let sale of detalles) {
      total += sale.STR_SUBTOTAL;
    }

    return formatCurrency(total);
  };

  async function obtenerSolicitudDetLocal() {
    let response = await obtenerSolicitudDet(idDetalle);

    if (response.data.CodRespuesta != "99") {
      setDetalleSolicitud(response.data.Result);
    } else {
      showError(response.data.DescRespuesta);
    }
  }

  useEffect(() => {
    obtenerSolicitudDetLocal();
  }, []);

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
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Moneda</label>
            <div className="card flex">
              <Dropdown
                value={moneda}
                onChange={(e) =>
                  setDocumento((prevDocumento) => ({
                    ...prevDocumento,
                    STR_MONEDA: e.target.value,
                  }))
                }
                options={monedas}
                optionLabel="name"
                placeholder="Selecciona Moneda"
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full md:w-14rem"
                disabled={editable}
                //disabled={!estadosEditables.includes(solicitudRD.estado)}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="card">
          <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
          <DataTable
            ref={dt}
            value={detalles}
            tableStyle={{ minWidth: "50rem" }}
            selection={selectedDetalles}
            onSelectionChange={(e) => setSelectedDetalles(e.value)}
            sortOrder={1}
            sortMode="single"
            footerColumnGroup={footerGroup}
            disabled={editable}
          >
            <Column
              header="#"
              headerStyle={{ width: "3rem" }}
              body={(data, options) => options.rowIndex + 1}
            ></Column>
            <Column field="STR_CODARTICULO.id" header="Cod Árticulo"></Column>
            <Column field="STR_CODARTICULO.name" header="Concepto"></Column>
            <Column
              field="STR_SUBTOTAL"
              header="Totales"
              sortable
              body={priceBodyTemplate}
            ></Column>
            <Column
              field="STR_INDIC_IMPUESTO.id"
              header="Indicador de Impuesto"
              //body={centCostoTemplate}
            ></Column>
            <Column field="STR_PROYECTO.id" header="Proyecto"></Column>
            <Column
              field="STR_CENTCOSTO.CostCenter"
              header="Centro de Costo"
            ></Column>
            <Column
              field="STR_CODARTICULO.posFinanciera"
              header="Posición Financiera"
            ></Column>
            <Column field="STR_CUP.U_CUP" header="CUP"></Column>
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "12rem" }}
            ></Column>
          </DataTable>
        </div>
        <FormDetalle
          submitted={submitted}
          setSubmitted={setSubmitted}
          setProductDialog={setProductDialog}
          setDeleteProductDialog={setDeleteProductDialog}
          productDialog={productDialog}
          selectedOptionDefault={selectedOptionDefault}
          complementoOptionDefault={complementoOptionDefault}
          detalle={detalle}
          setDetalle={setDetalle}
          setDetalles={setDetalles}
          detalles={detalles}
          deleteProductDialog={deleteProductDialog}
          showSuccess={showSuccess}
          showError={showError}
          setLoading={setLoading}
          items={items}
          emptyProduct={emptyProduct}
          proyectos={proyectos}
          moneda={moneda.name}
          indicadores={indicadores}
          cups={cups}
          setCups={setCups}
          centroCosto={centroCosto}
          detalleSolicitud={detalleSolicitud}
          setDocumento={setDocumento}
          documentoId={documentoId}
          editable={editable}
        />
      </div>
    </>
  );
}

export default DetalleRD;
