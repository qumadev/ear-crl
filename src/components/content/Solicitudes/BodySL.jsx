import React, { useContext, useEffect, useState } from "react";
import HeaderSL from "./HeaderSL";
import Solicitudes from "./Solicitudes";
import { useNavigate } from "react-router-dom";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import Filtrado from "./Componentes/subcomponentes/Filtrado";
import { ProgressSpinner } from "primereact/progressspinner";
import { AppContext } from "../../../App";
import { obtenerEstados } from "../../../services/axios.service";

export function BodySL({ responsiveSizeMobile }) {
  const [estados, setEstados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const { usuario, ruta } = useContext(AppContext);

  console.log(ruta);

  const navigate = useNavigate();

  const esSolicitudes = location.pathname.includes("solicitudes");

  const now = new Date();

  const [filtrado, setFiltrado] = useState({
    rangoFecha: [new Date(now.getFullYear(), 0, 1), new Date()],
    numeroSolicitudORendicion: '',
    estados: null,
    empleadoAsig: null,
    empNombre: "",
  });

  // Estado local para el formulario
  const [localFiltrado, setLocalFiltrado] = useState({ ...filtrado });

  /* Obtiene Estados */
  async function obtenerEstadosLocal() {
    let response = await obtenerEstados("<8" /*esSolicitudes ? "<8" : ">7"*/);
    let body = response.data.Result;

    // Excluir los estados con los IDs que no deseas mostrar
    const estadosFiltrados = body.filter(
      (estado) => !['4', '8', '12', '13', '14', '15', '18', '19', '20'].includes(estado.id)
    );

    console.log(estadosFiltrados);

    /*
    if (filtrado.estados == null && usuario.TipoUsuario == 2) {
      setFiltrado((...prevFiltrado) => ({
        ...prevFiltrado,
        estados: [body[1], body[2]], // Pendiente y En Autorización SR (Autorizador)
      }));
    } else if (filtrado.estados == null && usuario.TipoUsuario == 1) {
      setFiltrado((...prevFiltrado) => ({
        ...prevFiltrado,
        estados: [body[0], body[4], body[6]], // Borrador y En Autorización SR (Usuario)
      }));
    }
    */

    // Actualizar el estado con los estados filtrados
    setEstados(estadosFiltrados);
  }

  const exportExcel = async () => {
    const XLSX = await import("xlsx");

    const solicitudesConFecha = solicitudes.map(solicitud => {
      if (!solicitud.STR_FECHA_APROBACION) {
        solicitud.STR_FECHA_APROBACION = "No se aprobó aún";  // Mensaje en caso de no haber fecha
      }
      return solicitud;
    });

    const worksheet = XLSX.utils.json_to_sheet(solicitudesConFecha);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAsExcelFile(excelBuffer, "Solicitudes");
  };

  const saveAsExcelFile = async (buffer, fileName) => {
    const FileSaver = await import("file-saver");

    if (FileSaver && FileSaver.default) {
      const EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const EXCEL_EXTENSION = ".xlsx";
      const data = new Blob([buffer], { type: EXCEL_TYPE });

      FileSaver.default.saveAs(
        data,
        fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
      );
    }
  };

  async function changeEstadosValida() {
    obtenerEstadosLocal();
    // if (estados?.length > 0) {
    //   if (filtrado.estados == null && usuario.TipoUsuario == 2) {
    //     console.log("useEffect filtrado 2", estados);
    //     setFiltrado((...prevFiltrado) => ({
    //       ...prevFiltrado,
    //       estados: [estados[1], estados[2]],
    //     }));
    //   }
    // }
  }

  useEffect(() => {
    changeEstadosValida();
  }, []);

  // Header //
  const header = (
    <>
      <div className="flex justify-content-between flex-wrap">
        <div
          className={`flex ${responsiveSizeMobile ? `text-xl` : `text-2xl`
            } align-items-center`}
        // className={`flex  text-2xl align-items-center`}
        >
          Lista de Solicitudes
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {/* <Button
            icon="pi pi-refresh"
            onClick={() => {
              setFiltrado((prevFiltrado) => ({
                ...prevFiltrado,
              }));
            }}
            severity="secondary"
          /> */}
          <Button
            icon="pi pi-eraser"
            severity="secondary"
            onClick={() => {
              const initialFilters = {
                rangoFecha: [new Date(now.getFullYear(), 0, 1), new Date()],
                numeroSolicitudORendicion: '',
                empNombre: '',
                estados: null,
                empleadoAsig: null,
              };

              // Reiniciar el estado local
              setLocalFiltrado(initialFilters);

              // Sincronizar el estado global para que la tabla vuelva al estado inicial
              setFiltrado(initialFilters);
            }}
          />
          <Button
            icon="pi pi-search"
            label="Buscar"
            severity="success"
            onClick={() => setFiltrado({ ...localFiltrado })} // Actualiza los filtros globales
            disabled={
              !localFiltrado.numeroSolicitudORendicion &&
              !localFiltrado.empNombre &&
              !localFiltrado.estados?.length &&
              (!localFiltrado.rangoFecha || localFiltrado.rangoFecha.length === 0)
            }
          />
          <Button
            label="Agregar"
            icon="pi pi-plus"
            severity="success"
            onClick={() => {
              navigate(ruta + "/solicitudes/agregar");
            }}
            disabled={(usuario.rol.id != 1)}
          />
          {/* <Button
            label="Ver"
            icon="pi pi-eye"
            severity="success"
            onClick={() => {
              navigate(ruta + "/solicitudes/6");
            }}
          /> */}
          <Button
            label="Exportar"
            icon="pi pi-upload"
            severity="secondary"
            style={{ backgroundColor: "black" }}
            onClick={() => {
              exportExcel();
            }}
          />
        </div>
      </div>
      <Divider />
      <Filtrado
        estados={estados}
        setEstados={setEstados}
        localFiltrado={localFiltrado}
        setLocalFiltrado={setLocalFiltrado}
      />
    </>
  );

  return (
    <>
      <div className="card">
        <HeaderSL
          estados={estados}
          setEstados={setEstados}
          filtrado={filtrado}
          setFiltrado={setFiltrado}
          header={header}
        />
        <Solicitudes
          responsiveSizeMobile={responsiveSizeMobile}
          header={header}
          estados={estados}
          setEstados={setEstados}
          filtrado={filtrado}
          setFiltrado={setFiltrado}
          solicitudes={solicitudes}
          setSolicitudes={setSolicitudes}
        />
      </div>
    </>
  );
}
