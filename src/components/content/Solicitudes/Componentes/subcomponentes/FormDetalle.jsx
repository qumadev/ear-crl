import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";


import { InputText } from "primereact/inputtext";
import {
  consultarPresupuesto,
  eliminarDetalleSolicitud,
  obtenerCentroCosto,
  obtenerListaCup,
  obtenerPrecio,
} from "../../../../../services/axios.service";
import { InputNumber } from "primereact/inputnumber";

function FormDetalle({
  submitted,
  setSubmitted,
  setProductDialog,
  setDeleteProductDialog,
  productDialog,
  items,
  selectedOptionTemplate,
  complementoOptionTemplate,
  detalle,
  deleteProductDialog,
  moneda,
  distrito,
  provincia,
  detalles,
  setDetalle,
  setDetalles,
  emptyProduct,
  obtenerCentroCostoLocal,
  centCostosOpt,
  showSuccess,
  showError,
  setLoading,
  estadosEditables,
  estado,
  usuario,
}) {
  const [item, setItem] = useState(null);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [cupLoading, setCupLoading] = useState(false);

  const [cups, setCups] = useState([]);

  const [multipleSelectionEnabled, setMultipleSelectionEnabled] =
    useState(false);

  const handleCheckboxChange = () => {
    setMultipleSelectionEnabled(!multipleSelectionEnabled);
    /*
    if (!multipleSelectionEnabled) {
      setDetalle((prevDetalle) => ({
        ...prevDetalle,
        centCostos: [],
        CentroCosto: null,
      }));
    }*/
  };

  const handleCentroCostoChange = (e) => {
    setDetalle((prevDetalle) => ({
      ...prevDetalle,
      centCostos: e.value,
      CentroCosto: e.value.id,
    }));
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
    setDetalle(emptyProduct);
  };

  const saveProduct = async () => {
    setSubmitted(true);

    let _detalles = [...detalles];
    let _detalle = { ...detalle };

    if (detalle.id) {
      const index = _detalles.findIndex((p) => p.id === detalle.id);

      if (index !== -1) {
        _detalles[index] = _detalle;

        /// Consulta Presupuesto
        let response = await consultarPresupuesto(
          _detalles[index].ceco,
          _detalles[index].posFinanciera.id,
          new Date().getFullYear(),
          -1 * _detalles[index].precioTotal
        );

        if (response.status < 300) {
          let totalSum = 0;
          totalSum = _detalles.reduce((acc, detalle, i) => {
            if (
              /*detalle.centCostos[0].name*/ detalle.ceco ===
                /*_detalles[index].centCostos[0].name*/ _detalles[index].ceco &&
              detalle.posFinanciera.id === _detalles[index].posFinanciera.id &&
              detalle.id != _detalles[index].id
            ) {
              return acc + detalle.precioTotal;
            }
            return acc;
          }, 0);

          _detalles[index].presupuesto =
            response.data.Result[0].name - totalSum;

          const indices = _detalles.reduce((acc, detalle, i) => {
            if (
              /*detalle.centCostos[0].name*/ detalle.ceco ===
                _detalles[index].ceco &&
              detalle.posFinanciera.id === _detalles[index].posFinanciera.id &&
              detalle.id != _detalles[index].id
            ) {
              acc.push(i);
            }
            return acc;
          }, []);

          if (indices.length > 0) {
            indices.forEach((i) => {
              _detalles[i] = {
                ..._detalles[i],
                presupuesto: _detalles[index].presupuesto,
              };
            });
          }
        }
        //------------------------------------------------------------------------------------------------

        //showSuccess("Concepto Actualizado");
      }
    } else {
      _detalle.id = createId();

      // Busca en los detalles si hay uno con el centCosto, posFi  igual al que está ingresando
      const indices = _detalles.reduce((acc, detalle, i) => {
        if (
          //detalle.centCostos[0].name === _detalle.centCostos[0].name &&
          detalle.ceco === _detalle.ceco &&
          detalle.posFinanciera.id === _detalle.posFinanciera.id
        ) {
          acc.push(i);
        }
        return acc;
      }, []);

      // if (index != -1) {
      if (indices.length > 0) {
        indices.forEach((index) => {
          _detalles[index] = {
            ..._detalles[index],
            presupuesto: _detalles[index].presupuesto - _detalle.precioTotal,
          };
        });
        _detalle.presupuesto = _detalles[indices[0]].presupuesto;
      } else {
        /// Consulta Presupuesto
        let response = await consultarPresupuesto(
          //_detalle.centCostos[0].name,
          _detalle.ceco,
          _detalle.posFinanciera.id,
          new Date().getFullYear(),
          -1 * _detalle.precioTotal
        );

        if (response.status < 300) {
          _detalle.presupuesto = response.data.Result[0].name;
        }
      }
      //------------------------------------------------------------------------------------------------
      _detalles.push({
        ..._detalle,
        //centCostoFiel: _detalle.centCostos[0].name,
      });
      //showSuccess("Concepto Agregado");
    }
    setDetalles(_detalles);
    setProductDialog(false);
    setDetalle(emptyProduct);
    obtenerCentroCosto();
    // }
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };

  const deleteProduct = async () => {
    setLoading(true);
    let _detalles = detalles.filter((val) => val.id !== detalle.id);
    setDetalles(_detalles);
    setDeleteProductDialog(false);

    if (detalle.ID != null) {
      await eliminarDetalleSolicitud(detalle.ID).catch((err) => {
        console.log(err.message);
        showError("No se pudo eliminar detalle");
      });
    }

    //showSuccess("Concepto Eliminiado");
    setLoading(false);
  };

  const createId = () => {
    let id = "";
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
  };

  const deleteSelectedProducts = () => {};

  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        onClick={hideDialog}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={saveProduct}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
    </React.Fragment>
  );
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteProductDialog}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
      <Button
        label="Si"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteProduct}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
    </React.Fragment>
  );

  const deleteProductsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteProductsDialog}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
      <Button
        label="Si"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteSelectedProducts}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      />
    </React.Fragment>
  );

  const changeItemFrm = async (item) => {
    console.log(item);
    setDetalle((prevDetalle) => ({
      ...prevDetalle,
      articulo: item,
      posFinanciera: { id: item.posFinanciera, name: item.posFinanciera },
      PosiFinanciera: item.posFinanciera,
      CodArticulo: item.id,
      NomArticulo: item.name,
      ctc: item.CTA,
    }));

    if (detalle.ceco != null) {
      // console.log(detalle.centCostos);
      obtieneListadoCups(item);
    }

    await obtenerPrecio(provincia, distrito, item.id)
      .then((response) => {
        const listPrecio = response.data.Result;
        if (listPrecio.length < 1) {
          console.log("No se encontró precio por defecto con este articulo");
        } else {
          setDetalle((prevDetalle) => ({
            ...prevDetalle,
            precioUnitario: listPrecio[0].precio,
            precioTotal: listPrecio[0].precio * detalle.cantidad,
          }));
        }
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        console.log("Termino de obtener Precio");
      });
  };

  async function obtieneListadoCups(data) {
    let listCups;
    await obtenerListaCup(
      //detalle.centCostos[0].name,
      detalle.ceco,
      (data == undefined) | (data == null)
        ? detalle.posFinanciera.id
        : data.posFinanciera, //detalle.posFinanciera.id,
      2022 /*getDate()*/
    )
      .then((response) => {
        listCups = response.data.Result;
        console.log(listCups);

        // De un inicio dará NULL
        // si en caso es NULL o diferente al que tiene ahorita hará la busqueda con
        // Like del nomArticulo, si no es que llame al procedimiento y traiga la data que corresponde
        if (
          //listCups.length > 0 &&
          (detalle.cup == null) |
          (data != undefined) |
          (detalle.cup?.U_DESCRIPTION != data.name)
          //(detalle.cup == null) | (detalle.cup?.U_DESCRIPTION != data?.name)
        ) {
          // Busca el like de codArticulo y cup.name

          console.log(data);
          let _listCups = listCups.filter((e) => e.U_DESCRIPTION == data.name);
          //console.log(listCups[0]);
          if (_listCups.length > 0) {
            setDetalle((prevDetalle) => ({
              ...prevDetalle,
              cup: _listCups[0],
              //ItemCup: _listCups[0].U_CUP,
            }));
          } else if (detalle.cup == null) {
            setDetalle((prevDetalle) => ({
              ...prevDetalle,
              cup: listCups[0],
              //ItemCup: listCups[0].U_CUP,
            }));
          }
        }
        /* else if (detalle.cup == null) {
          setDetalle((prevDetalle) => ({
            ...prevDetalle,
            cup: null,
            //ItemCup: null,
          }));
        }*/
        //setCups(listCups);
        console.log(cups);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setCups(listCups);
        console.log("Se terminó de traer el listado CUP");
      });
  }

  const changeTotalItems = (value) => {
    setDetalle((prevDetalle) => ({
      ...prevDetalle,
      precioUnitario: value,
      precioTotal: value * detalle.cantidad,
    }));
  };

  const selectedOptionTemplateCUP = (option, props) => {
    if (option) {
      return (
        <div className="flex">
          <div>
            {option.U_CUP} - {option.U_DESCRIPTION}
          </div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const complementoOptionTemplateCUP = (option) => {
    return (
      <div className="flex">
        <div>
          {option.U_CUP} - {option.U_DESCRIPTION}
        </div>
      </div>
    );
  };

  useEffect(() => {
    //obtenerCentroCostoLocal();
  }, []);

  useEffect(() => {
    if (centCostosOpt?.length > 0) {
      setDetalle((prevDetalle) => ({
        ...prevDetalle,
        centCostos: [centCostosOpt[0].value],
        CentroCosto: centCostosOpt[0].id,
      }));
    }
  }, []);

  useEffect(() => {
    obtieneListadoCups(null);
  }, [productDialog]);

  return (
    <>
      <Dialog
        visible={productDialog}
        //style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Agregar Concepto"
        modal
        className="p-fluid xl:max-w-30rem max-w-20rem"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Árticulo
          </label>
          <div className="card flex">
            <Dropdown
              value={detalle.articulo}
              onChange={(e) => changeItemFrm(e.target.value)}
              options={items}
              optionLabel="name"
              placeholder="Articulo"
              filter
              valueTemplate={selectedOptionTemplate}
              itemTemplate={complementoOptionTemplate}
              className="w-full md:w-14rem"
              disabled={
                !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
              }
            />
          </div>
          {submitted && detalle.articulo.id == null && (
            <small className="p-error">Articulo es requerido</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Centro de Costo
          </label>
          <div className="card flex gap-4">
            <InputText
              onFocus={() => {
                setCupLoading(true);
                /*setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  cup: null,
                  //ItemCup: e.value.U_CUP,
                }));*/
              }}
              onBlur={() => {
                setCupLoading(false);
                obtieneListadoCups(detalle.articulo);
              }}
              id="pnum"
              value={detalle.ceco}
              onChange={(e) => {
                try {
                  //setCupLoading(true);

                  setDetalle((prevDetalle) => ({
                    ...prevDetalle,
                    ceco: e.target.value,
                    cup: null,
                  }));
                } finally {
                  //setCupLoading(false);
                }
              }}
              useGrouping={false}
              keyfilter="pnum"
              disabled={
                !estadosEditables.includes(estado) |
                (usuario.TipoUsuario != 1) |
                !multipleSelectionEnabled
              }
            />
            <div className="flex align-items-center">
              <Checkbox
                inputId="ingredient1"
                name="pizza"
                value="Cheese"
                checked={multipleSelectionEnabled}
                // disabled={!multipleSelectionEnabled}
                onChange={handleCheckboxChange}
                // checked={ingredients.includes("Cheese")}
                disabled={
                  !estadosEditables.includes(estado) |
                  (usuario.TipoUsuario != 1)
                }
              />
              <label htmlFor="ingredient1" className="ml-2">
                ¿Cent. Costo diferente?
              </label>
            </div>
          </div>
          {/* {submitted && detalle.centCostos == null && (
            <small className="p-error">Centro de Costo es requerido</small>
          )} */}
        </div>
        <div className="field" hidden>
          <label htmlFor="name" className="font-bold">
            Cuenta Contable
          </label>
          <div className="card flex">
            <InputText
              id="pnum"
              value={detalle.ctc}
              useGrouping={false}
              keyfilter="pnum"
              disabled
            />
          </div>
          {submitted && detalle.cantidad < 1 && (
            <small className="p-error">
              Cantidad es no puede ser menor a 1
            </small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Posición Financiera
          </label>
          <div className="card flex">
            <Dropdown
              value={detalle.posFinanciera}
              onChange={(e) => console.log(e)}
              options={[detalle.posFinanciera]}
              optionLabel="name"
              placeholder="Posición Financiera"
              valueTemplate={selectedOptionTemplate}
              itemTemplate={complementoOptionTemplate}
              className="w-full md:w-14rem"
              disabled
            />
          </div>
          {submitted && detalle.posFinanciera.id == null && (
            <small className="p-error">Posición Financiera es requerido</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            CUP
          </label>
          <div className="card flex">
            <Dropdown
              loading={cupLoading}
              value={detalle.cup}
              onChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  cup: e.value,
                  //ItemCup: e.value.U_CUP,
                }))
              }
              options={cups}
              optionLabel="U_CUP"
              placeholder="CUP"
              valueTemplate={selectedOptionTemplateCUP}
              itemTemplate={complementoOptionTemplateCUP}
              className="w-full md:w-14rem"
              disabled={
                !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
              }
              emptyMessage="No hay CUP disponible"
            />
          </div>
          {submitted && detalle.cup == null && (
            <small className="p-error">CUP es requerido</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Cantidad
          </label>
          <div className="card flex">
            <InputText
              id="pnum"
              value={detalle.cantidad}
              onChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  cantidad: e.target.value,
                  precioTotal: e.target.value * detalle.precioUnitario,
                }))
              }
              useGrouping={false}
              keyfilter="pnum"
              disabled={
                !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
              }
            />
          </div>
          {submitted && detalle.cantidad < 1 && (
            <small className="p-error">
              Cantidad es no puede ser menor a 1
            </small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Precio Unitario
          </label>
          <div className="card flex">
            <InputNumber
              inputId="currency-us"
              value={detalle.precioUnitario}
              onValueChange={(e) => changeTotalItems(e.value)}
              mode="currency"
              currency={`${moneda.name}`}
              locale={
                moneda.name == "SOL"
                  ? "en-PE"
                  : moneda.name == "EUR"
                  ? "de-DE"
                  : "en-US"
              }
              disabled={
                !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
              }
            />
          </div>
          {submitted && detalle.precioUnitario == null && (
            <small className="p-error">Precio Unitario es requerido</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Precio Total
          </label>
          <div className="card flex">
            <InputNumber
              inputId="currency-us"
              value={detalle.precioTotal}
              onValueChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  precioTotal: e.value,
                }))
              }
              mode="currency"
              currency={`${moneda.name}`}
              locale={
                moneda.name == "SOL"
                  ? "en-PE"
                  : moneda.name == "EUR"
                  ? "de-DE"
                  : "en-US"
              }
              disabled
            />
          </div>
          {submitted && detalle.precioTotal == null && (
            <small className="p-error">Precio Total es requerido</small>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {detalle && <span>¿Estás seguro que quieres eliminar?</span>}
        </div>
      </Dialog>

      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={hideDeleteProductsDialog}
        disabled={
          !estadosEditables.includes(estado) | (usuario.TipoUsuario != 1)
        }
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {detalle && <span>¿Estás seguro que quieres eliminar?</span>}
        </div>
      </Dialog>
    </>
  );
}

export default FormDetalle;
