import React, { useContext, useState } from "react";
import "primeflex/primeflex.css";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { AppContext } from "../../../../App";
import { Navigate, useNavigate } from "react-router-dom";

function VerificarContraseña() {
    const [currentPassword, setCurrentPassword] = useState("");
    const navigate = useNavigate();
    const { usuario } = useContext(AppContext);
    console.log(usuario.password)

    return(
        <>
            <div>
                <div>
                    <p className="text-black" style={{ fontSize: "1.2em", paddingTop: "20px" }}>
                        Para actualizar tu contraseña, por favor ingresa tu contraseña actual:
                    </p>
                    <p className="text-black" style={{ fontSize: "1.2em", marginTop: "50px"}}>
                        Digite la contraseña actual
                    </p>
                </div>
                <div className="my-1">
                    <Password
                        value={currentPassword}
                        placeholder="Actual Contraseña"
                        style={{ height: "50px"}}
                        onChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                        tabIndex={1}
                        feedback={false}
                    />
                </div>
                <div className="card flex flex-wrap  gap-3 mx-3">
                    <Button
                        label="Continuar"
                        size="large"
                        style={{marginTop: '50px'}}
                        disabled={currentPassword != usuario.password}
                        onClick={() => 
                            navigate(ruta + `/configuracion`)
                        }
                    />
                </div>
            </div>
        </>
    );
}
export default VerificarContraseña;