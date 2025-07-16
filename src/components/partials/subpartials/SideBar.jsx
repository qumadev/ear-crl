import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../App";

function SideBar({ responsiveSize, setSideBarActive, SideBarActive }) {
  const [modulos, setModulos] = useState({
    inicio: true,
    solicitudes: false,
    rendiciones: false,
    configuracion: false,
  });
  const { ruta } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <>
      <ul className="p-0">
        <li className="list-none">
          <div className="font-bold">INICIO</div>
          <ul className="p-0">
            <li className="list-none">
              <a
                className={`flex align-items-center relative outline-none cursor-pointer gap-2 pt-3 w-full hover:text-primary-600 ${modulos.inicio ? "text-primary-600" : ""
                  } no-underline`}
                style={{
                  padding: ".75rem 1rem",
                  borderRadius: "10px",
                  transition: "background-color .2s,box-shadow .2s",
                }}
                //href="/home"
                onClick={() => {
                  setModulos({
                    inicio: true,
                    solicitudes: false,
                    rendiciones: false,
                  });
                  navigate(ruta + "/home");
                  if (responsiveSize) {
                    setSideBarActive(!SideBarActive);
                  }
                }}
              >
                <i className="pi pi-home"></i>
                <span className="">Bienvenida</span>
              </a>
            </li>
          </ul>
        </li>
        <li className="list-none pt-3">
          <div className="font-bold">MODULOS</div>
          <ul className="p-0">
            <li className="list-none">
              <a
                className={`flex align-items-center relative outline-none hover:text-primary-600 cursor-pointer gap-2 pt-3 w-full ${modulos.solicitudes ? "text-primary-600" : ""
                  }`}
                style={{
                  padding: ".75rem 1rem",
                  borderRadius: "10px",
                  transition: "background-color .2s,box-shadow .2s",
                }}
                onClick={() => {
                  setModulos({
                    inicio: false,
                    solicitudes: true,
                    rendiciones: false,
                  });
                  navigate(ruta + "/solicitudes");
                  if (responsiveSize) {
                    setSideBarActive(!SideBarActive);
                  }
                }}
              >
                <i className="pi pi-pencil"></i>
                <span>Solicitudes</span>
              </a>
            </li>
            <li className="list-none">
              <a
                className={`flex align-items-center relative outline-none hover:text-primary-600 cursor-pointer gap-2 pt-3  w-full ${modulos.rendiciones ? "text-primary-600" : ""
                  }`}
                style={{
                  padding: ".75rem 1rem",
                  borderRadius: "10px",
                  transition: "background-color .2s,box-shadow .2s",
                }}
                onClick={() => {
                  setModulos({
                    inicio: false,
                    solicitudes: false,
                    rendiciones: true,
                  });
                  navigate(ruta + "/rendiciones");
                  if (responsiveSize) {
                    setSideBarActive(!SideBarActive);
                  }
                }}
              >
                <i className="pi pi-dollar"></i>
                <span>Rendiciones</span>
              </a>
            </li>
            <li className="list-none">
              <a
                className={`flex align-items-center relative outline-none hover:text-primary-600 cursor-pointer gap-2 pt-3 w-full ${modulos.configuraciones ? "text-primary-600" : ""
                  }`}
                style={{
                  padding: ".75rem 1rem",
                  borderRadius: "10px",
                  transition: "background-color .2s,box-shadow .2s",
                }}
                onClick={() => {
                  setModulos({
                    inicio: false,
                    solicitudes: false,
                    rendiciones: false,
                    configuraciones: true,
                  });
                  navigate(ruta + "/configuracion");
                  if (responsiveSize) {
                    setSideBarActive(!SideBarActive);
                  }
                }}
              >
                <i className="pi pi-cog"></i>
                <span>Configuración</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </>
  );
}

export default SideBar;
