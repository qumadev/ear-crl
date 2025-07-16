import React, { useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
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
		<div
			style={{
				minHeight: "100vh",
				background: "#f4f8fb",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<Card
				style={{
					width: "400px",
					padding: "32px 32px 24px 32px",
					borderRadius: "12px",
					boxShadow: "0 2px 16px #e3e3e3"
				}}
			>
				<div className="flex justify-content-center mb-4">
					<i
						className="pi pi-lock"
						style={{
							fontSize: "3.5rem",
							color: "#36b654",
							marginBottom: 6,
							background: "#e7fbe8",
							borderRadius: "50%",
							padding: "20px"
						}}
					></i>
				</div>
				<h2 className="text-center mb-3" style={{ color: "#27374D" }}>
					Restablecer Contraseña
				</h2>
				<form onSubmit={handleReset}>
					<div className="mb-3">
						<label
							htmlFor="newPassword"
							className="block mb-2"
							style={{ color: "#222" }}
						>
							Nueva contraseña
						</label>
						{/* El wrapper es relativo para el panel de feedback */}
						<div style={{ position: "relative", width: "100%" }}>
							<Password
								id="newPassword"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full"
								inputClassName="w-full"
								required
								placeholder="Ingrese una contraseña segura"
								autoComplete="new-password"
							/>
						</div>
					</div>
					<Button
						label={loading ? "Procesando..." : "Cambiar contraseña"}
						type="submit"
						className="w-full"
						severity="success"
						disabled={loading}
						icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
						style={{ marginTop: 16 }}
					/>
				</form>
				{mensaje && (
					<div className="mt-4 text-center" style={{ color: "#36b654" }}>
						{mensaje}
					</div>
				)}
			</Card>
		</div>
	);

}
