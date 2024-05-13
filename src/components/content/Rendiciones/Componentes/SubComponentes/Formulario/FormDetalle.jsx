import React, { useEffect, useRef, useState } from "react";
import {
  borrarDocumentoDet,
  obtenerCentroCosto,
  obtenerListaCup,
} from "../../../../../../services/axios.service";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";

export function FormDetalle({
  setSubmitted,
  setProductDialog,
  items,
  setDeleteProductDialog,
  productDialog,
  selectedOptionDefault,
  complementoOptionDefault,
  detalle,
  setDetalles,
  setDetalle,
  detalles,
  deleteProductDialog,
  showSuccess,
  showError,
  setLoading,
  emptyProduct,
  proyectos,
  moneda,
  indicadores,
  cups,
  setCups,
  centroCosto,
  detalleSolicitud,
  setDocumento,
  editable,
  documentoId,
  esModo
}) {
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [esModoEditar]=useState(esModo === "Editar"? true : false)
  const refCup = useRef(null);
  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
    setDetalle(emptyProduct);
  };

  const saveProduct = () => {
    setSubmitted(true);

    let _detalles = [...detalles];
    let _detalle = { ...detalle };
    console.log(_detalle);
    if (
      detalle.STR_CODARTICULO.id != null &&
      detalle.STR_CENTCOSTO.CostCenter > 0 &&
      //detalle.posFinanciera.id != null &&
      detalle.STR_CUP != null
      //detalle.cantidad > 0
    ) {
      if (detalle.ID) {
        const index = _detalles.findIndex((p) => p.ID === detalle.ID);

        if (index !== -1) {
          _detalles[index] = _detalle;

          showSuccess("Concepto Actualizado");
        }
      } else {
        _detalle.ID = createId();
        _detalles.push({
          ..._detalle,
        });

        showSuccess("Concepto Agregado");
      }

      let STR_TOTALDOC = _detalles.reduce(
        (acumulador, detalle) => acumulador + (detalle.STR_SUBTOTAL || 0),
        0
      );
      setDocumento((prevDocumento) => ({
        ...prevDocumento,
        STR_TOTALDOC: STR_TOTALDOC,
      }));
      setDetalles(_detalles);
      setProductDialog(false);
      setDetalle(emptyProduct);
      obtenerCentroCosto();
    }
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

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };

  const deleteProduct = async () => {
    setLoading(true);

    let _detalles = detalles.filter((val) => val.ID !== detalle.ID);
    setDetalles(_detalles);
    setDeleteProductDialog(false);

    if (typeof detalle.ID == "number") {
      await borrarDocumentoDet(detalle.ID, documentoId).catch((err) => {
        console.log(err.message);
        showError("No se pudo eliminar detalle");
      });
    }

    let STR_TOTALDOC = _detalles.reduce(
      (acumulador, detalle) => acumulador + (detalle.STR_SUBTOTAL || 0),
      0
    );
    setDocumento((prevDocumento) => ({
      ...prevDocumento,
      STR_TOTALDOC: STR_TOTALDOC,
    }));

    showSuccess("Concepto Eliminiado");
    setLoading(false);
  };

  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        onClick={hideDialog}
        //disabled={!estadosEditables.includes(estado)}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={saveProduct}
        disabled={editable}
        //disabled={!estadosEditables.includes(estado)}
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
        // disabled={!estadosEditables.includes(estado)}
      />
      <Button
        label="Si"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteProduct}
        //disabled={!estadosEditables.includes(estado)}
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
        //disabled={!estadosEditables.includes(estado)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        // onClick={deleteSelectedProducts}
        // disabled={!estadosEditables.includes(estado)}
      />
    </React.Fragment>
  );

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

  function validaIgualdadEnDetalle(val) {
    if (detalleSolicitud.length > 0) {
      let lista = detalleSolicitud.find((e) => {
        if (e.STR_CODARTICULO.id == val.id) {
          cups.map((c) => {
            if (c.U_CUP == e.STR_CUP.id) {
              setDetalle((prevDetalle) => ({
                ...prevDetalle,
                STR_CUP: c,
              }));
            }
          });
        }
      });
    }
  }

  /*
  async function obtenerListaCupLocal(
    ceco = detalle.STR_CENTCOSTO,
    posFinanciera = detalle.posFinanciera?.name,
    anio = 2022
  ) {
    // Obten Lista de CUPS cuando se cambie de Item

    var response = await obtenerListaCup(ceco, posFinanciera, anio);
    if (response.data.CodRespuesta != "99") {
      // Obtiene lista de CUPS
      const data = response.data.Result;

      // Busca con el nombre del articulo;
      if ((detalle.STR_CUP == null) | detalle.STR_CODARTICULO) {
        let _listCups = data.filter((e) => e.U_DESCRIPTION == data.name);
      }

      setCups(data);
    } else {
      showError(response.data.Message);
      console.log(response.data.Message);
    }
  }
  */

  useEffect(() => {
    if (cups?.length > 0) {
      validaIgualdadEnDetalle(detalle.STR_CODARTICULO);
      console.log("Termino de cargar los CUPS e items");
    }
  }, [cups, detalle.STR_CODARTICULO]);

  async function obtieneListadoCups(data) {
    let listCups;
    await obtenerListaCup(
      //detalle.centCostos[0].name,
      detalle.STR_CENTCOSTO.CostCenter,
      (data == undefined) | (data == null)
        ? detalle.STR_CODARTICULO.posFinanciera
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
          (detalle.STR_CUP == null) |
          (data != undefined) |
          (detalle.STR_CUP?.U_DESCRIPTION != data.name)
          //(detalle.cup == null) | (detalle.cup?.U_DESCRIPTION != data?.name)
        ) {
          // Busca el like de codArticulo y cup.name

          console.log(data);
          let _listCups = listCups.filter((e) => e.U_DESCRIPTION == data.name);
          //console.log(listCups[0]);
          if (_listCups.length > 0) {
            setDetalle((prevDetalle) => ({
              ...prevDetalle,
              STR_CUP: _listCups[0],
              //ItemCup: _listCups[0].U_CUP,
            }));
          } else if (detalle.cup == null) {
            setDetalle((prevDetalle) => ({
              ...prevDetalle,
              STR_CUP: listCups[0],
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

  useEffect(() => {
    obtieneListadoCups();
  }, [productDialog]);
  const [visible, setVisible] = useState(false);
  /*
  useEffect(() => {
    if (detalle.STR_CODARTICULO.posFinanciera && centroCosto[0].CostCenter) {
      console.log("entro");
      obtenerListaCupLocal(
        centroCosto[0].CostCenter,
        detalle.STR_CODARTICULO.posFinanciera
      );
    }
  }, [detalle.STR_CODARTICULO.posFinanciera, centroCosto[0].CostCenter]);
  */
  return (
    <>
   
      <Dialog 
        visible={productDialog}
        setVisible={setVisible}
        //style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        // header={esModo + "Concepto"}
        // header="Agregar Concepto"
        modal
        className="p-fluid xl:max-w-30rem w-full max-w-20rem"
        footer={productDialogFooter}
        onHide={hideDialog}
      >

<h2>{modo === "editar" ? "Editar Detalle" : "Agregar Detalle"}</h2>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Árticulo
          </label>
          <div className="card flex">
            <Dropdown
              value={detalle.STR_CODARTICULO}
              onChange={(e) => {
                obtieneListadoCups(e.target.value);
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_CODARTICULO: e.target.value,
                }));
                //validaIgualdadEnDetalle(e.target.value);
              }}
              options={items}
              optionLabel="name"
              placeholder="Articulo"
              filter
              valueTemplate={selectedOptionDefault}
              itemTemplate={complementoOptionDefault}
              className="w-full md:w-14rem"
              disabled={editable}
              //disabled={!estadosEditables.includes(estado)}
            />
          </div>
          {/* {submitted && detalle.articulo.id == null && (
            <small className="p-error">Articulo es requerido</small>
          )} */}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Seleccionar Proyecto
          </label>
          <div className="card flex">
            <Dropdown
              value={detalle.STR_PROYECTO}
              onChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_PROYECTO: e.target.value,
                }))
              }
              options={proyectos}
              optionLabel="name"
              placeholder="Proyecto"
              valueTemplate={selectedOptionDefault}
              itemTemplate={complementoOptionDefault}
              className="w-full md:w-14rem"
              disabled={editable}
              //disabled={!estadosEditables.includes(estado)}
            />
          </div>
          {/* {submitted && detalle.articulo.id == null && (
            <small className="p-error">Articulo es requerido</small>
          )} */}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Precio Total
          </label>
          <div className="card flex">
            <InputNumber
              inputId="currency-us"
              value={detalle.STR_SUBTOTAL}
              onValueChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_SUBTOTAL: e.target.value,
                }))
              }
              disabled={editable}
              mode="currency"
              currency={`${moneda}`}
              locale={
                moneda == "SOL" ? "en-PE" : moneda == "EUR" ? "de-DE" : "en-US"
              }
              //disabled={!estadosEditables.includes(estado)}
            />
          </div>
          {/* {submitted && detalle.precioUnitario == null && (
            <small className="p-error">Precio Unitario es requerido</small>
          )} */}
        </div>
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Seleccionar Impuesto sdfdsfdf
          </label>
          <div className="card flex">
            <Dropdown
              value={detalle.STR_INDIC_IMPUESTO}
              onChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_INDIC_IMPUESTO: e.target.value,
                }))
              }
              options={indicadores}
              optionLabel="name"
              placeholder="Impuesto"
              valueTemplate={selectedOptionDefault}
              itemTemplate={complementoOptionDefault}
              className="w-full md:w-14rem"
              disabled={editable}
              //disabled={!estadosEditables.includes(estado)}
            />
          </div>
          {/* {submitted && detalle.articulo.id == null && (
            <small className="p-error">Articulo es requerido</small>
          )} */}
        </div>
        <div className="field">
          <label htmlFor="countries">Centro de Costo</label>
          <div className="card flex">
            <InputText
              value={detalle.STR_CENTCOSTO.CostCenter}
              onChange={(e) => {
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_CENTCOSTO: e.target.value,
                })),
                  obtenerListaCupLocal(
                    e.target.value,
                    detalle.posFinanciera,
                    2022
                  );
              }}
              placeholder="Centro de Costo"
              disabled
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="countries">Posición Financiera</label>
          <div className="card flex">
            <InputText
              value={detalle.STR_CODARTICULO.posFinanciera}
              onChange={(e) => {
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  posFinanciera: e.target.value,
                })),
                  obtenerListaCupLocal(
                    detalle.STR_CENTCOSTO,
                    e.target.value,
                    2022
                  );
              }}
              placeholder="Posición Financiera"
              disabled
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="name" className="font-bold">
            Lista de CUP
          </label>
          <div className="card flex">
            <Dropdown
              ref={refCup}
              value={detalle.STR_CUP}
              onChange={(e) =>
                setDetalle((prevDetalle) => ({
                  ...prevDetalle,
                  STR_CUP: e.target.value,
                }))
              }
              options={cups}
              optionLabel="U_CUP"
              placeholder="CUP"
              valueTemplate={selectedOptionTemplateCUP}
              itemTemplate={complementoOptionTemplateCUP}
              className="w-full md:w-14rem"
              emptyMessage="No se encontraron CUPS"
              disabled={editable}
              //disabled={!estadosEditables.includes(estado)}
            />
          </div>
          {/* {submitted && detalle.articulo.id == null && (
            <small className="p-error">Articulo es requerido</small>
          )} */}
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
        //disabled={!estadosEditables.includes(estado)}
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
        //disabled={!estadosEditables.includes(estado)}
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
