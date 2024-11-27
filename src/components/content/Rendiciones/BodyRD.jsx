import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import HeaderRD from "./Componentes/HeaderRD";
import Filtrado from "../Solicitudes/Componentes/subcomponentes/Filtrado";
import Rendiciones from "./Componentes/Rendiciones";
import { obtenerEstados } from "../../../services/axios.service";
import { AppContext } from "../../../App";

function BodyRD({ responsiveSizeMobile }) {
  const [estados, setEstados] = useState([]);
  const [rendiciones, setRendiciones] = useState([]);
  const [primeraCarga, setPrimeraCarga] = useState(true);
  const { usuario, ruta } = useContext(AppContext);
  const navigate = useNavigate();

  const now = new Date();
  // Valores iniciales
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
    let response = await obtenerEstados(">7" /*esSolicitudes ? "<8" : ">7"*/);
    let body = response.data.Result;

    // Excluir los estados con los IDs que no deseas mostrar
    const estadosFiltrados = body.filter(
      (estado) => !['4', '8', '12', '13', '14', '15', '18', '19', '20'].includes(estado.id)
    );

    setEstados(estadosFiltrados);

    console.log(estadosFiltrados);
    // if (filtrado.estados == null && usuario.TipoUsuario == 2) {
    //   setFiltrado((...prevFiltrado) => ({
    //     ...prevFiltrado,
    //     estados: [body[3], body[5]], // Pendiente y En Autorización SR (Autorizador)
    //   }));
    // } else if (filtrado.estados == null && usuario.TipoUsuario == 3) {
    //   setFiltrado((...prevFiltrado) => ({
    //     ...prevFiltrado,
    //     estados: [body[2]], // Borrador y En Autorización SR (Usuario)
    //   }));
    // } else if (filtrado.estados == null && usuario.TipoUsuario == 1) {
    //   // setFiltrado((...prevFiltrado) => ({
    //   //   ...prevFiltrado,
    //   //   estados: [body[0], body[1]], // Borrador y En Autorización SR (Usuario)
    //   // }));
    //   setFiltrado({
    //     rangoFecha: [],
    //     nrRendicion: null,
    //     estados: [body[0], body[1]],
    //   });
    // }
  }
  /*----------------------------- */

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(rendiciones);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAsExcelFile(excelBuffer, "rendiciones");
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

  useEffect(() => {
    obtenerEstadosLocal();
  }, []);

  const header = (
    <>
      <div className="flex justify-content-between flex-wrap">

        <div
          className={`flex ${responsiveSizeMobile ? `text-xl` : `text-2xl`
            } align-items-center`}
        // className={`flex  text-2xl align-items-center`}
        >
          Lista de Rendiciones
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
        <HeaderRD
          estados={estados}
          setEstados={setEstados}
          filtrado={filtrado}
          setFiltrado={setFiltrado}
          header={header}
        />
        <Rendiciones
          header={header}
          rendiciones={rendiciones}
          setRendiciones={setRendiciones}
          filtrado={filtrado}
          estados={estados}
        />
      </div>
    </>
  );
}

export default BodyRD;
