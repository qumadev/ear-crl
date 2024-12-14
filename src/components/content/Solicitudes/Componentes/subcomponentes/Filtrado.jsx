import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "primereact/button";
import {
  obtenerEmpleados,
  obtenerEstados,
} from "../../../../../services/axios.service";
import { AppContext } from "../../../../../App";
import { Dropdown } from "primereact/dropdown";

export default function Filtrado({
  estados,
  setEstados,
  localFiltrado,
  setLocalFiltrado
}) {
  const { usuario } = useContext(AppContext);
  const [estadosTemp, setEstadosTemp] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const esModuloSolicitudes = location.pathname.includes("solicitudes")
  const esModuloRendiciones = location.pathname.includes("rendiciones")

  const handleInputChange = (field, value) => {
    setLocalFiltrado((prev) => ({ ...prev, [field]: value }));
  };

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

  async function obtenerEmpleadosLocal() {
  }

  useEffect(() => {
    //obtenerEstadosLocal();
    if (usuario.TipoUsuario != 1) {
      obtenerEmpleadosLocal();
    }
  }, []);


  return (
    <>
      <div className="grid mt-5">
        <div className="col-12 md:col-6 lg:col-3 ">
          <div className="mb-3 flex flex-column gap-2 justify-content-center">
            {" "}
            <Calendar
              value={localFiltrado.rangoFecha}
              onChange={(e) => handleInputChange("rangoFecha", e.value)}
              placeholder="Rango de Fechas"
              selectionMode="range"
              //readOnlyInput
              dateFormat="dd/mm/yy"
              locale="es"
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2 justify-content-center">
            <InputText
              value={localFiltrado.numeroSolicitudORendicion} // El campo compartido
              onChange={(e) => handleInputChange("numeroSolicitudORendicion", e.target.value)}
              placeholder={esModuloSolicitudes ? "N° de Solicitud" : "N° de Rendición"} // Cambia el placeholder según el módulo
            />
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2 justify-content-center">
            <InputText
              value={localFiltrado.empNombre || ""}
              onChange={(e) => handleInputChange("empNombre", e.target.value)}
              placeholder="Nombre del Empleado"
            />
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2 justify-content-center">
            {" "}
            <MultiSelect
              value={localFiltrado.estados}
              options={estados}
              onChange={(e) => handleInputChange("estados", e.value)}
              optionLabel="name"
              placeholder="Estado"
              className="p-column-filter"
              maxSelectedLabels={1}
              style={{ minWidth: "10rem" }}
              selectedItemsLabel={`${localFiltrado?.estados?.length} filtros seleccionados`}
            />
          </div>
        </div>
      </div>
      {usuario.TipoUsuario != 1 && (
        <div className="grid ">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="mb-3 flex flex-column gap-2 justify-content-center">
              {/*<Dropdown
                value={filtrado.empleadoAsig}
                onChange={(e) =>
                  setFiltrado((prevSolicitudRD) => ({
                    ...prevSolicitudRD,
                    empleadoAsig: e.target.value,
                  }))
                }
                options={empleados}
                optionLabel="name"
                placeholder="Selecciona Empleado"
                filter
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full md:w-14rem"
              />*/}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
