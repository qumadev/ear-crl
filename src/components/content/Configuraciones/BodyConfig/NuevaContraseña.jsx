import React, { useContext, useState } from "react";
import { AppContext } from "../../../../App";
import { Password } from "primereact/password";
import { Button } from "@mui/material";


function NuevaContraseña() {
  const { usuario, ruta } = useContext(AppContext);
  const [newPassword, setNewPassword] = useState("");


  return(
    <>
      <div className="mb-3 flex flex-column gap-2">
        <p className="text-black" style={{ fontSize: "1.2em", marginTop: "60px" }}>
          Digite la nueva contraseña
        </p>
      </div>
      <div>
        <Password
          value={newPassword}
          placeholder="Nueva contraseña"
          tabIndex={2}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          promptLabel="Ingrese su contraseña nueva"
          weakLabel="Débil"
          mediumLabel="Modeado"
          strongLabel="Fuerte"
        />
      </div>
      <div className="mb-3 flex flex-column gap-2">
        <p className="text-black" style={{ fontSize: "1.2em", marginTop: "60px" }}>
          Digite nuevamente la nueva contraseña
        </p>
      </div>
      <div>
        <Password
          value={newPassword}
          placeholder="Nueva contraseña"
          tabIndex={2}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          promptLabel="Ingrese su contraseña nueva"
          weakLabel="Débil"
          mediumLabel="Modeado"
          strongLabel="Fuerte"
        />
      </div>
      <div className="card flex flex-wrap  gap-3 mx-3">
          <Button
            label="Aceptar"
            size="large"
            style={{marginTop: '50px'}}
          />
      </div>
    </>
  )
}
export default NuevaContraseña;