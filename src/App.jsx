import { useState, createContext, useEffect, useRef } from "react";
import { Login } from "./components/content/Login/Login";
import "../node_modules/primeflex/primeflex.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "../node_modules/primeicons/primeicons.css";
import { Header } from "./components/partials/Header";
import { Config } from "./components/content/Configuraciones/Config";
import { NotFound } from "./components/content/NotFound";
import { Toast } from "primereact/toast";
import { Componente } from "./components/Componente";
import Bienvenida from "./components/content/Inicio/Bienvenida";
import { BodySL } from "./components/content/Solicitudes/BodySL";
import FormularioSL from "./components/content/Solicitudes/Componentes/FormularioSL";
import Direccion from "./components/content/Solicitudes/Componentes/subcomponentes/Direccion";
import BodyRD from "./components/content/Rendiciones/BodyRD";
import { addLocale } from "primereact/api";
import { BodyDocs } from "./components/content/Rendiciones/Componentes/BodyDocs";
import FormularioRD from "./components/content/Rendiciones/Componentes/SubComponentes/Formulario/FormularioRD";
import { obtenerConf } from "./services/axios.service";
import { Aprobadores } from "./components/content/Rendiciones/Componentes/SubComponentes/Formulario/Aprobadores";
import TokenCorreo from "./components/content/Correo/TokenCorreo";
import VerSolicitud from "./components/content/Solicitudes/Componentes/subcomponentes/VerSolicitud";
import DocumentoSustentado from "./components/content/Rendiciones/Componentes/SubComponentes/Formulario/DocumentoSustentado";
import FormDT from "./components/content/Rendiciones/Componentes/SubComponentes/Formulario/Sub/FormDT";

export const AppContext = createContext(null);

export default function MyApp() {
  const [config, setConfig] = useState({});
  const [usuario, setUsuario] = useState({
    usuario: "",
    pass: "",
  });
  const toast = useRef(null);

  const ruta = "/ear"; // Servidor"/react-project";

  addLocale("es", {
    firstDayOfWeek: 1,
    showMonthAfterYear: true,
    dayNames: [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    monthNames: [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ],
    monthNamesShort: [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ],
    today: "Hoy",
    clear: "Limpiar",
  });

  // Produccion
  /* const [usuario, setUsuario] = useState({
    usuario: "",
    pass: "",
    empId: null,
  });
*/
  // Pruebas ELP
  // const [usuario, setUsuario] = useState({
  //   usuario: "DESKTOP-CLNDN92LENOVO",
  //   pass: "2881475",
  //   empId: 853,
  //   Nombres: "",
  // });

  // Pruebas ELP
  /* const [usuario, setUsuario] = useState({
    usuario: "DESKTOP-CLNDN92LENOVO",
    pass: "2881475",
    empId: 4753,
    Nombres: "",
  }); */

  const showError = (detalle) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: detalle,
      life: 3000,
    });
  };

  async function obtenerConfLocal() {
    let response = await obtenerConf();
    if (response.data.CodRespuesta != "99") {
      console.log(response.data.Result);
      setConfig(response.data.Result);
    } else {
      showError(response.data.DescRespuesta);
    }
  }

  useEffect(() => {
    obtenerConfLocal();
  }, []);

  useEffect(() => {
    <Header />;
  }, []);

  return (
    <AppContext.Provider
      value={{
        usuario,
        setUsuario,
        showError,
        config: config[0],
        ruta,
      }}
    >
      <Toast ref={toast} />
      <Router>
        <main>
          <Routes>
            <Route path={ruta + "/login"} element={<Login config={config} />} />
            <Route
              index
              element={
                <Componente>
                  <Bienvenida />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/"}
              element={
                <Componente>
                  <Bienvenida />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes/:id"}
              element={
                //<Componente>
                <TokenCorreo />
                //</Routes></Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/:id"}
              element={
                //<Componente>
                <TokenCorreo />
                //</Routes></Componente>
              }
            />
            <Route
              path={ruta + "/home"}
              element={
                <Componente>
                  <Bienvenida />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/Inicio"}
              element={
                <Componente>
                  <Bienvenida />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes"}
              element={
                <Componente>
                  <BodySL />
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes/6"}
              element={
                <Componente>
                  <VerSolicitud />
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes/agregar"}
              element={
                <Componente>
                  <FormularioSL />
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes/nuevo"}
              element={
                <Componente>
                  <FormularioSL />
                </Componente>
              }
            />
            <Route
              path={ruta + "/solicitudes/editar/:id"}
              ruta
              element={
                <Componente>
                  {/* <FormularioSL /> */}
                  <FormularioSL />
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones"}
              element={
                <Componente>
                  <BodyRD />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/ver"}
              element={
                <Componente>
                  <DocumentoSustentado />
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/:id/documentos"}
              element={
                <Componente>
                  <BodyDocs />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/info/:id"}
              element={
                <Componente>
                  <FormDT />{""}
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/:id/documentos/agregar"}
              element={
                <Componente>
                  <FormularioRD />{" "}
                </Componente>
              }
            /> 
            <Route
              path={ruta + "/rendiciones/:id/documentos/detail"}
              element={
                <Componente>
                  <FormularioRD />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/:id/documentos/editar"}
              element={
                <Componente>
                  <FormularioRD />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "/rendiciones/editar/:id"}
              element={
                <Componente>
                  <FormularioRD />{" "}
                </Componente>
              }
            />
            <Route
              path={ruta + "rendiciones/aprobadores/:id"}
              element={
                <Componente>
                  <Aprobadores />
                </Componente>
              }
            />
            <Route
              path={ruta + "/configuracion"}
              element={
                <Componente>
                  <Config />{" "}
                </Componente>
              }
            />
            {/*<Route 
              path={ruta + "/configuracion/actualizar"}
              element={
                <Componente>
                  <NuevaContraseña />
                </Componente>
              }
            />*/}
            <Route
              path={ruta + "/pruebas"}
              element={
                <Componente>
                  <Direccion />{" "}
                </Componente>
              }
            />
            <Route path={ruta + "/not-found"} element={<NotFound />} />
            {/*      <Route path="/*" element={<Navigate to="/not-found" />} /> */}
          </Routes>
        </main>
      </Router>
    </AppContext.Provider>
  );
}
