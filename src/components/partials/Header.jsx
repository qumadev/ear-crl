import React, { useState, useRef, useEffect, useContext } from "react";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { AppContext } from "../../App";
import { obtenCampoUsr, obtenInfoUser } from "../../services/axios.service";
import { useNavigate } from "react-router-dom";

export function Header({
  setSideBarActive,
  SideBarActive,
  responsiveSize,
  responsiveSizeMobile,
}) {
  const navigate = useNavigate();
  const { setUsuario, usuario, showError, ruta, config } =
    useContext(AppContext);

  const [cargo, setCargo] = useState("");
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredConfig, setIsHoveredConfig] = useState(false);
  const [isHoveredUs, setIsHoveredUs] = useState(false);

  const handleSpanClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  };

  function obtenePerfil(perfil) {
    switch (perfil) {
      case "1":
        return "Usuario";
      case 2:
        return "Autorizador";
      case 3:
        return "Contable";
      case 4:
        return "Administrador";
      default:
        return "No definido";
    }
  }

  const capitalizarNombres = (nombres) => {
    // Divide el string en palabras
    const palabras = nombres.split(" ");

    const nombresCapitalizados = palabras
      .map((palabra) => {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(" ");

    return nombresCapitalizados;
  };
  async function obtnDataUsuario() {
    try {
      const response = await obtenInfoUser(usuario.empId);
      if (response.data.Result.length > 0) {
        setUsuario((prevUsuario) => ({
          ...prevUsuario,
          TipoUsuario: response.data.Result[0].U_STR_Tipo_Usuario,
          Nombres: response.data.Result[0].Nombres,
          Cargo: response.data.Result[0].jobTitle,
          Sexo: response.data.Result[0].sex,
        }));
      }
    } catch (err) {
      showError("Error en servidor");
      console.error(err.message);
    } finally {
    }
  }
  //obtnDataUsuario();
  useEffect(() => {
    // obtnDataUsuario();
  }, []);

  return (
    <nav>
      <div
        className="flex w-full h-6rem bg-black-alpha-90 z-5 left-0 top-0 px-2 justify-content-center shadow-1 fixed "
        style={{
          transitionProperty: "left",
          transitionDuration: "0.2s",
          transitionTimingFunction: "ease",
          transitionDelay: "0s",
        }}
      >
        <div
          className={`flex justify-content-center w-18rem  ${
            !responsiveSize && `mr-8`
          }  text-2xl font-medium align-items-center`}
        >
          <Image
            //className="h-2rem "
            //src="https://media.licdn.com/dms/image/D4E0BAQHXNK-UJQ81Gw/company-logo_200_200/0/1698942464169?e=2147483647&v=beta&t=5miWMzDnKFjQ19LtpGkDYaHpPavXmphP57WVyePWQh0"
            src={config?.LOGO_LOGIN}
            alt="Image"
            height="50"
          />
          <span className="text-white">EAR - CRL</span>
        </div>
        <div className="flex  mr-2  text-2xl font-medium align-items-center">
          <Button
            icon="pi pi-bars"
            rounded
            text
            severity="success"
            aria-label="Search"
            size="large"
            style={{ color: "#97E723" }}
            onClick={() => setSideBarActive(!SideBarActive)}
          ></Button>
        </div>
        {!responsiveSizeMobile && (
          <div
            className={`flex justify-content-center w-6 ${
              !responsiveSize && `mr-8`
            }  ${
              responsiveSize == true ? `text-lg` : `text-3xl`
            } font-medium align-items-center`}
            //className={`flex justify-content-center w-6  mr-8 lg:text-3xl text-1xl font-medium align-items-center`}
          >
            <span className="font-semibold" style={{ color: "#97E723" }}>
              Gestión de fondos a Rendir
            </span>
          </div>
        )}

        <div
          className={`flex justify-content-end ${
            responsiveSize ? `w-10rem` : `w-25rem`
          }  text-2xl font-medium align-items-center gap-7 p-5 md:justify-content-between`}
        >
          {!responsiveSize && (
            <div
              className={`flex flex-column align-items-center  cursor-pointer ${
                isHoveredUs ? "hoveredperfil" : ""
              }`}
              onMouseEnter={() => setIsHoveredUs(true)}
              onMouseLeave={() => setIsHoveredUs(false)}
            >
              <Button
                icon="pi pi-user"
                rounded
                text
                severity="success"
                aria-label="Search"
                size="large"
                className="align-items-center justify-content-center"
                style={{ color: "#97E723" }}
              ></Button>
              <span className="text-xs perfil " style={{ color: "#ffffff", width: "7rem" }}>
                {usuario.nombres && capitalizarNombres(usuario.nombres)}
              </span>
              <span className="text-xs perfil" style={{ color: "#ffffff", width: "7rem" }}>
                Perfil: {obtenePerfil(usuario.rol?.id)} - Sede:{" "}
                {usuario.filial &&
                  capitalizarNombres(usuario.filial.U_ST_NombreFilial)}
              </span>
            </div>
          )}

          {/* <div
            className={`flex flex-column align-items-center cursor-pointer ${
              isHoveredConfig? "hoveredconfig" : ""
            }`}
            onMouseEnter={() => setIsHoveredConfig(true)}
            onMouseLeave={() => setIsHoveredConfig(false)}
          >
            <Button
            icon="pi pi-cog"
            rounded
            text
            severity="success"
            aria-label="Search"
            size="large"
            style={{ color: "#97E723"}}
            onClick={(e) => {
              navigate(ruta + "/configuracion");
            }}
            ></Button>
            <span
              className="text-xs"
              style={{ color: "#ffffff" }}
            >
              Configuración
            </span>
          </div> */}

          <div
            className={`flex flex-column align-items-center cursor-pointer ${
              isHovered ? "hoveredClose" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button
              icon="pi pi-sign-out"
              rounded
              text
              severity="success"
              aria-label="Search"
              size="large"
              style={{ color: "#97E723" }}
              ref={buttonRef}
              onClick={(e) => {
                setUsuario(null);
                navigate(ruta + "/login");
              }}
            ></Button>
            <span
              className="text-xs"
              style={{ color: "#ffffff" }}
              onClick={handleSpanClick}
            >
              Cerrar Sesión
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
