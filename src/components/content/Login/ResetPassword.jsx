import React, { useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../../services/axios.service";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./ResetPassword.css";

const MySwal = withReactContent(Swal);

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleReset = async (e) => {
		e.preventDefault();

		// Mostrar SweetAlert de cargando
		MySwal.fire({
			title: 'Procesando...',
			text: 'Estamos cambiando tu contraseña',
			allowOutsideClick: false,
			didOpen: () => {
				MySwal.showLoading();
			}
		});

		setLoading(true);
		const resp = await resetPassword(token, password);

		MySwal.close();

		if (resp.data && resp.data.mensaje && resp.data.mensaje.toLowerCase().includes("correcta")) {
			// Exito: contraseña cambiada
			MySwal.fire({
				icon: 'success',
				title: '¡Contraseña cambiada!',
				text: 'Serás redirigido al menú principal del portal.',
				timer: 2200,
				showConfirmButton: false
			});
			setTimeout(() => {
				navigate("/ear/login");
			}, 2200);
		} else {
			// Error: muestra mensaje recibido o uno por defecto
			MySwal.fire({
				icon: 'error',
				title: 'Error',
				text: resp?.data?.mensaje || "Ocurrió un error. Intenta nuevamente.",
				confirmButtonText: 'Aceptar'
			});
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
			<img src="/public/green_waves.png" alt="Fondo decorativo" className="wave-bg" />
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
								disabled={loading}
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
			</Card>
		</div>
	);
}
