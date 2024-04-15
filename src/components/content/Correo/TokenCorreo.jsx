import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useNavigate, useParams } from "react-router-dom";
import {
  tokenRendicion,
  tokenSolicitud,
} from "../../../services/axios.service";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useBeforeunload } from "react-beforeunload";

export default function TokenCorreo() {
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);
  const esSolicitud = location.pathname.includes("solicitudes");
  const [descripErr, setDescripErr] = useState();
  const [tokenSent, setTokenSent] = useState(false); // Nuevo estado para controlar si la solicitud ya se envió
  const [success, setSuccess] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [visible, setVisible] = useState(true);
  const [token, setToken] = useState({
    idSolicitud: null,
    idAprobador: null,
    areaAprobador: null,
    accion: null,
  });

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

  const footerContent = (
    <div>
      <Button
        label="Salir"
        icon="pi pi-times"
        onClick={() => window.close()}
        className="p-button-text"
        severity={!success && `danger`}
      />
      <Button
        label="Ir al Portal"
        icon="pi pi-check"
        onClick={() => navigate("/")}
        autoFocus
        severity={!success && `danger`}
      />
    </div>
  );

  // async function EnviarTokenaBackend() {
  //   try {
  //     //console.log(id);
  //     let response = await enviarTokenAback(id);
  //     console.log(response);
  //     if (response.status < 300) {
  //       let body = response.data;
  //       setToken(body);
  //       setSuccess(true);
  //       showSuccess("Se completo la aprobación correctamente");
  //     } else {
  //       console.log(response);
  //       showError(response.Message);
  //       setDescripErr(response.Message);
  //       setSuccess(false);
  //     }
  //   } catch (error) {
  //     console.log(error.response.data.Message);
  //     showError(error.response.data.Message);
  //     setDescripErr(error.response.data.Message);
  //   } finally {
  //     setLoadingSkeleton(false);
  //   }
  // }

  const pageRefConf = useBeforeunload((event) => {
    if (loadingSkeleton == true) {
      event.preventDefault();
      // alert(
      //   "Se detecto una transacción pendiente. ¿Seguro que deseas cerrar ventana?"
      // );
      //event.preventDefault. = "fsf";
    }
  });

  useEffect(() => {
    //if (loadingSkeleton) {
    // Solo envía la solicitud si no se ha enviado antes
    //setLoadingSkeleton(false);

    async function EnviarToken() {
      try {
        //console.log(id);

        let response = esSolicitud
          ? await tokenSolicitud(id)
          : await tokenRendicion(id);

        console.log(response);
        if (response.status < 300) {
          let body = response.data;
          setToken(body);
          setSuccess(true);
          showSuccess("Se completo la aprobación correctamente");
          setLoadingSkeleton(false);
        } else {
          console.log(response);
          showError(response.Message);
          setDescripErr(response.Message);
          setSuccess(false);
          setLoadingSkeleton(false);
        }
      } catch (error) {
        console.log(error.response.data.Message);
        showError(error.response.data.Message);
        setDescripErr(error.response.data.Message);
        setLoadingSkeleton(false);
      } finally {
        // setLoadingSkeleton(false);
      }
    }

    EnviarToken();
    setTokenSent(true); // Marca la solicitud como enviada

    window.addEventListener("beforeunload", pageRefConf);
    return () => {
      window.removeEventListener("beforeunload", pageRefConf);
    };
  }, []);

  if (loadingSkeleton) {
    return (
      <div className="card flex justify-content-center">
        <Toast ref={toast} />
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      {success ? (
        <Dialog
          header={`Transacción exitosa de la ${
            esSolicitud
              ? `Solicitud de Rendición #${token.Item1}`
              : `Rendición #${token.Item6}`
          }`}
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => setVisible(false)}
          footer={footerContent}
        >
          <p className="m-0">
            {token.Item4 === "aceptar" ? (
              <>
                ¡Se aceptó la{" "}
                {esSolicitud ? "Solicitud de Rendición" : "Rendicón"}!
              </>
            ) : (
              <>
                ¡Se rechazó la{" "}
                {esSolicitud ? "Solicitud de Rendición" : "Rendicón"}!
              </>
            )}
            {/* <i className="pi pi-check" style={{ fontSize: "1rem" }}></i> */}
          </p>
        </Dialog>
      ) : (
        <Dialog
          header="Error"
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => setVisible(false)}
          footer={footerContent}
        >
          <p className="m-0 ">Error interno: {descripErr}.</p>
        </Dialog>
      )}
    </div>
  );
}
