import React, { useContext, useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";

import {
  obtenerEmpleados,
  obtenerRutas,
} from "../../../../../services/axios.service";
import Direccion from "./Direccion";

function GeneralSL({
  solicitudRD,
  setSolicitudRD,
  usuario,
  solicitando,
  setDetalles,
  estadosEditables,
  //vencimientoRef,
}) {
  const [empleados, setEmpleados] = useState([]);
  const [Ruta, setRuta] = useState([]);

  async function obtenerEmpleadosLocal() {
    await obtenerEmpleados()
      .then((response) => {
        const listEmpleados = response.data.Result.map((e) => ({
          id: e.empID,
          name: e.Nombres,
        }));
        setEmpleados(listEmpleados);
      })
      .catch((err) => {
      })
      .finally(() => {
      });
  }

  async function obtenerRutasLocal() {
    await obtenerRutas()
      .then((response) => {
        const listRutas = response.data.Result.map((e) => ({
          id: e.Nombre,
          name: e.Descripcion,
        }));
        setRuta(listRutas);
      })
      .catch((err) => {
      })
      .finally(() => {
      });
  }

  function changeHabilitEmp(e) {
    setSolicitudRD((prevSolicitudRD) => ({
      ...prevSolicitudRD,
      checkTrcr: e,
    }));

    if (e == false) {
      setSolicitudRD((prevSolicitudRD) => ({
        ...prevSolicitudRD,
        empldAsig: { id: usuario.empId, name: usuario.Nombres },
      }));
    }
  }

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

  useEffect(() => {
    obtenerEmpleadosLocal();
    obtenerRutasLocal();
  }, []);

  return (
    <>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <div className="flex col-12 align-items-center gap-5">
              <p>¿Es para un tercero?</p>
              <Checkbox
                onChange={(e) => changeHabilitEmp(e.checked)}
                checked={solicitudRD.checkTrcr}
                disabled={
                  !estadosEditables.includes(solicitudRD.estado) |
                  (usuario.TipoUsuario != 1)
                }
              ></Checkbox>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Empleado Asignado</label>
            <div className="card flex">
              <Dropdown
                disabled={
                  !solicitudRD.checkTrcr |
                  !estadosEditables.includes(solicitudRD.estado) |
                  (usuario.TipoUsuario != 1)
                }
                value={solicitudRD.empldAsig}
                onChange={(e) =>
                  setSolicitudRD((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    empldAsig: e.target.value,
                  }))
                }
                options={empleados}
                optionLabel="name"
                placeholder="Selecciona Empleado"
                filter
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full md:w-14rem"
              />
            </div>
            {solicitando && solicitudRD.checkTrcr && !solicitudRD.empldAsig && (
              <small className="p-error">Empleado es requerido</small>
            )}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <Direccion
              solicitudRD={solicitudRD}
              setSolicitudRD={setSolicitudRD}
              estadosEditables={estadosEditables}
              usuario={usuario}
            />
            {solicitando && !solicitudRD.ubigeo && (
              <small className="p-error">Dirección es requerida</small>
            )}
          </div>
        </div>
        {/*   
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <div className="flex col-12 align-items-center gap-5">
              <p>¿Requiere orden de Viaje?</p>
              <Checkbox
                onChange={(e) => {
                  setSolicitudRD((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    ordenDeViaje: e.checked,
                  })),
                    setDetalles([]);
                }}
                checked={solicitudRD.ordenDeViaje}
                disabled={
                  !estadosEditables.includes(solicitudRD.estado) |
                  (usuario.TipoUsuario != 1)
                }
              ></Checkbox>
            </div>
          </div>
        </div>
        */}
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Inicio y Fin</label>
            <Calendar
              value={solicitudRD.fechaRango}
              onChange={(e) =>
                setSolicitudRD((prevSolicitudRD) => ({
                  ...prevSolicitudRD,
                  fechaRango: e.value,
                }))
              }
              selectionMode="range"
              readOnlyInput
              dateFormat="dd/mm/yy"
              disabled={
                !estadosEditables.includes(solicitudRD.estado) |
                (usuario.TipoUsuario != 1)
              }
              locale="es"
            />
            {solicitando && !solicitudRD.fechaRango && (
              <small className="p-error">Rango de fecha es requerido</small>
            )}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Registro</label>
            <Calendar
              value={solicitudRD.fechaRegis}
              readOnlyInput
              disabled
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Vencimiento</label>
            <Calendar
              //ref={vencimientoRef}
              //value={solicitudRD.fechaVenc}
              value={
                // new Date()
                // new Date(
                //   "Fri Jan 19 2024 10:49:08 GMT-0500 (hora estándar de Perú)"
                //   //"Date Wed Jan 24 2024 00:00:00 GMT-0500 (hora estándar de Perú)"
                // )
                // solicitudRD.ordenDeViaje
                //   ? null
                //   :
                solicitudRD.tipoear?.id == "ORV"
                  ? null
                  : solicitudRD.fechaVenc == null
                  ? new Date()
                  : solicitudRD.fechaVenc
              }
              dateFormat="dd/mm/yy"
              onChange={(e) =>
                setSolicitudRD((prevSolicitudRD) => ({
                  ...prevSolicitudRD,
                  fechaVenc: e.value,
                }))
              }
              disabled={true}
            />
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Selecciona Ruta</label>
            <div className="card flex">
              <Dropdown
                value={solicitudRD.ruta}
                onChange={(e) =>
                  setSolicitudRD((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    ruta: e.target.value,
                  }))
                }
                options={Ruta}
                optionLabel="name"
                placeholder="Selecciona Ruta"
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full md:w-14rem"
                disabled={
                  !estadosEditables.includes(solicitudRD.estado) |
                  (usuario.TipoUsuario != 1)
                }
              />
            </div>
            {solicitando && !solicitudRD.ruta?.name && (
              <small className="p-error">Ruta es requerida</small>
            )}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2 ml-2 ">
            <label htmlFor="countries">Comentarios</label>
            <div className="card flex">
              <InputTextarea
                autoResize
                value={solicitudRD.comentarios}
                onChange={(e) =>
                  setSolicitudRD((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    comentarios: e.target.value,
                  }))
                }
                rows={5}
                cols={30}
                maxLength={254}
                disabled={!estadosEditables.includes(solicitudRD.estado)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid"></div>
    </>
  );
}

export default GeneralSL;
