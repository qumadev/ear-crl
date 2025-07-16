import React, { useContext, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Password } from "primereact/password";
import { iniciaSesion, obtenInfoUser } from "../../../services/axios.service";
import { Toast } from "primereact/toast";
import { AppContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import { addLocale } from "primereact/api";
import { forgotPassword } from "../../../services/axios.service";
import ModalRecoverPassword from "../Login/ModalRecoverPassword"

export function Formulario() {
  const [loading, setLoading] = useState(false);
  const [loadingRecover, setLoadingRecover] = useState(false);
  const [showModalRecover, setShowModalRecover] = useState(false);
  const { setUsuario, usuario, ruta, config } = useContext(AppContext);
  const toast = useRef(null);
  const sociedades = [{ name: "REGATAS", code: "ELPTSERVER" }];
  const [selectSociedad, setSelectSociedad] = useState(sociedades[0]);
  const navigate = useNavigate();
  const buttonRef = useRef();

  const showSuccess = (detalle) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: detalle,
      life: 3000,
    });
  };

  const showError = (detalle) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: detalle,
      life: 3000,
    });
  };

  async function obtieneSesion() {
    setLoading(true);
    if (usuario != null && usuario.pass) {
      await iniciaSesion({ username: usuario.usuario, password: usuario.pass })
        .then(async (response) => {
          if (response.status < 300) {
            showSuccess("Se validó correctamente");
            let body = response.data.Result[0];

            localStorage.setItem("tk_pw", response.data.Token);

            setUsuario({ ...body, empId: body.username });
          } else {
            showError("Usuario y/o contraseña son invalidas");
          }
        })
        .catch((error) => {
          showError("Usuario y/o contraseña son invalidas");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      showError("Usuario y/o contraseña son invalidas");
    }
  }

  useEffect(() => {
    if (usuario != null && usuario.empId != null) {
      navigate(ruta + "/inicio", { replace: true });
    }
  }, [usuario]);

  const handleForgotPassword = async (email) => {
    setLoadingRecover(true);
    try {
      const resp = await forgotPassword(email);
      if (resp?.status < 300) {
        toast.current.show({
          severity: "success",
          summary: "Correo enviado",
          detail:
            resp.data?.mensaje ||
            "Si tu correo es válido, recibirás un enlace para restablecer tu contraseña.",
          life: 5000,
        });
        setShowModalRecover(false); // Cierra el modal al éxito
      } else {
        toast.current.show({
          severity: "warn",
          summary: "Atención",
          detail:
            resp.data?.mensaje ||
            "Si tu correo es válido, recibirás un enlace para restablecer tu contraseña.",
          life: 5000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo enviar el correo. Intenta de nuevo.",
        life: 5000,
      });
    } finally {
      setLoadingRecover(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="p-5">
        <form>
          <div className="flex justify-content-center">
            <Image
              //src="https://media.licdn.com/dms/image/D4E0BAQHXNK-UJQ81Gw/company-logo_200_200/0/1698942464169?e=2147483647&v=beta&t=5miWMzDnKFjQ19LtpGkDYaHpPavXmphP57WVyePWQh0"
              src={config?.LOGO_LOGIN}
              alt="Image"
              width="150"
            />
          </div>
          <div className="flex justify-content-center">
            <h2 className="text-gray-700">Bienvenido</h2>
          </div>{" "}
          <div className="flex justify-content-center">
            <p className="text-gray-700" style={{ fontSize: "1.2em" }}>
              Inicio de sesión: Acceda con sus credenciales
            </p>
          </div>
          <div className="card flex flex-column align-items-center gap-3 ">
            <div className="my-1">
              <InputText
                type="text"
                className="p-inputtext-lg w-full"
                placeholder="Ingrese usuario"
                value={usuario?.usuario || ""}
                onChange={(e) => {
                  setUsuario((prevUsuario) => ({
                    ...prevUsuario,
                    usuario: e.target.value,
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    buttonRef.current.click();
                  }
                }}
                tabIndex={1}
              />
            </div>
            <div className="my-1">
              <Password
                //value={pass}
                placeholder="Ingrese contraseña"
                value={usuario?.pass || ""}
                className="p-inputtext-lg w-full"
                onChange={(e) => {
                  setUsuario((prevUsuario) => ({
                    ...prevUsuario,
                    pass: e.target.value,
                  }));
                }}
                feedback={false}
                tabIndex={2}
                onkey
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    buttonRef.current.click();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex card justify-content-center my-2">
              <Dropdown
                //defaultValue={sociedades[0]}
                value={selectSociedad}
                onChange={(e) => setSelectSociedad(e.value)}
                options={sociedades}
                optionLabel="name"
                placeholder=" Sociedad"
                className="w-full md:w-14rem"
                tabIndex={3}
              />
            </div>
            <div className="flex my-1">
              <Button
                label="¿Olvidó su contraseña?"
                className="w-full"
                link
                onClick={(e) => {
                  e.preventDefault();
                  setShowModalRecover(true);
                }}
                tabIndex={4}
              />
            </div>
          </div>
          <div className="flex justify-content-center">
            <Button
              ref={buttonRef}
              severity="success"
              rounded
              size="large"
              event
              className="w-2/3"
              onClick={(e) => {
                e.preventDefault();
                obtieneSesion();
              }}
              tabIndex={5}
            >
              {loading ? (
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "2rem" }}
                ></i>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </div>
        </form>
      </div>

      <ModalRecoverPassword
        visible={showModalRecover}
        onHide={() => setShowModalRecover(false)}
        onSubmit={handleForgotPassword}
        loading={loadingRecover}
      />
    </>
  );
}
