import React, { useState } from "react";
import "primeflex/primeflex.css";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

function CambioContraseña() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    return(
        <>
            <div>
                <div className="mb-3 flex flex-column gap-2">
                    <p className="text-black" style={{ fontSize: "1.2em", marginTop: "60px"}}>
                        Digite la contraseña actual
                    </p>
                </div>
                <div className="my-1">
                    <Password
                        value={currentPassword}
                        placeholder="Actual contraseña"
                        onChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                        tabIndex={1}
                        feedback={false}
                    />
                </div>
                <div className="mb-3 flex flex-column gap-2">
                    <p className="text-black" style={{ fontSize: "1.2em", marginTop: "60px" }}>
                        Digite la contraseña nueva
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
            </div>
        </>
    );
}

export default CambioContraseña;