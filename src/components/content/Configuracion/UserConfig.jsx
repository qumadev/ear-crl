import React, { useState, useEffect, useRef, useContext } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton"; // Importar Skeleton
import { ProgressSpinner } from "primereact/progressspinner"; // Importar ProgressSpinner
import ConfirmationDialog from "./ConfirmationDialog";
import { AppContext } from "../../../App";
import { updatePassword } from "../../../services/axios.service"

export function UserConfig() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [userLoading, setUserLoading] = useState(false);
	const [userInfo, setUserInfo] = useState({});
	const [originalUserInfo, setOriginalUserInfo] = useState({});
	const toast = useRef(null);
	const [isSaved, setIsSaved] = useState(true);
	const [confirmMessage, setConfirmMessage] = useState("");
	const [confirmAction, setConfirmAction] = useState(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [loading, setLoading] = useState(false); // Estado para manejar el spinner

	const { usuario } = useContext(AppContext);

	const showToast = (type, mensaje) => {
		toast.current.show({
			severity: type, // "success" o "error"
			summary: type === "success" ? "Éxito" : "Error",
			detail: mensaje,
			life: 3000,
		});
	};

	const confirmPasswordChange = (e) => {
		e.preventDefault();
		if (newPassword.length < 5 || newPassword.length > 20) {
			setError("La nueva contraseña debe tener entre 5 y 20 caracteres");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Las nuevas contraseñas no coinciden");
			return;
		}

		setConfirmMessage("¿Está seguro de que desea cambiar la contraseña?");
		setConfirmAction(() => handlePasswordSubmit);
		setConfirmVisible(true);
	};

	const handlePasswordSubmit = async () => {
		setLoading(true);
		try {
			const response = await updatePassword(
				usuario?.usuarioId,
				currentPassword,
				newPassword
			);

			if (response.data && response.data.mensaje) {
				showToast("success", response.data.mensaje);
				setError("");
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			} else {
				showToast("error", "No se pudo actualizar la contraseña.");
			}
		} catch (error) {
			console.log(error?.response);
			const msg = error?.response?.data?.mensaje || error?.response?.data?.Message || "Error inesperado";
			showToast("error", msg);
		}
		finally {
			setLoading(false);
			setConfirmVisible(false);
		}
	};

	return (
		<>
			<Toast ref={toast} />
			<div className="p-fluid">
				{userLoading ? (
					<div className="flex justify-content-center align-items-center">
						<Skeleton width="100%" height="2rem" />
						<Skeleton width="100%" height="2rem" />
						<Skeleton width="100%" height="2rem" />
					</div>
				) : (
					<>
						<h2>Configuración</h2>
						<Divider />
						<h3>Cambiar Contraseña</h3>
						<form onSubmit={confirmPasswordChange}>
							<div className="p-field p-col-12 p-md-6">
								<label htmlFor="currentPassword">Contraseña Actual:</label>
								<Password
									id="currentPassword"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									feedback={false}
									required
									className="p-inputtext-sm w-18rem mt-2"
									maxLength={20} // Limitar a 20 caracteres
								/>
							</div>
							<div className="p-field p-col-12 p-md-6">
								<label htmlFor="newPassword">Nueva Contraseña:</label>
								<Password
									id="newPassword"
									value={newPassword}
									onChange={(e) => {
										if (e.target.value.length <= 20) {
											setNewPassword(e.target.value);
										}
									}}
									required
									className="p-inputtext-sm w-18rem mt-2"
									maxLength={20} // Limitar a 20 caracteres
								/>
							</div>
							<div className="p-field p-col-12 p-md-6">
								<label htmlFor="confirmPassword">
									Confirmar Nueva Contraseña:
								</label>
								<Password
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => {
										if (e.target.value.length <= 20) {
											setConfirmPassword(e.target.value);
										}
									}}
									feedback={false}
									required
									className="p-inputtext-sm w-18rem mt-2"
									maxLength={20} // Limitar a 20 caracteres
								/>
							</div>
							{error && <p style={{ color: "red" }}>{error}</p>}
							<Button
								type="submit"
								label="Cambiar Contraseña"
								className="mt-2 w-18rem"
							/>
						</form>
					</>
				)}
			</div>
			<ConfirmationDialog
				visible={confirmVisible}
				message={confirmMessage}
				onConfirm={async () => {
					try {
						await confirmAction();
					} finally {
						setConfirmVisible(false);
					}
				}}
				onCancel={() => setConfirmVisible(false)}
				loading={loading} // Pasar el estado loading al ConfirmationDialog
			/>
		</>
	);
}