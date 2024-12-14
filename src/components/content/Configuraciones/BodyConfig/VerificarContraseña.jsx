import React, { useContext, useState } from "react";
import "primeflex/primeflex.css";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { AppContext } from "../../../../App";
import { useNavigate } from "react-router-dom";

function VerificarContraseña() {
    const [currentPassword, setCurrentPassword] = useState("");
    const navigate = useNavigate();
    const { usuario, ruta } = useContext(AppContext);

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
                <div>
                    <Button
                        label="Continuar"
                        size="large"
                        severity="success"
                        style={{marginTop: '50px'}}
                        disabled={currentPassword != usuario.password}
                        onClick={() => {
                            navigate(ruta + "/configuracion/actualizar");
                        }}
                    />
                </div>
            </div>
        </>
    );
}
export default VerificarContraseña;