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
  }

  const exportExcel = async () => {
    const XLSX = await import("xlsx");

    const rendicionesFiltradas = rendiciones.map((rendicion, index) => {
      const totalApertura = Number(rendicion?.STR_TOTALAPERTURA ?? 0);
      const totalRendido = Number(rendicion?.STR_TOTALRENDIDO ?? 0);
      const diferencia = totalApertura - totalRendido;

      return {
        "#": index + 1,
        "Código": rendicion?.ID || "",
        "N° de la Rendición": rendicion?.STR_NRRENDICION || "",
        "N° de la Solicitud": rendicion?.STR_SOLICITUD || "",
        "Fecha de la Solicitud": rendicion?.STR_FECHAREGIS || "",
        "Fecha de la Rendición": rendicion?.STR_FECHAREGIS || "",
        "Rango fecha del evento": `${rendicion?.STR_FECHA_EVENTO_INICIAL || ""} - ${rendicion?.STR_FECHA_EVENTO_FINAL || ""}`,
        "Empleado Asignado": rendicion?.STR_EMPLDASIG_NOMBRE || "",
        "Centro de Costo (CeCo)": rendicion?.STR_CENTRO_COSTO?.name || "",
        "Proyecto": rendicion?.STR_PROYECTO?.name || "",
        "Moneda": rendicion?.STR_MONEDA?.id || "",
        "Monto a Rendir": `${rendicion?.STR_MONEDA?.name || ""} ${totalApertura.toFixed(2)}`,
        "Monto Rendido": `${rendicion?.STR_MONEDA?.name || ""} ${totalRendido.toFixed(2)}`,
        "Diferencia": `${rendicion?.STR_MONEDA?.name || ""} ${diferencia.toFixed(2)}`,
        "Estado": rendicion?.STR_ESTADO_INFO?.name || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rendicionesFiltradas);

    worksheet["!cols"] = [
      { wpx: 50 },
      { wpx: 50 },
      { wpx: 120 },
      { wpx: 120 },
      { wpx: 120 },
      { wpx: 120 },
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 120 },
      { wpx: 50 },
      { wpx: 120 },
      { wpx: 100 },
    ]

    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAsExcelFile(excelBuffer, "Rendiciones");
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
