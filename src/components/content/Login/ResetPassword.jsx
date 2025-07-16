import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../services/axios.service";

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [password, setPassword] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [loading, setLoading] = useState(false);

	const handleReset = async (e) => {
		e.preventDefault();
		setLoading(true);
		const resp = await resetPassword(token, password);
		if (resp.data && resp.data.mensaje) {
			setMensaje(resp.data.mensaje);
		} else {
			setMensaje("Ocurrió un error. Intenta nuevamente.");
		}
		setLoading(false);
	};

	return (
		<div className="reset-container">
			<h2>Restablecer Contraseña</h2>
			<form onSubmit={handleReset}>
				<input
					type="password"
					placeholder="Nueva contraseña"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Procesando..." : "Cambiar contraseña"}
				</button>
			</form>
			{mensaje && <div>{mensaje}</div>}
		</div>
	);
}
