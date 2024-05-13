import React from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../../../App";
import VerificarContraseña from "./BodyConfig/VerificarContraseña";

export function Config() {
  return(
    <>
      <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              Navigate(ruta + "/home");
            }}
          ></i>
        <div>
          Cambiar Contraseña
        </div>
      </div>
      <VerificarContraseña>
        
      </VerificarContraseña>
    </>
  );
}

