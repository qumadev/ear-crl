import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import FormDetalle from "./FormDetalle";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import {
  consultarPresupuesto,
  eliminarDetalleSolicitud,
  obtenerCentroCosto,
  obtenerItems,
  obtenerTipoViaticos,
} from "../../../../../services/axios.service";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

function DetalleSL({
  solicitudRD,
  setSolicitudRD,
  usuario,
  nOrden,
  setNorden,
  detalles,
  setDetalles,
  solicitando,
  showSuccess,
  showError,
  setLoading,
  estadosEditables,
  viaticos,
}) {
  // let emptyProduct = {
  //   articulo: {
  //     id: null,
  //     name: null,
  //   },
  //   centCostos: null,
  //   posFinanciera: {
  //     id: null,
  //     name: null,
  //   },
  //   cup: null,
  //   cantidad: 1,
  //   precioUnitario: 0.0,
  //   precioTotal: 0.0,
  //   NumOrden: null,
  //   CodArticulo: null,
  //   NomArticulo: null,
  //   CentroCosto: null,
  //   presupuesto: 0.0,
  // };

  //const [detalle, setDetalle] = useState(emptyProduct);

  const [submitted, setSubmitted] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [centCostosOpt, setCentCostos] = useState([]);

  //const [product, setProduct] = useState(emptyProduct);
  const [selectedDetalles, setSelectedDetalles] = useState(null);
  const [items, setItems] = useState([]);

  const [productDialog, setProductDialog] = useState(false);

  // Presupuesto
  //const [presupuesto, setPresupuesto] = useState(0.0);

  const dt = useRef(null);

  const monedas = [
    {
      name: "SOL",
    },
    {
      name: "USD",
    },
    {
      name: "EUR",
    },
  ];

  const selectedOptionTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const complementoOptionTemplate = (option) => {
    return (
      <div className="flex">
        <div>{option.name}</div>
      </div>
    );
  };

  const openNew = () => {
    setDetalle(emptyProduct);
    //obtenerCentroCostoLocal();
    setSubmitted(false);
    setProductDialog(true);
  };

  const editDetalle = (detalle) => {
    console.log(detalle);
    setDetalle({ ...detalle, cup: detalle.cup });
    setProductDialog(true);
  };

  const confirmDeleteDetalle = (detalle) => {
    setDetalle(detalle);
    setDeleteProductDialog(true);
  };

  const formatCurrency = (value) => {
    let modeloCurrency =
      solicitudRD.moneda.name == "SOL"
        ? "en-PE"
        : solicitudRD.moneda.name == "EUR"
        ? "de-DE"
        : "en-US";

    return value.toLocaleString(modeloCurrency, {
      style: "currency",
      currency: solicitudRD.moneda.name,
    });
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.precioTotal);
  };

  const presupuestoTemplate = (rowData) => {
    return (
      <div
        style={
          rowData.presupuesto > 0 ? { color: "#4CAF50" } : { color: "#FF0B0B" }
        }
      >
        {rowData.presupuesto < 1
          ? 0.0
          : Math.abs(parseFloat(rowData.presupuesto)).toFixed(2)}
      </div>
    );
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
          disabled={
            (usuario.TipoUsuario != 1) |
            !estadosEditables.includes(solicitudRD.estado)
          }
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteDetalle(rowData)}
          disabled={
            (usuario.TipoUsuario != 1) |
            !estadosEditables.includes(solicitudRD.estado)
          }
        />
      </React.Fragment>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2 align-items-center">
        <Button
          label="Agregar"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
          disabled={
            (solicitudRD.tipoear == null) |
            !estadosEditables.includes(solicitudRD.estado) |
            (solicitudRD.tipoear?.id == "ORV")
          }
        />
        {/* <label style={{ color: "red" }}>
          {"No se permite subir Articulos con orden de viaje"}
        </label> */}
      </div>
    );
  };

  async function obtenerItemsLocal() {
    if (solicitudRD.tipoear) {
      await obtenerItems(solicitudRD.tipoear.id, usuario.fax)
        .then((response) => {
          console.log(response.data.Result);
          let data = response.data.Result;
          /*
          const listProducts = response.data.Result.map((e) => ({
            id: e.ItemCode,
            name: e.ItemName,
            posFinanciera: e.posFinanciera,
          }));
          */
          setItems(data);
        })
        .catch((err) => {
          console.log(err.message);
        })
        .finally(() => {
          console.log("Se terminó de cargar los Items");
        });
    }
  }

  async function changeTipoEar(value) {
    const nuevaFechaVencimiento = new Date(); // Obtén la fecha actual

    setSolicitudRD((prevSolicitudRD) => ({
      ...prevSolicitudRD,
      tipoear: value,
    }));

    if (value.id == "VIA") {
      nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 10); // Agrega 10 días
      setSolicitudRD((prevSolicitudRD) => ({
        ...prevSolicitudRD,
        fechaVenc: nuevaFechaVencimiento,
      }));

      // Revisar si existen detalles
      let _detalles = detalles.filter((e) => e.ID != null);

      for (let i = 0; i < _detalles.length; i++) {
        await eliminarDetalleSolicitud(_detalles[i].ID);
      }

      // Devuelve los detalles a 0
      setDetalles([]);
      //obtenerItemsLocal("VIA");
    } else if (value.id == "GAU") {
      nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 7); // Agrega 7 días
      setSolicitudRD((prevSolicitudRD) => ({
        ...prevSolicitudRD,
        fechaVenc: nuevaFechaVencimiento,
        ordenViaje: false,
      }));

      // Revisar si existen detalles
      let _detalles = detalles.filter((e) => e.ID != null);

      for (let i = 0; i < _detalles.length; i++) {
        await eliminarDetalleSolicitud(_detalles[i].ID);
      }

      // Devuelve los detalles a 0
      setDetalles([]);
      //obtenerItemsLocal("GAU");
    } else if (value.id == "REC") {
      nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 5); // Agrega 5 días
      setSolicitudRD((prevSolicitudRD) => ({
        ...prevSolicitudRD,
        fechaVenc: nuevaFechaVencimiento,
        ordenViaje: false,
      }));

      // Revisar si existen detalles
      let _detalles = detalles.filter((e) => e.ID != null);

      for (let i = 0; i < _detalles.length; i++) {
        await eliminarDetalleSolicitud(_detalles[i].ID);
      }

      // Devuelve los detalles a 0
      setDetalles([]);
      //obtenerItemsLocal("REC");
    } else if (value.id == "ORV") {
      setSolicitudRD((prevSolicitudRD) => ({
        ...prevSolicitudRD,
        ordenViaje: true,
      }));

      // Devuelve los detalles a 0
      setDetalles([]);
      //setPresupuesto(0.0);

      // if (detalles.length > 0) {
      //   confirm1();
      // }
    }
  }

  const confirm1 = (value) => {
    //console.log("fonr");
    confirmDialog({
      message: `Al cambiar al tipo de Rendición Orden de Viaje se borrará los detalles agregados, ¿Estás seguro de continuar?`,
      header: "Eliminar detalle",
      icon: "pi pi-check",
      defaultFocus: "accept",
      accept: async () => {
        setSolicitudRD((prevSolicitudRD) => ({
          ...prevSolicitudRD,
          tipoear: value,
          ordenViaje: true,
        }));

        // Revisar si existen detalles
        let _detalles = detalles.filter((e) => e.ID != null);

        for (let i = 0; i < _detalles.length; i++) {
          await eliminarDetalleSolicitud(_detalles[i].ID);
        }

        // Devuelve los detalles a 0
        setDetalles([]);
        //setPresupuesto(0.0);
      },
      acceptLabel: "Si",
      rejectLabel: "No",
      //reject,
    });
  };

  async function obtenerCentroCostoLocal() {
    console.log("obteniendo centro de costo");
    await obtenerCentroCosto(solicitudRD.empldAsig.id)
      .then((response) => {
        console.log(response.data.Result);
        const listCentCst = response.data.Result.map((e) => ({
          name: e.CostCenter,
        }));
        setCentCostos(listCentCst);
        // setDetalle((prevDetalle) => ({
        //   ...prevDetalle,
        //   centCostos: listCentCst,
        //   CentroCosto: listCentCst[0].name,
        // }));
        // console.log(listCentCst);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        console.log("Se terminó de traer el centro de costo");
      });
  }

  //  Template de EmptyProduct
  let emptyProduct = {
    articulo: {
      id: null,
      name: null,
    },
    //centCostos: centCostosOpt,
    posFinanciera: {
      id: null,
      name: null,
    },
    cup: null,
    cantidad: 1,
    precioUnitario: 0.0,
    precioTotal: 0.0,
    NumOrden: null,
    CodArticulo: null,
    NomArticulo: null,
    //CentroCosto: null,
    presupuesto: 0.0,
    ceco: usuario.CostCenter,
  };

  const [detalle, setDetalle] = useState(emptyProduct);

  const totalColumns = () => {
    let total = 0;

    for (let sale of detalles) {
      total += sale.precioTotal;
    }

    return formatCurrency(total);
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
        {/* 
        {(solicitudRD.estado < 6) & (solicitudRD.tipoear?.id != "ORV") && (
          <Column
            footer="Presupuesto Restante:"
            colSpan={1}
            footerStyle={{ textAliegn: "right" }}
            style={
              presupuesto == 0 ? { color: "#FF0B0B" } : { color: "#4CAF50" }
            }
          />
        )}

        {solicitudRD.estado < 6 && (
          <Column
            footer={Math.abs(parseFloat(presupuesto)).toFixed(3)}
            style={
              presupuesto == 0 ? { color: "#FF0B0B" } : { color: "#4CAF50" }
            }
          />
        )}
         */}
      </Row>
    </ColumnGroup>
  );
  /*

  useEffect(() => {
    if (detalles.length > 0) {
      console.log("validaDetallesPresupuestar");
      validaDetallesPresupuestar();
    }
  }, [detalle]);

  async function validaDetallesPresupuestar() {
    let _detalles = detalles;
    console.log(_detalles);
    try {
      const updatedDetalles = await Promise.all(
        detalles.map(async (detalle) => {
          const response = await consultarPresupuesto(
            detalle.centCostos[0].name,
            detalle.posFinanciera.id,
            new Date().getFullYear(),
            -1 * detalle.precioTotal
          );

          if (response.data.CodRespuesta === "00") {
            return {
              ...detalle,
              presupuesto: response.data.Result[0].name,
            };
          } else {
            return {
              ...detalle,
              presupuesto: 0.0,
            };
          }
        })
      );

      setDetalles(updatedDetalles);
      // for (let i = 0; i < _detalles.length; i++) {
      //   let response = await consultarPresupuesto(
      //     _detalles[i].centCostos[0].name,
      //     _detalles[i].posFinanciera.id,
      //     new Date().getFullYear(),
      //     -1 * _detalles[i].precioTotal
      //   );
      //   console.log(response);
      //   if (response.data.CodRespuesta == "00") {
      //     _detalles[i].presupuesto = response.data.Result[0].name;
      //   } else {
      //     _detalles[i].presupuesto = 0.0;
      //   }
      // }
    } catch (error) {
      console.log(error);
    } finally {
      //setDetalles(_detalles);
    }
  }
*/
  async function consultaPresupuestoLocal(ceco, posf) {
    let totalDet = 0;

    for (let sale of detalles) {
      totalDet += sale.precioTotal;
    }

    try {
      let response = await consultarPresupuesto(
        ceco,
        posf,
        new Date().getFullYear(),
        -1 * totalDet
      );

      if (response.status < 300) {
        let body = response.data.Result[0];
        if (body == null || body.name == "-1") {
          setPresupuesto(0);
        } else {
          setPresupuesto(body.name);
        }
      } else {
        showError("Se tuvo un error interno al obtener presupuesto");
        console.log(response.data.Message);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  useEffect(() => {
    obtenerItemsLocal();
  }, [solicitudRD.tipoear]);

  // useEffect(() => {
  //   obtenerTipoViaticosLocal();
  // }, []);

  return (
    <>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Moneda</label>
            <div className="card flex">
              <Dropdown
                value={solicitudRD.moneda}
                onChange={(e) =>
                  setSolicitudRD((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    moneda: e.target.value,
                  }))
                }
                options={monedas}
                optionLabel="name"
                placeholder="Selecciona Moneda"
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full md:w-14rem"
                disabled={
                  !estadosEditables.includes(solicitudRD.estado) |
                  (usuario.TipoUsuario != 1)
                }
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Tipo de Rendición</label>
            <div className="card flex">
              <div className="card flex">
                <Dropdown
                  value={solicitudRD.tipoear}
                  onChange={(e) => {
                    if (e.target.value.id == "ORV" && detalles.length > 0) {
                      confirm1(e.target.value);
                    } else {
                      changeTipoEar(e.target.value);
                    }

                    //if (e.target.value.id == "ORV")
                  }}
                  options={viaticos}
                  optionLabel="name"
                  placeholder="Selecciona Tipo de Rendición"
                  valueTemplate={selectedOptionTemplate}
                  itemTemplate={complementoOptionTemplate}
                  className="w-full md:w-14rem"
                  disabled={
                    !estadosEditables.includes(solicitudRD.estado) |
                    (usuario.TipoUsuario != 1)
                  }
                />
              </div>
            </div>
            {!solicitudRD.tipoear && (
              <small className="p-error">Tipo de Rendición es requerida</small>
            )}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <div className="flex col-12 align-items-center gap-5">
              {(solicitudRD.tipoear?.id != "GAU") |
              (solicitudRD.tipoear?.id != "REC") ? (
                <>
                  <p>¿Requiere orden de Viaje?</p>
                  <Checkbox
                    onChange={(e) => {
                      setSolicitudRD((prevSolicitudRD) => ({
                        ...prevSolicitudRD,
                        ordenViaje: e.checked,
                      })),
                        setDetalles([]);
                    }}
                    checked={solicitudRD.ordenViaje}
                    disabled={
                      !estadosEditables.includes(solicitudRD.estado) |
                      (usuario.TipoUsuario != 1) |
                      (solicitudRD.tipoear?.id == "ORV")
                    }
                  ></Checkbox>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="card">
          <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
          {solicitando && solicitando.ordenViaje && detalles.length < 1 && (
            <small className="p-error">Concepto es requerida</small>
          )}
          {solicitudRD.tipoear?.id != "ORV" && (
            <DataTable
              ref={dt}
              value={detalles}
              tableStyle={{ minWidth: "50rem" }}
              selection={selectedDetalles}
              onSelectionChange={(e) => setSelectedDetalles(e.value)}
              sortOrder={1}
              sortMode="single"
              footerColumnGroup={footerGroup}
              emptyMessage="No se registraron conceptos"
            >
              <Column
                header="#"
                headerStyle={{ width: "3rem" }}
                body={(data, options) => options.rowIndex + 1}
              ></Column>
              <Column field="articulo.id" header="Cod Árticulo"></Column>
              <Column field="articulo.name" header="Concepto"></Column>
              <Column
                field="precioTotal"
                header="Totales"
                sortable
                body={priceBodyTemplate}
              ></Column>
              <Column
                field="ceco"
                header="Centro de Costo"
                //body={centCostoTemplate}
              ></Column>
              <Column
                field="posFinanciera.id"
                header="Posición Financiera"
              ></Column>
              <Column field="cup.U_CUP" header="CUP"></Column>
              <Column
                field="presupuesto"
                header="Presupuesto Restante"
                body={presupuestoTemplate}
              />
              <Column
                header="Acciones"
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          )}
        </div>
        <FormDetalle
          submitted={submitted}
          setSubmitted={setSubmitted}
          setProductDialog={setProductDialog}
          setDeleteProductDialog={setDeleteProductDialog}
          productDialog={productDialog}
          items={items}
          selectedOptionTemplate={selectedOptionTemplate}
          complementoOptionTemplate={complementoOptionTemplate}
          detalle={detalle}
          deleteProductDialog={deleteProductDialog}
          empleadoAsig={solicitudRD.empldAsig.id}
          moneda={solicitudRD.moneda}
          provincia={
            solicitudRD.ubigeo == null ? "" : solicitudRD.ubigeo.Provincia
          }
          distrito={
            solicitudRD.ubigeo == null ? "" : solicitudRD.ubigeo.Distrito
          }
          detalles={detalles}
          setDetalles={setDetalles}
          nOrden={nOrden}
          setNorden={setNorden}
          setDetalle={setDetalle}
          emptyProduct={emptyProduct}
          obtenerCentroCostoLocal={obtenerCentroCostoLocal}
          centCostosOpt={centCostosOpt}
          showSuccess={showSuccess}
          showError={showError}
          setLoading={setLoading}
          estadosEditables={estadosEditables}
          estado={solicitudRD.estado}
          usuario={usuario}
        />
      </div>
    </>
  );
}

export default DetalleSL;
