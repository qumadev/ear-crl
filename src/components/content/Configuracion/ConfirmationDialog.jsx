import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner"; // Importar ProgressSpinner

const ConfirmationDialog = ({
	visible,
	message,
	onConfirm,
	onCancel,
	loading,
}) => {
	const renderFooter = () => {
		return (
			<div>
				<Button
					label="No"
					icon="pi pi-times"
					onClick={onCancel}
					className="p-button-text"
					disabled={loading}
				/>
				<Button
					label="Sí"
					icon="pi pi-check"
					onClick={onConfirm}
					autoFocus
					disabled={loading}
				/>
			</div>
		);
	};

	return (
		<Dialog
			header="Confirmación"
			visible={visible}
			style={{ width: "w-4" }}
			footer={renderFooter()}
			onHide={onCancel}
		>
			{!loading && <p>{message}</p>}
			{loading && (
				<div className="flex justify-content-center align-items-center">
					<ProgressSpinner />
				</div>
			)}
		</Dialog>
	);
};

export default ConfirmationDialog;
