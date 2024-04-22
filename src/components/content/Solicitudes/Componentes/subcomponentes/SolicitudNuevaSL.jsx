import React, { useContext, useEffect } from "react";
import { useState } from "react";
import Direccion from "./Direccion";
import {
  createSolicitud,
  obtenerMotivos,
  obtenerProveedores,
  obtenerTipoDocs,
  obtenerTipos,
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

function SolicitudNuevaSL({ solicitudRD, setSolicitudRD }) {
  const { usuario, ruta, config } = useContext(AppContext);
  const [visible, setVisible] = useState(false);
  const [tipos, setTipos] = useState(null);
  const [motivos, setMotivos] = useState(null);

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
    const response = await Promise.all([obtenerTipos(), obtenerMotivos()]);

    setTipos(response[0].data.Result);
    setMotivos(response[1].data.Result);
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

  const monedas = [
    { id: "SOL", name: "SOL" },
    { id: "USD", name: "USD" },
  ];

  return (
    <div>
      {visible && <FormDetalleNewSolicitud setVisible={setVisible} />}
      <div className="col-12 md:col-6 lg:col-6">
        <div className="mb-3 flex flex-column gap-2">
          <label htmlFor="">Empleado:</label>
          <InputText
            value={usuario.nombres + " " + usuario.apellidos}
            disabled={true}
          />
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
          />
          <label htmlFor="">(*)Moneda:</label>
          <Dropdown
            value={solicitudRD.STR_MONEDA}
            onChange={(e) => {
              // setSelectedMoneda(e.value);
              setSolicitudRD((prevState) => ({
                ...prevState,
                STR_MONEDA: e.value,
              }));
            }}
            options={monedas}
            optionLabel="name"
            placeholder="Seleccione Moneda"
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
            cols={30}
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
