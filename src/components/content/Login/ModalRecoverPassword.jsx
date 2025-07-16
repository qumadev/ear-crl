import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function ModalRecoverPassword({ visible, onHide, onSubmit, loading }) {
	const [email, setEmail] = useState("");
	const toast = useRef(null);

	useEffect(() => {
		if (!visible) setEmail("");
	}, [visible]);

	const handleSend = () => {
		if (!email) {
			toast.current.show({
				severity: "warn",
				summary: "Advertencia",
				detail: "Debes ingresar un correo electrónico.",
				life: 3000,
			});
			return;
		}

		if (!esCorreoValido(email)) {
			toast.current.show({
				severity: "warn",
				summary: "Advertencia",
				detail: "El correo electrónico no es válido.",
				life: 3000,
			});
			return;
		}

		onSubmit(email);
	};

	function esCorreoValido(correo) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
	}

	return (
		<>
			<Toast ref={toast} />
			<Dialog
				header={<div style={{ textAlign: "center", width: "100%" }}>Reestablecer Contraseña</div>}
				visible={visible}
				style={{ width: "400px" }}
				onHide={onHide}
				modal
				closable
				footer={
					<div className="flex justify-content-end gap-2">
						<Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" disabled={loading} />
						<Button
							label={loading ? "Enviando..." : "Enviar"}
							icon={loading ? "pi pi-spin pi-spinner" : "pi pi-send"}
							onClick={handleSend}
							disabled={loading}
						/>
					</div>
				}
			>
				<div className="mb-3">
					<label htmlFor="email" className="block mb-2 text-gray-800">Ingresa tu email</label>
					<InputText
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full"
						autoFocus
						disabled={loading}
					/>
				</div>
				<div className="text-sm text-gray-600 mt-2" style={{ marginTop: '10px' }}>
					<i className="pi pi-info-circle" style={{ marginRight: "6px" }}></i>
					Nota: Se enviará un enlace para que pueda reestablecer su contraseña.
				</div>
			</Dialog>
		</>
	);
}