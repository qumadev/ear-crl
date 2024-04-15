import React, { useContext, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { TabPanel, TabView } from "primereact/tabview";

import {
  useNavigate,
  useParams,
  useLocation,
  useResolvedPath,
  Navigate,
} from "react-router-dom";
import {
  actualizaDocumento,
  crearDocumento,
  obtenerCentroCosto,
  obtenerDocumento,
  obtenerIndicadores,
  obtenerItems,
  obtenerProveedores,
  obtenerProyectos,
  obtenerTipoDocs,
  obtieneAdjuntosDoc,
} from "../../../../../../services/axios.service";
import GeneralRD from "./GeneralRD";
import DetalleRD from "./DetalleRD";
import AnexoRD from "./AnexoRD";
import ReactDOM from "react-dom";
import { AppContext } from "../../../../../../App";
import Comprobante from "./Comprobante";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import DocumentoSustentado from "./DocumentoSustentado";

function FormularioRD() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabViewRef = useRef(null);
  const location = useLocation();
  const esModoRegistrar = location.pathname.includes("agregar");
  const { config, ruta } = useContext(AppContext);
  const fileUploadRef = useRef(null);
  const tipoRendicion = location.state && location.state.tipoRendicion;
  const empldAsig = location.state && location.state.empleadoAsignado;
  const idDetalle = location.state && location.state.idDetalle;
  const almacen = location.state && location.state.almacen;
  const idDocumento = location.state && location.state.idDocumento;
  const editable = location.state && location.state.editable;
  const fechaSolicitud = location.state && location.state.fechaSolicitud;
  const { id } = useParams();

  /* Agentes */
  let agentes = [
    {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "0",
      name: "Ninguno",
    },
    {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "1",
      name: "Retención",
    },
    {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "2",
      name: "Detracción",
    },
  ];
  /* Registro de Documentos */
  const [documento, setDocumento] = useState({
    ID: null,
    STR_RENDICION: null,
    STR_FECHA_CONTABILIZA: new Date(),
    STR_FECHA_DOC: new Date(),
    STR_FECHA_VENCIMIENTO: new Date(),
    STR_PROVEEDOR: {
      CardCode: null,
      CardName: null,
      LicTradNum: null,
    },
    STR_TIPO_AGENTE: agentes[0],
    STR_COMENTARIOS: null,
    STR_MONEDA: {
      Descripcion: null,
      Id: 0,
      Nombre: null,
      id: "SOL",
      name: "SOL",
    },
    STR_TIPO_DOC: {
      id: null,
      name: null,
    },
    STR_SERIE_DOC: null,
    STR_CORR_DOC: null,
    STR_VALIDA_SUNAT: false,
    STR_ANEXO_ADJUNTO: [],
    STR_TOTALDOC: 0.0,
    STR_PARTIDAFLUJO: null,
    STR_OPERACION: config.STR_OPERACION,
    STR_RD_ID: id,
  });

  const [detalles, setDetalles] = useState([]); // Lista de detalles
  const [anexos, setAnexos] = useState([]);

  const [detalle, setDetalle] = useState({
    // Detalle a Registrar
  });

  const toast = useRef(null);
  const navigate = useNavigate();

  /* Templates para DropDowns y formulario */
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

  const showSuccess = (mensaje) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: mensaje,
      life: 3000,
    });
  };

  const showError = (mensaje) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 3000,
    });
  };

  /* useStates a utilizar para el fomulario */
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [items, setItems] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [cups, setCups] = useState([]);
  const [tpoDocs, setTpoDocs] = useState([]);
  const [centroCosto, setCentroCosto] = useState([]);
  const [files, setFiles] = useState([]);
  const [consultSunat, setConsultSunat] = useState(true);
  const [existeEnSunat, setExisteEnSunat] = useState(true);
  const [compExisteSunat, setCompExisteSunat] = useState(false);

  /* Metodo para agregar */
  const registrarRD = async () => {
    setLoading(true);

    try {
      let _documento = {
        ...documento,
        STR_FECHA_CONTABILIZA:
          documento.STR_FECHA_CONTABILIZA.toISOString().split("T")[0],
        STR_FECHA_DOC: documento.STR_FECHA_DOC.toISOString().split("T")[0],
        STR_FECHA_VENCIMIENTO:
          documento.STR_FECHA_VENCIMIENTO.toISOString().split("T")[0],
        detalles: detalles,
        //STR_VALIDA_SUNAT: compExisteSunat,
        STR_ANEXO_ADJUNTO: Array.isArray(documento.STR_ANEXO_ADJUNTO)
          ? documento.STR_ANEXO_ADJUNTO.join(", ")
          : documento.STR_ANEXO_ADJUNTO,
      };

      console.log(_documento);
      let response = await crearDocumento(_documento); // Crea Documento
      if (response.CodRespuesta != "99") {
        var content = response.data.Result[0];
        console.log(`Documento creado con ID: ${content.id}`);
        showSuccess(`Documento creado con ID: ${content.id}`);
        navigate(ruta + `/rendiciones/${id}/documentos`);
      } else {
        showError("Error al crear documento");
      }
    } catch (error) {
      console.log(error.Message);
      showError("Error al crear documento");
    } finally {
      setLoading(false);
    }
  };

  const updateRD = async () => {
    setLoading(true);

    try {
      let _detalles = detalles.map((e) => {
        return typeof e.ID == "number" ? e : { ...e, ID: null };
      });

      console.log(_detalles);

      let _documento = {
        ...documento,
        STR_FECHA_CONTABILIZA:
          documento.STR_FECHA_CONTABILIZA.toISOString().split("T")[0],
        STR_FECHA_DOC: documento.STR_FECHA_DOC.toISOString().split("T")[0],
        STR_FECHA_VENCIMIENTO:
          documento.STR_FECHA_VENCIMIENTO.toISOString().split("T")[0],
        detalles: _detalles, // Detalles
        //STR_VALIDA_SUNAT: compExisteSunat,
        STR_ANEXO_ADJUNTO: Array.isArray(documento.STR_ANEXO_ADJUNTO)
          ? documento.STR_ANEXO_ADJUNTO.join(", ")
          : documento.STR_ANEXO_ADJUNTO,
      };

      console.log(_documento);

      let response = await actualizaDocumento(_documento); // Crea Documento
      if (response.CodRespuesta != "99") {
        var content = response.data.Result[0];
        console.log(`Documento actualizado con ID: ${content.id}`);
        showSuccess(`Documento actualizado con ID: ${content.id}`);
        //navigate(`/rendiciones/${id}/documentos`);
      } else {
        showError("Error al Actualizar documento");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  function changeFileTitle() {
    try {
      // console.log("changeFileTitle");
      const fileUploadNode = ReactDOM.findDOMNode(
        fileUploadRef.current.props.emptyTemplate._owner.child.child.child.child
          .stateNode
      );
      // console.log(fileUploadNode);
      if (fileUploadNode) {
        const fileBadgeSpans = fileUploadNode.querySelectorAll(
          ".p-fileupload-file-badge"
        );
        //  console.log(fileBadgeSpans);
        fileBadgeSpans.forEach((fileBadgeSpan) => {
          if (documento.STR_ANEXO_ADJUNTO.length > 0) {
            console.log("cambiando estado");
            fileBadgeSpan.innerText = "Cargado";
            fileBadgeSpan.classList.remove("p-badge-warning");
            fileBadgeSpan.classList.add("p-badge-success");
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function getFechaLargo(fechaCorta) {
    const fechaArray = fechaCorta.split("/"); // Divide la cadena en un array [día, mes, año]

    const fechaAnio = fechaArray[2];

    const fechaJs = new Date(
      fechaAnio.substring(0, 4),
      fechaArray[1] - 1,
      fechaArray[0]
    );

    return new Date(`${fechaJs}`);
  }

  async function getDocumento() {
    //setLoadingTemplate(true);
    try {
      console.log(idDocumento);
      let response = await obtenerDocumento(idDocumento);
      if (response.data.CodRespuesta != "99") {
        var body = response.data.Result[0];

        // if (body.STR_PROVEEDOR.CardCode == "P99999999999") {
        //   setProveedores((prevProveedores) =>
        //     prevProveedores.map((prov) =>
        //       prov.CardCode == "P99999999999"
        //         ? {
        //             ...prov,
        //             CardName: body.STR_PROVEEDOR.CardName,
        //             CardCode: body.STR_PROVEEDOR.CardCode,
        //             LicTradNum: body.STR_PROVEEDOR.LicTradNum,
        //           }
        //         : prov
        //     )
        //   );
        //   console.log(proveedores);
        // }

        if (body.STR_PROVEEDOR?.CardCode == "P99999999999") {
          setProveedores((prevProveedores) => [
            ...prevProveedores,
            body.STR_PROVEEDOR,
          ]);
          console.log(proveedores);
        }

        setDocumento({
          ...body,
          STR_FECHA_CONTABILIZA: getFechaLargo(body.STR_FECHA_CONTABILIZA),
          STR_FECHA_DOC: getFechaLargo(body.STR_FECHA_DOC),
          STR_FECHA_VENCIMIENTO: getFechaLargo(body.STR_FECHA_VENCIMIENTO),
        });

        setDetalles(body.detalles);
      }
    } catch (error) {
      showError("Error al obtener Documento");
      console.log(error);
    } finally {
      setLoadingTemplate(false);
      //setLoadingTemplate(false);
    }
  }

  async function SetDropDowns() {
    setLoadingTemplate(true);
    //setLoadingTemplate(true);
    try {
      const responses = await Promise.all([
        obtenerItems(tipoRendicion, almacen),
        obtenerCentroCosto(empldAsig),
        obtenerProveedores(),
        obtenerTipoDocs(),
        obtenerProyectos(),
        obtenerIndicadores(),
      ]);

      responses.forEach((response, index) => {
        const { CodRespuesta, DescRespuesta, Result } = response.data;

        if (CodRespuesta !== "99") {
          switch (index) {
            case 0:
              setItems(Result);
              break;
            case 1:
              setCentroCosto(Result);
              break;
            case 2:
              setProveedores(Result);
              break;
            case 3:
              setTpoDocs(Result);
              break;
            case 4:
              setProyectos(Result);
              break;
            case 5:
              setIndicadores(Result);
              break;
            default:
              break;
          }
        } else {
          console.log(response, index);
          showError(DescRespuesta);
        }
      });
    } catch (error) {
      console.log(error);
      showError("Error en el servidor");
    } finally {
      if (esModoRegistrar) setLoadingTemplate(false);
      //setLoadingTemplate(false);
    }
  }

  async function getAdjunto() {
    let response = await obtieneAdjuntosDoc(idDocumento);
    if (response.status < 300) {
      let files = response.data.Result;

      const newList = response.data.Result.map((e) => {
        if (e.data != null) {
          const base64Data = e.data;
          const binaryData = atob(base64Data);
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }

          // Crear un objeto Blob desde el array buffer
          const blob = new Blob([arrayBuffer], {
            type: e.type,
          });
          const blobUrl = URL.createObjectURL(blob);
          //console.log(blobUrl);
          e.objectURL = blobUrl;
          /*
          const blob = new Blob([blobData]);
          const blobUrl = URL.createObjectURL(blob);
          e.objectURL = blobUrl;
          console.log(blobUrl);
        */
        }
        return e;
      });

      setAnexos(newList);
      setFiles(newList);
    } else {
      console.log("No tiene adjuntos");
    }
  }

  useEffect(() => {
    console.log(fechaSolicitud, editable, tipoRendicion);
    //setLoadingTemplate(true);
    // if (!esModoRegistrar) {
    //   getDocumento();
    // } else {
    SetDropDowns();
    if (!esModoRegistrar) {
      getDocumento();
      getAdjunto();
    }
    //setLoadingTemplate(false);
    //   console.log(config);
    // }

    const handleKeyDown = (event) => {
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      if (isCtrlPressed) {
        switch (event.key) {
          case "ArrowLeft":
            setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
            break;
          case "ArrowRight":
            setActiveIndex((prevIndex) =>
              Math.min(
                tabViewRef.current.props.children.filter((c) => c != false)
                  .length - 1,
                prevIndex + 1
              )
            );
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loadingTemplate) {
    return (
      <div className="card flex justify-content-center">
        <Toast ref={toast} />
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between flex-wrap">
        <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              navigate(ruta + `/rendiciones/${id}/documentos`);
            }}
          ></i>
          <div>Registro de Documentos a Rendir - #{idDocumento}</div>
        </div>
      </div>
      <Divider />
      <TabView
        ref={tabViewRef}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Agregar Documento Sustentado">
            <DocumentoSustentado></DocumentoSustentado>
        </TabPanel>
        <TabPanel header="General">
          <GeneralRD
            fechaContabilizacion={documento.STR_FECHA_CONTABILIZA}
            fechaDocumento={documento.STR_FECHA_DOC}
            fechaVencimiento={documento.STR_FECHA_VENCIMIENTO}
            proveedor={documento.STR_PROVEEDOR}
            ruc={documento.STR_PROVEEDOR?.LicTradNum}
            razonSocial={documento.STR_PROVEEDOR?.CardName}
            tipoAgente={documento.STR_TIPO_AGENTE}
            comentarios={documento.STR_COMENTARIOS}
            setDocumento={setDocumento}
            selectedOptionDefault={selectedOptionTemplate}
            complementoOptionDefault={complementoOptionTemplate}
            proveedores={proveedores}
            agentes={agentes}
            consultSunat={consultSunat}
            setConsultSunat={setConsultSunat}
            setProveedores={setProveedores}
            showSuccess={showSuccess}
            showError={showError}
            existeEnSunat={existeEnSunat}
            setExisteEnSunat={setExisteEnSunat}
            editable={editable}
            fechaSolicitud={fechaSolicitud}
            getFechaLargo={getFechaLargo}
          />
        </TabPanel>
        <TabPanel header="Comprobante">
          <Comprobante
            tipo={documento.STR_TIPO_DOC}
            serie={documento.STR_SERIE_DOC}
            correlativo={documento.STR_CORR_DOC}
            fechaEmision={documento.STR_FECHA_DOC}
            setDocumento={setDocumento}
            tpoDocs={tpoDocs}
            showSuccess={showSuccess}
            existeSunat={documento.STR_VALIDA_SUNAT}
            //setCompExisteSunat={setCompExisteSunat}
            ruc={documento.STR_PROVEEDOR?.LicTradNum}
            fechaDocumento={documento.STR_FECHA_DOC}
            showError={showError}
            monto={documento.STR_TOTALDOC}
            editable={editable}
          />
        </TabPanel>
        <TabPanel header="Detalle">
          <DetalleRD
            almacen={almacen}
            setDetalles={setDetalles}
            detalles={detalles}
            moneda={documento.STR_MONEDA}
            tipo={documento.STR_TIPO_DOC}
            serie={documento.STR_SERIE_DOC}
            correlativo={documento.STR_CORR_DOC}
            fechaEmision={documento.STR_FECHA_DOC}
            //documento={documento}
            setDocumento={setDocumento}
            selectedOptionDefault={selectedOptionTemplate}
            complementoOptionDefault={complementoOptionTemplate}
            showSuccess={showSuccess}
            showError={showError}
            loading={loading}
            setLoading={setLoading}
            items={items}
            proyectos={proyectos}
            indicadores={indicadores}
            cups={cups}
            setCups={setCups}
            centroCosto={centroCosto}
            idDetalle={idDetalle}
            tpoOperacion={config.STR_OPERACION}
            documentoId={documento.ID}
            editable={editable}
          />
        </TabPanel>
        <TabPanel header="Anexos">
          <AnexoRD
            anexos={anexos}
            setAnexos={setAnexos}
            setDocumento={setDocumento}
            showSuccess={showSuccess}
            showError={showError}
            fileUploadRef={fileUploadRef}
            STR_ANEXO_ADJUNTO={documento.STR_ANEXO_ADJUNTO}
            changeFileTitle={changeFileTitle}
            files={files}
            setFiles={setFiles}
            editable={editable}
          />
        </TabPanel>
      </TabView>
      <div className="card flex flex-wrap  gap-3 mx-3">
        <Button
          label={esModoRegistrar ? `Guardar Documento` : "Actualizar Documento"}
          severity="info"
          size="large"
          style={{ backgroundColor: "black", borderColor: "black" }}
          onClick={(e) => {
            if (!esModoRegistrar) updateRD();
            else registrarRD();
          }}
          loading={loading}
          disabled={editable}
        //disabled={!estadosEditables.includes(solicitudRD.estado)}
        />
        <Button
          label="Cancelar"
          severity="secondary"
          size="large"
          onClick={() => navigate(ruta + `/rendiciones/${id}/documentos`)}
        />
      </div>
    </div>
  );
}

export default FormularioRD;
