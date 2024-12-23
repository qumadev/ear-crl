import React, { useContext, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { TabPanel, TabView } from "primereact/tabview";
import FormDT from "./Sub/FormDT";
import { v4 as uuidv4 } from 'uuid';

import {
  useNavigate,
  useParams,
  useLocation,
  useResolvedPath,
  Navigate,
} from "react-router-dom";
import {
  actualizaDocumento,
  actualizarDocumento,
  actualizarSolicitud,
  crearDocumento,
  obtenerCentroCosto,
  obtenerDocumento,
  obtenerIndicadores,
  obtenerItems,
  obtenerProveedores,
  obtenerProyectos,
  obtenerTipoDocs,
  obtieneAdjuntosDoc,
  obtenerRendicion
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
  const esModo = location.pathname.includes("agregar") ? "Agregar" :
    location.pathname.includes("editar") ? "Editar" : "Detalle";
  const { config, ruta } = useContext(AppContext);
  const fileUploadRef = useRef(null);
  const tipoRendicion = location.state && location.state.tipoRendicion;
  const empldAsig = location.state && location.state.empleadoAsignado;
  const idDetalle = location.state && location.state.idDetalle;
  const almacen = location.state && location.state.almacen;
  const idDocumento = location.state && location.state.idDocumento;
  const editable = location.state && location.state.editable;
  const fechaSolicitud = location.state && location.state.fechaSolicitud;
  const [totalRedondeado, setTotalRedondeado] = useState(0);

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

  const [rendicion, setRendicion] = useState(null);
  const [documento, setDocumento] = useState({ STR_AFECTACION: '-' });

  const obtenerRendicionPorId = async (idRendicion) => {
    try {
      const response = await obtenerRendicion(idRendicion)

      if (response.status < 300 && response.data) {
        const datosRendicion = response.data.Result[0];
        setRendicion(datosRendicion);
      } else {
        showError("No se encontró la rendicion con el ID")
      }
    } catch (error) {
      console.error("Error al obtener la rendicion: ", error);
      showError("Ocurrió un error al intentar obtener la rendición")
    }
  }

  useEffect(() => {
    const rendicionId = documento?.STR_RD_ID ?? id;

    if (rendicionId) {
      obtenerRendicionPorId(rendicionId)
    }
  }, [documento?.STR_RD_ID, id])

  async function obtenerData() {
    //let id = 8
    const response = await Promise.all([
      // obtenerTipos(),
      obtenerDocumento(id),
    ]);
    let body = response[0].data.Result[0]
    body.STR_FECHA_DOC = getFechaLargo(body.STR_FECHA_DOC)
    body.STR_FECHA_VENCIMIENTO = getFechaLargo(body.STR_FECHA_VENCIMIENTO)
    body.STR_FECHA_CONTABILIZA = getFechaLargo(body.STR_FECHA_CONTABILIZA)
    setDocumento(body)
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

  useEffect(() => {
    if (esModo !== "Agregar") {
      obtenerData();
    }
    //setDocumentoDet(articulos)
    // setDocumento(...documento, DocumentoDet)
  }, []);

  const [detalles, setDetalles] = useState([]); // Lista de detalles
  const [anexos, setAnexos] = useState([]);

  const [detalle, setDetalle] = useState({
    // Detalle a Registrar
  });

  const toast = useRef(null);
  const navigate = useNavigate();

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

  function formatearFecha(fecha) {
    const fechaOriginal = new Date(fecha);
    const dia = fechaOriginal.getDate().toString().padStart(2, '0');
    const mes = (fechaOriginal.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaOriginal.getFullYear();
    return `${dia}-${mes}-${año}`;
  }

  /* Metodo para agregar */
  const registrarRD = async () => {
    setLoading(true);
    try {
      if (!detalle || detalle.length === 0) {
        showError("Debe ingresar al menos un detalle para registrar el documento.");
        setLoading(false);
        return; // Termina la ejecución si no hay detalles
      }

      const _detalles = detalle.map((detalle) => ({
        ID: detalle.ID ? detalle.ID : null,
        STR_CODARTICULO: detalle.Cod,
        STR_INDIC_IMPUESTO: detalle.IndImpuesto,
        STR_DIM1: detalle.UnidadNegocio,
        STR_DIM2: detalle.Filial,
        STR_DIM3: detalle.STR_DIM3 ? detalle.STR_DIM3 : null,
        STR_DIM4: detalle.Areas,
        STR_DIM5: detalle.CentroCosto,
        STR_ALMACEN: detalle.Almacen,
        STR_CANTIDAD: detalle.Cantidad,
        STR_TPO_OPERACION: null,
        STR_DOC_ID: id,
        STR_CONCEPTO: detalle.Concepto,
        STR_PROYECTO: detalle.Proyecto,
        STR_PRECIO: detalle.Precio,
        STR_SUBTOTAL: detalle.Precio * detalle.Cantidad,
        STR_IMPUESTO: detalle.Impuesto,
      }));
      let subtotalTotal = _detalles.reduce((total, detalle) => total + parseFloat(detalle.STR_SUBTOTAL || 0), 0);
      let totalImpuestos = _detalles.reduce((total, detalle) => total + parseFloat(detalle.STR_IMPUESTO || 0), 0);
      let totalDocumento = subtotalTotal + totalImpuestos

      const tipoCambio = parseFloat(documento.STR_TIPO_CAMBIO) || 1; // Tipo de cambio
      let totalConvertido = totalDocumento; // Valor inicial, por si las monedas son iguales

      if (documento.STR_MONEDA?.Code === 'SOL' && rendicion?.STR_MONEDA?.id === 'USD') {
        totalConvertido = totalDocumento / tipoCambio; // Convertir de SOL a USD
      } else if (documento.STR_MONEDA?.Code === 'USD' && rendicion?.STR_MONEDA?.id === 'SOL') {
        totalConvertido = totalDocumento * tipoCambio; // Convertir de USD a SOL
      }

      // Convertir el monto a SOLES para validación
      const totalEnSoles = (rendicion?.STR_MONEDA?.id === 'USD')
        ? totalConvertido * tipoCambio // Convertir USD a SOL
        : totalConvertido;

      let descuento = 0;
      if (documento?.STR_AFECTACION?.name === "Retencion" && totalEnSoles > 700) {
        descuento = 0.03; // 3% para Retención si supera 700 SOL
      } else if (documento?.STR_AFECTACION?.name === "Detraccion") {
        descuento = 0.10; // 10% siempre para Detracción
      }

      // Aplicar el descuento al total convertido
      totalConvertido = totalConvertido - (totalConvertido * descuento);

      let _documento = {
        ...documento,
        ID: id,
        STR_RENDICION: id,
        STR_RD_ID: id,
        //STR_VALIDA_SUNAT: null,
        STR_OPERACION: null,
        STR_PARTIDAFLUJO: null,
        STR_MONEDA: {
          id: documento.STR_MONEDA?.id,
          name: documento.STR_MONEDA?.name || documento.STR_MONEDA?.Code
        },
        STR_TIPO_CAMBIO: documento.STR_TIPO_CAMBIO,
        STR_TOTALDOC: totalDocumento,
        STR_TOTALDOC_CONVERTIDO: totalConvertido,
        STR_CANTIDAD: null,
        STR_FECHA_CONTABILIZA: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0], // aaaa-mm-dd
        STR_FECHA_DOC: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0], // aaaa-mm-dd
        STR_FECHA_VENCIMIENTO: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0], // aaaa-mm-dd
        detalles: _detalles,
        STR_VALIDA_SUNAT: compExisteSunat,
      };
      let response = await crearDocumento(_documento); // Crea Documento
      if (response.CodRespuesta != "99") {
        var content = response.data.Result[0];
        showSuccess(`Documento creado con ID: ${content.id}`);

        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigate(ruta + "/rendiciones/info/" + id)
      } else {
        showError("Error al crear documento");
      }
    } catch (error) {
      showError("Error al crear documento");
    } finally {
      setLoading(false);
    }
  };

  const datosState = {
    "ID": null,
    "STR_RENDICION": null,
    "STR_FECHA_CONTABILIZA": null,
    "STR_FECHA_DOC": null,
    "STR_FECHA_VENCIMIENTO": null,
    "STR_PROVEEDOR": { "CardCode": null, "CardName": null, "LicTradNum": null },
    "STR_MONEDA": { "id": null, "name": null },
    "STR_COMENTARIOS": null,
    "STR_TIPO_DOC": { "id": null, "name": null },
    "STR_SERIE_DOC": null,
    "STR_CORR_DOC": null,
    "STR_VALIDA_SUNAT": null,
    "STR_OPERACION": null,
    "STR_PARTIDAFLUJO": null,
    "STR_TOTALDOC": null,
    "STR_RD_ID": null,
    "STR_CANTIDAD": null,
    "STR_ALMACEN": null,
    "STR_RUC": null,
    "STR_RAZONSOCIAL": null,
    "STR_DIRECCION": null,
    "detalles": []
  }

  function formatDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  const updateRD = async () => {
    setLoading(true);
    try {
      if (!detalle || detalle.length === 0) {
        showError("Debe ingresar al menos un detalle para actualizar el documento.");
        setLoading(false);
        return; // Termina la ejecución si no hay detalles
      }

      if (detalle && detalle.length > 0) {
        const _detalles = detalle.map((detalle) => ({
          ID: detalle.ID ? detalle.ID : null,
          STR_CODARTICULO: detalle.Cod,
          // STR_SUBTOTAL: detalle.STR_SUBTOTAL,
          STR_INDIC_IMPUESTO: detalle.IndImpuesto,
          STR_DIM1: detalle.UnidadNegocio,
          STR_DIM2: detalle.Filial,
          STR_DIM3: detalle.STR_DIM3 ? detalle.STR_DIM3 : null,
          STR_DIM4: detalle.Areas,
          STR_DIM5: detalle.CentroCosto,
          STR_ALMACEN: detalle.Almacen,
          STR_CANTIDAD: detalle.Cantidad,
          STR_TPO_OPERACION: detalle.STR_TPO_OPERACION,
          STR_DOC_ID: detalle.STR_DOC_ID,
          STR_CONCEPTO: detalle.Concepto,
          STR_PROYECTO: detalle.Proyecto,
          STR_PRECIO: detalle.Precio,
          STR_IMPUESTO: detalle.Impuesto,
          STR_SUBTOTAL: detalle.Precio * detalle.Cantidad,
          FLG_ELIM: detalle.FLG_ELIM === 1 ? 1 : 0,
        }));

        let subtotalTotal = _detalles.reduce((total, detalle) => total + parseFloat(detalle.STR_SUBTOTAL || 0), 0);
        let totalImpuestos = _detalles.reduce((total, detalle) => total + parseFloat(detalle.STR_IMPUESTO || 0), 0);

        // Aquí sumamos el subtotal más los impuestos sin duplicarlos
        let totalDocumento = subtotalTotal + totalImpuestos

        const tipoCambio = parseFloat(documento.STR_TIPO_CAMBIO) || 1; // Tipo de cambio
        let totalConvertido = totalDocumento;

        if (documento.STR_MONEDA?.Code === 'SOL' && rendicion?.STR_MONEDA?.id === 'USD') {
          totalConvertido = totalDocumento / tipoCambio; // Convertir de SOL a USD
        } else if (documento.STR_MONEDA?.Code === 'USD' && rendicion?.STR_MONEDA?.id === 'SOL') {
          totalConvertido = totalDocumento * tipoCambio; // Convertir de USD a SOL
        }

        const totalEnSoles = (rendicion?.STR_MONEDA?.id === 'USD')
          ? totalConvertido * tipoCambio // Convertir USD a SOL
          : totalConvertido;

        let descuento = 0;
        if (documento?.STR_AFECTACION?.name === "Retencion" && totalEnSoles > 700) {
          descuento = 0.03; // 3% para Retención si supera 700 SOL
        } else if (documento?.STR_AFECTACION?.name === "Detraccion") {
          descuento = 0.10; // 10% siempre para Detracción
        }

        totalConvertido = totalConvertido - (totalConvertido * descuento);

        let _documento = {
          ...documento,
          ID: id,
          STR_RENDICION: documento.STR_RD_ID,
          STR_OPERACION: null,
          STR_PARTIDAFLUJO: null,
          STR_MONEDA: {
            id: documento.STR_MONEDA?.id,
            name: documento.STR_MONEDA?.name || documento.STR_MONEDA?.Code
          },
          STR_TOTALDOC: totalDocumento,
          STR_TOTALDOC_CONVERTIDO: totalConvertido,
          STR_CANTIDAD: null,
          STR_FECHA_CONTABILIZA: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0],
          STR_FECHA_DOC: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0],
          STR_FECHA_VENCIMIENTO: new Date(documento.STR_FECHA_DOC).toISOString().split('T')[0],
          STR_VALIDA_SUNAT: compExisteSunat,
          detalles: _detalles, // Detalles
        };

        let response = await actualizarDocumento(_documento); // _documento - Crea Documento
        if (response.CodRespuesta != "99") {
          var content = response.data.Result[0];
          showSuccess(`Documento actualizado con ID: ${content.id}`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          navigate(ruta + "/rendiciones/info/" + documento.STR_RD_ID);
          //navigate(`/rendiciones/${id}/documentos`);
        } else {
          showError("Error al Actualizar documento");
        }
      }
    } catch (error) {
      console.log("err: ", error);
    } finally {
      setLoading(false);
    }
  };

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
          showError(DescRespuesta);
        }
      });
    } catch (error) {
      showError("Error en el servidor");
    } finally {
      if (esModo === "Agregar") setLoadingTemplate(false);
      //setLoadingTemplate(false);
    }
  }

  const registrarDocumento = async () => {
    setLoading(true);

    // let body = obtieneJsonAregistrar();
    try {
      if (id == null) {
        var response = await crearDocumento(documento);

        if (response.status < 300) {
          let body = response.data.Result[0];

          showSuccess(`Se creó el documento exitosamente con id ${body.ID}`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          navigate(ruta + "/rendiciones");
        } else {
          showError("Se tuvo un error al crear el documento");
        }
      } else {
        var response = await actualizarSolicitud(documento);
        if (response.status < 300) {
          //let body = response.data.Result[0];

          showSuccess(`Se actualizo exitosamente documento #${documento.ID}`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          navigate(ruta + "/solicitudes");
        } else {
          showError("Se tuvo un error al actualizar el documento");
        }
      }
    } catch (error) {
      console.log(error.Message);
    } finally {
      setLoading(false);
    }
  };


  const [campoValidoCabecera, setCampoValidoCabecera] = useState({
    STR_TIPO_DOC: false,
    STR_SERIE_DOC: false,
    STR_CORR_DOC: false,
    STR_PROVEEDOR: false,
    STR_MONEDA: false,
    STR_FECHA_DOC: false,
    STR_COMENTARIOS: false
  });

  const handleTotalChange = (nuevoTotal) => {
    setTotalRedondeado(nuevoTotal);
  }

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between flex-wrap">
        <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              esModo === "Agregar" ?
                navigate(ruta + "/rendiciones/info/" + id)
                :
                navigate(ruta + "/rendiciones/info/" + documento.STR_RD_ID)
            }}
          ></i>
          <div>{esModo === "Detalle" ? "Detalle" : "Registro"} de Documentos a Rendir</div>
        </div>
      </div>
      <Divider />
      <TabView
        ref={tabViewRef}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header={esModo + " Documento Sustentado"} > {/* "Agregar Documento Sustentado" */}
          <DocumentoSustentado
            documento={documento}
            setDocumento={setDocumento}
            detalles={documento.detalles}
            setDetalle={setDetalle}
            moneda={documento.STR_MONEDA}
            //esModoDetail={esModoDetail}
            esModo={esModo}
            setCampoValidoCabecera={setCampoValidoCabecera}
            onTotalChange={handleTotalChange}
          />
        </TabPanel>
      </TabView>
      <div className="card flex flex-wrap  gap-3 mx-3">
        {esModo === "Detalle" ? "" :
          <>
            <Button
              label={esModo === "Agregar" ? "Agregar Documento" : esModo === "Editar" ? "Actualizar Documento" : "Detalle"}
              //severity="info"
              size="large"
              //style={{ backgroundColor: "black", borderColor: "black" }}
              onClick={(e) => {
                const firstChar = documento.STR_SERIE_DOC.charAt(0).toUpperCase();
                if (esModo === "Agregar") {
                  if ((documento.STR_TIPO_DOC.name === 'Factura') && (firstChar !== 'F' && firstChar !== 'E')) {
                    e.preventDefault();
                    showError("La serie de las facturas tienen que comenzar con 'F' o 'E'");
                    return;
                  }
                  if ((documento.STR_SERIE_DOC.length !== 4)) {
                    e.preventDefault();
                    showError("La serie debe tener 4 digitos");
                    return;
                  }
                  // if ((documento.STR_TIPO_DOC.name === 'Boleta de venta') && (firstChar !== 'B')) {
                  //   e.preventDefault();
                  //   showError("La serie de las Boletas de venta tienen que comenzar con 'B'")
                  //   return;
                  // }
                  registrarRD();
                } else {
                  updateRD();
                }
                //registrarDocumento();
                //updateRD();
                //  if (!esModoRegistrar) updateRD();
                // else registrarRD();
                // else registrarDocumento();
              }}
              loading={loading}
              disabled={esModo === "Agregar" && !Object.values(campoValidoCabecera).every(Boolean)}
            //disabled={esModo==="Agregar" && !Object.values(campoValidoCabecera).every(Boolean) ? true : false}
            //disabled={!estadosEditables.includes(solicitudRD.estado)}
            />
            <Button
              label="Cancelar"
              severity="secondary"
              size="large"
              onClick={() => {
                // Validar si hay detalles
                if (esModo === "Editar") {
                  // Filtrar detalles persistidos (IDs que no son generados con uuidv4, asumiendo que son numéricos)
                  const detallesPersistidos = detalle.filter(
                    (det) => det.ID && !String(det.ID).includes("-") // Convertir ID a string para usar includes
                  );

                  // Validar si hay al menos un detalle persistido
                  if (detallesPersistidos.length === 0) {
                    showError("Debe existir al menos un detalle registrado en la base de datos para cancelar en modo edición.");
                    setLoading(false); // Aseguramos que no quede en estado de carga
                    return; // Salir si no hay detalles válidos
                  }
                }

                // Continuar con la navegación
                esModo === "Agregar"
                  ? navigate(ruta + "/rendiciones/info/" + id)
                  : navigate(ruta + "/rendiciones/info/" + documento.STR_RD_ID);
              }}
            />
          </>
        }
      </div>
    </div>
  );
}


export default FormularioRD;
