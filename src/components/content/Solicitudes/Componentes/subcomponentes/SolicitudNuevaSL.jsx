import React, { useContext, useEffect } from "react";
import { useState } from "react";
import Direccion from "./Direccion";
import {
  createSolicitud,
  obtenerMotivos,
  obtenerProveedores,
  obtenerTipoDocs,
  obtenerTipos,
  obtenerTiposMonedas
} from "../../../../../services/axios.service";
import { Dropdown } from "primereact/dropdown";
import "primeflex/primeflex.css";
import Input from "postcss/lib/input";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import FormDetalleNewSolicitud from "./FormDetalleNewSolicitud";
import { Button } from "primereact/button";
import { FormDetalle } from "../../../Rendiciones/Componentes/SubComponentes/Formulario/FormDetalle";
import { AppContext } from "../../../../../App";
import { Navigate } from "react-router-dom";

function SolicitudNuevaSL({ solicitudRD, setSolicitudRD, estadosEditables }) {
  const { usuario, ruta, config } = useContext(AppContext);
  const [visible, setVisible] = useState(false);
  const [tipos, setTipos] = useState(null);
  const [motivos, setMotivos] = useState(null);
  const [monedas, setMonedas] = useState(null)

  const crearSolicitud = async () => {
    try {
      var response = await createSolicitud(solicitudRD);
      console.log(response);
      Navigate(ruta + "/solicitudes");
    } catch (error) {
      showError(error.Message);
      console.log(error.Message);
    }
  };

  async function obtenerData() {
    const response = await Promise.all([obtenerTipos(), obtenerMotivos(), obtenerTiposMonedas()]);

    setTipos(response[0].data.Result);
    setMotivos(response[1].data.Result);

    const monedasMapped = response[2].data.Result.map(moneda => ({
      label: moneda.Code, // LO QUE SE MUESTRA EN EL DROPDOWN
      value: moneda.Code  // EL VALOR QUE SE GUARDARÁ EN solicitudRD.STR_MONEDA
    }));

    console.log(monedasMapped);

    setMonedas(monedasMapped);
  }
  useEffect(() => {
    obtenerData();
  }, []);

  function obtieneFecha(fecha) {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  return (
    <div>
      {visible && <FormDetalleNewSolicitud setVisible={setVisible} />}
      <div className="col-12 md:col-6 lg:col-6">
        <div className="mb-3 flex flex-column gap-2">
          <label htmlFor="">Empleado:</label>
          <InputText
            // value={usuario.nombres + " " + usuario.apellidos}
            value={solicitudRD.STR_EMPLDREGI?.nombres + ' ' + solicitudRD.STR_EMPLDREGI.apellidos}
            disabled={true}
          />
          {console.log("TIPOS: ", tipos)}
          <label htmlFor="">(*)Tipo:</label>
          <Dropdown
            value={solicitudRD.STR_TIPORENDICION}
            onChange={(e) => {
              //setSelectedTipo(e.value);
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_TIPORENDICION: e.value,
              }));
            }}
            options={tipos}
            optionLabel="name"
            placeholder="Seleccione Tipo"
            disabled={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) |
              (usuario.rol.id != 1)
            }
          />
          <label htmlFor="">(*)Moneda:</label>
          {console.log("Opciones de monedas en Dropdown:", monedas)}
          {console.log("Valor de STR_MONEDA:", solicitudRD.STR_MONEDA)}
          <Dropdown
            value={solicitudRD.STR_MONEDA?.id}
            onChange={(e) => {
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_MONEDA: { ...prevState.STR_MONEDA, id: e.value }
              }));
            }}
            options={monedas}
            placeholder="Seleccione Moneda"
            disabled={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) |
              (usuario.rol.id != 1)
            }
          />
          <label htmlFor="">(*)Monto:</label>
          <InputText
            value={solicitudRD.STR_TOTALSOLICITADO}
            onChange={(e) => {
              //setMonto(e.target.value);
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_TOTALSOLICITADO: e.target.value,
              }));
            }}
            placeholder="Monto a solicitar"
            disabled={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) |
              (usuario.rol.id != 1)
            }
          />
          <label htmlFor="">(*)Motivo:</label>
          <Dropdown
            value={solicitudRD.STR_MOTIVORENDICION}
            onChange={(e) => {
              //setSelectedMotivo(e.value);
              //console.log(e.value);
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_MOTIVORENDICION: e.value,
              }));
            }}
            options={motivos}
            optionLabel="name"
            placeholder="Seleccione Motivo"
            disabled={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) |
              (usuario.rol.id != 1)
            }
          />
          <label htmlFor="">(*)Comentario:</label>
          <InputTextarea
            value={solicitudRD.STR_COMENTARIO}
            onChange={(e) => {
              //setComentario(e.target.value);
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_COMENTARIO: e.target.value,
              }));
            }}
            rows={5}
            maxLength={254}
            cols={30}
            readOnly={
              !estadosEditables.includes(solicitudRD.STR_ESTADO) |
              (usuario.rol.id != 1)
            }
          />
        </div>
      </div>

      {/* <Button label="Guardar Borrador" onClick={crearSolicitud} /> */}
      {/* <FormDetalleNewSolicitud
                productDialog={productDialog}
                setProductDialog={setProductDialog}
                proveedores={proveedores}
            >
            </FormDetalleNewSolicitud> */}
    </div>
  );
}

export default SolicitudNuevaSL;
