import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";

function FormDetalleDocumento({
	documento,
	setDocumento,
	articulos,
	setArticulos,
	productDialog,
	setProductDialog,
	articles,
	filial,
	proyectos,
	areas,
	centroCostos,
	unidNegocios,
	indImpuestos,
	visible, setVisible,
	selectedRowData,
	editing,
	setEditing,
	onEdit,
	moneda
}) {

	const [article, setArticle] = useState(null);
	const [proyecto, setProyecto] = useState(null);
	const [area, setArea] = useState(null);
	const [fili, setFili] = useState(null);
	const [centCosto, setCentCosto] = useState(null);
	const [unidNeg, setUnidNeg] = useState(null);
	const [indImp, setIndImp] = useState(null);
	const [precio, setPrecio] = useState(null);
	const [cantidad, setCantidad] = useState(null);
	const [subtotal, setSubtotal] = useState(0);
	const [impuesto, setImpuesto] = useState(0);
	const [totalDetalle, setTotalDetalle] = useState(0);
	const [manualEdit, setManualEdit] = useState(false);

	const toast = useRef(null);
	const showSuccess = (mensaje) => {
		toast.current.show({
			severity: "success",
			summary: "Exitoso",
			detail: mensaje,
			life: 3000,
		});
	};

	const showError = (mensaje) => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail: mensaje,
			life: 3000,
		});
	};

	const [detDoc, setDetDoc] = useState({
		Cod: null,
		Concepto: null,
		Almacen: null,
		Proyecto: null,
		UnidadNegocio: null,
		Filial: null,
		Areas: null,
		CentroCosto: null,
		IndImpuesto: null,
		Precio: null,
		Cantidad: null,
		Impuesto: null,
		TotalDetalle: null
	});

	useEffect(() => {
		if (editing && selectedRowData) {
			const articuloSeleccionado = articles?.find(
				item => item.ItemCode === selectedRowData?.Cod?.ItemCode
			);

			const impuestoSeleccionado = indImpuestos?.find(
				item => item.id === selectedRowData?.IndImpuesto?.id
			);

			setDetDoc({
				...selectedRowData,
				Cod: articuloSeleccionado || null,
				// Concepto: selectedRowData?.Concepto || null,
				// Almacen: selectedRowData?.Almacen || null,
				Proyecto: selectedRowData?.Proyecto || null,
				UnidadNegocio: selectedRowData?.UnidadNegocio || null,
				Filial: selectedRowData?.Filial || null,
				Areas: selectedRowData?.Areas || null,
				CentroCosto: selectedRowData?.CentroCosto || null,
				IndImpuesto: impuestoSeleccionado || null,
				Precio: selectedRowData?.Precio || null,
				Cantidad: selectedRowData?.Cantidad || null,
				Impuesto: selectedRowData?.Impuesto || null,
				TotalDetalle: selectedRowData?.TotalDetalle || null
			});
		} else {
			setDetDoc({
				"Cod": null,
				"Concepto": null,
				"Almacen": null,
				"Proyecto": null,
				"UnidadNegocio": null,
				"Filial": null,
				"Areas": null,
				"CentroCosto": null,
				"IndImpuesto": { id: 'EXO', name: 'EXO' },
				"Precio": null,
				"Cantidad": null,
				"Impuesto": null,
				"TotalDetalle": null
			})
		}
	}, [editing, selectedRowData, articles, indImpuestos]);

	const selectedOptionTemplate = (option, props) => {
		if (option) {
			return <div>{option.ItemCode}</div>;
		}

		return <span>{props.placeholder}</span>;
	};

	const complementoOptionTemplate = (option) => {
		return (
			<div>
				{option.ItemCode} - {option.ItemName}
			</div>
		);
	};

	const selectedProyectoOptionTemplate = (option, props) => {
		if (option) {
			return <div>{option.id}</div>;
		}

		return <span>{props.placeholder}</span>;
	}

	const complementoProyectoOptionTemplate = (option) => {
		return (
			<div>
				{option.id} - {option.name}
			</div>
		);
	};

	const selectedUndOptionTemplate = (option, props) => {
		if (option) {
			return <div>{option.id}</div>;
		}

		return <span>{props.placeholder}</span>;
	}

	const completementoUndOptionTemplate = (option) => {
		return (
			<div>
				{option.id} - {option.name}
			</div>
		);
	}

	const selectedFilialOptionTemplate = (option, props) => {
		if (option) {
			return <div>{option.id}</div>;
		}

		return <span>{props.placeholder}</span>;
	}

	const completementoFilialOptionTemplate = (option) => {
		return (
			<div>
				{option.id} - {option.name}
			</div>
		);
	}

	const selectedAreaOptionTemplate = (option, props) => {
		if (option) {
			return <div>{option.id}</div>;
		}

		return <span>{props.placeholder}</span>;
	}

	const complementoAreaOptionTemplate = (option) => {
		return (
			<div>
				{option.id} - {option.name}
			</div>
		);
	}

	const selectedCeCoOptionTempalte = (option, props) => {
		if (option) {
			return <div>{option.id}</div>;
		}

		return <span>{props.placeholder}</span>;
	}

	const complementoCeCoOptionTemplate = (option) => {
		return (
			<div>
				{option.id} - {option.name}
			</div>
		);
	}

	const addDetDoc = () => {
		if (validarCampos()) {
			const nuevoDetalle = { ...detDoc, ID: uuidv4() }
			setArticulos([...articulos, nuevoDetalle]);
			setDocumento((prevState) => ({
				...prevState,
				DocumentoDet: [...articulos, nuevoDetalle],
			}));
			setProductDialog(false);
			setDetDoc(null);
			showSuccess(`Detalle agregado correctamente`);
		} else {
			showError(`Por favor complete todos los campos requeridos.`);
		}
	};

	const [campoValido, setCampoValido] = useState({
		Cod: false,
		Proyecto: false,
		UnidadNegocio: false,
		Filial: false,
		Areas: false,
		CentroCosto: false,
		Precio: false,
		Cantidad: false,
	});



	const validarCampos = () => {
		for (let campo in campoValido) {
			if (!detDoc[campo]) {
				setCampoValido((prevState) => ({
					...prevState,
					[campo]: false,
				}));
				return false;
			}
		}
		return true;
	};

	const handleEdit = () => {
		if (validarCampos()) {
			setEditing(false);
			setArticulos((prevState) =>
				prevState.map((item) => (item.ID === detDoc.ID ? { ...detDoc } : item)),
			);
			onEdit(detDoc);
			setProductDialog(false);
			showSuccess(`Detalle editado correctamente`);

			//alert('Detalle editado correctamente');
		} else {
			showError(`Por favor complete todos los campos requeridos.`);
			//alert('Por favor complete todos los campos requeridos.');
		}
	};

	const handleHide = () => {
		if (editing) {
		} else {
			// setDetDoc(null)
		}
	}

	const calculateSubtotal = () => {
		return (detDoc?.Precio * detDoc?.Cantidad).toFixed(2);
	};

	const calculateImpuesto = () => {
		if (!detDoc?.IndImpuesto) return 0;

		let tasaImpuesto = 0;
		let esDescuento = false;

		if (detDoc.IndImpuesto.name === "IGV (18%)") {
			tasaImpuesto = 0.18;
		} else if (detDoc.IndImpuesto.name === "IGV (10%)") {
			tasaImpuesto = 0.10;
		} else if (detDoc.IndImpuesto.name === "IGV MIXTO") {
			tasaImpuesto = 0.18;
		} else if (detDoc.IndImpuesto.name === "IGV GASTO") {
			tasaImpuesto = 0.18;
		}

		const impuesto = detDoc?.Precio * detDoc?.Cantidad * tasaImpuesto;
		return esDescuento ? impuesto * -1 : impuesto;
	};

	useEffect(() => {
		setDetDoc(prevState => ({
			...prevState,
			Impuesto: calculateImpuesto().toFixed(2),
		}));
	}, [detDoc?.Precio, detDoc?.Cantidad, detDoc?.IndImpuesto]);

	useEffect(() => {
		if (!manualEdit) {
			const subtotal = calculateSubtotal();
			const impuesto = calculateImpuesto();

			setDetDoc(prevState => ({
				...prevState,
				Impuesto: impuesto.toFixed(2),
				TotalDetalle: roundToTwo(parseFloat(subtotal) + impuesto).toFixed(2),
			}));
		}
	}, [detDoc?.Precio, detDoc?.Cantidad, detDoc?.IndImpuesto, manualEdit]);

	useEffect(() => {
		if (!manualEdit) {
			const subtotal = calculateSubtotal();
			setDetDoc(prevState => ({
				...prevState,
				TotalDetalle: (parseFloat(subtotal) + parseFloat(detDoc?.Impuesto || 0)).toFixed(2)
			}));
		}
	}, [detDoc?.Impuesto, manualEdit]);

	const roundToTwo = (num) => Math.round(num * 100) / 100;

	return (
		<div>
			<Toast ref={toast} />
			<Dialog
				visible={productDialog}
				header={editing ? "Editar Detalle" : "Agregar Detalle"}

				onHide={() => (
					setProductDialog(false),
					handleHide(),
					// setDetDoc(null),
					setVisible(false)


				)}
				style={{ width: '50vw' }}

			>

				<div className="col-12 md:col-6 lg:col-12">
					<div className="mb-3 flex flex-column gap-2">
						<label htmlFor="">(*)Cod. Articulo/Servicio:</label>
						<Dropdown
							value={detDoc?.Cod}
							onChange={(e) => {
								setDetDoc(prevState => ({
									...prevState,
									Cod: e.target.value,
									Concepto: e.target.value.ItemName,
									Almacen: e.target.value.WhsCode
								}));

								setCampoValido(prevState => ({
									...prevState,
									Cod: Boolean(e.target.value)
								}));
							}}
							options={articles}
							filter
							filterBy='ItemCode,ItemName'
							optionLabel="ItemCode"
							placeholder='Seleccione Articulo/Servicio'
							valueTemplate={selectedOptionTemplate}
							itemTemplate={complementoOptionTemplate}
						/>
						<label htmlFor="">(*)Proyecto:</label>
						<Dropdown
							value={detDoc?.Proyecto}
							onChange={(e) => {
								setDetDoc(prevState => ({
									...prevState,
									Proyecto: e.target.value
								}));
								setCampoValido(prevState => ({
									...prevState,
									Proyecto: Boolean(e.target.value)
								}));
							}}
							options={proyectos}
							filter
							filterBy='id,name'
							optionLabel="id"
							placeholder='Seleccione Proyecto'
							valueTemplate={selectedProyectoOptionTemplate}
							itemTemplate={complementoProyectoOptionTemplate}
						/>
						<label htmlFor="">(*)Unidad de Negocio:</label>
						<Dropdown
							value={detDoc?.UnidadNegocio}
							onChange={(e) => {
								setDetDoc(prevState => ({
									...prevState,
									UnidadNegocio: e.target.value
								}));
								setCampoValido(prevState => ({
									...prevState,
									UnidadNegocio: Boolean(e.target.value)
								}));
							}}
							options={unidNegocios}
							filter
							filterBy='id,name'
							optionLabel="id"
							placeholder='Seleccione Unidad de Negocio'
							valueTemplate={selectedUndOptionTemplate}
							itemTemplate={completementoUndOptionTemplate}
						/>
						<label htmlFor="">(*)Filial:</label>
						<Dropdown
							value={detDoc?.Filial}
							onChange={(e) => {
								setFili(e.value)
								setDetDoc(prevState => ({
									...prevState,
									Filial: e.target.value
								}));
								setCampoValido(prevState => ({
									...prevState,
									Filial: Boolean(e.target.value)
								}));
							}}
							options={filial}
							filter
							filterBy='id,name'
							optionLabel="id"
							placeholder='Seleccione Filial'
							valueTemplate={selectedFilialOptionTemplate}
							itemTemplate={completementoFilialOptionTemplate}
						/>
						<label htmlFor="">(*)Area:</label>
						<Dropdown
							value={detDoc?.Areas}
							onChange={(e) => {
								setArea(e.value)
								setDetDoc(prevState => ({
									...prevState,
									Areas: e.target.value
								}));
								setCampoValido(prevState => ({
									...prevState,
									Areas: Boolean(e.target.value)
								}));
							}}
							options={areas}
							filter
							filterBy='id,name'
							optionLabel="id"
							placeholder='Seleccione Area'
							valueTemplate={selectedAreaOptionTemplate}
							itemTemplate={complementoAreaOptionTemplate}
						/>
						<label htmlFor="">(*)Centro Costo:</label>
						<Dropdown
							value={detDoc?.CentroCosto}
							onChange={(e) => {
								setCentCosto(e.value)
								setDetDoc(prevState => ({
									...prevState,
									CentroCosto: e.target.value
								}));
								setCampoValido(prevState => ({
									...prevState,
									CentroCosto: Boolean(e.target.value)
								}));
							}}
							options={centroCostos}
							filter
							filterBy='id,name'
							optionLabel="id"
							placeholder='Seleccione Centro Costo'
							valueTemplate={selectedCeCoOptionTempalte}
							itemTemplate={complementoCeCoOptionTemplate}
						/>
						<label htmlFor="">(*)Ind. Impuesto:</label>
						<Dropdown
							value={detDoc?.IndImpuesto}
							onChange={(e) => {
								const impuestoSeleccionado = e.target.value;
								let impuestoCalculado = 0;

								if (impuestoSeleccionado.name === "IGV (18%)") {
									impuestoCalculado = (detDoc?.Precio * detDoc?.Cantidad * 0.18).toFixed(2);
								} else if (impuestoSeleccionado.name === "IGV (10%)") {
									impuestoCalculado = (detDoc?.Precio * detDoc?.Cantidad * 0.10).toFixed(2);
								} else if (impuestoSeleccionado.name === "IGV MIXTO") {
									impuestoCalculado = (detDoc?.Precio * detDoc?.Cantidad * 0.18).toFixed(2);
								} else if (impuestoSeleccionado.name === "IGV GASTO") {
									impuestoCalculado = (detDoc?.Precio * detDoc?.Cantidad * 0.18).toFixed(2);
								}

								setIndImp(impuestoSeleccionado);
								setDetDoc(prevState => ({
									...prevState,
									IndImpuesto: impuestoSeleccionado,
									Impuesto: impuestoCalculado,
								}));
								setCampoValido(prevState => ({
									...prevState,
									IndImpuesto: Boolean(impuestoSeleccionado)
								}));
							}}
							options={indImpuestos}
							filter
							filterBy='name'
							optionLabel="name"
							placeholder='Seleccione Ind. Impuesto'
						/>
						<label htmlFor="">(*)Precio:</label>
						<InputText
							value={detDoc?.Precio}
							onChange={(e) => {
								setPrecio(e.target.value)
								setDetDoc(prevState => ({
									...prevState,
									Precio: e.target.value,
									Impuesto: detDoc?.IndImpuesto?.id == 'EXO' || detDoc?.IndImpuesto == null ? 0 : (e.target.value * detDoc?.Cantidad * 0.18).toFixed(2),

									// Impuesto: detDoc?.IndImpuesto?.id == 'IGV10' || detDoc?.IndImpuesto == null ? 0 : (e.target.value * detDoc?.Cantidad * 0.10).toFixed(2),
								}));
								setCampoValido(prevState => ({
									...prevState,
									Precio: Boolean(e.target.value)
								}));
							}}
						/>
						<label htmlFor="">(*)Cantidad:</label>
						<InputText
							value={detDoc?.Cantidad}
							onChange={(e) => {
								setCantidad(e.target.value)
								setDetDoc(prevState => ({
									...prevState,
									Cantidad: e.target.value,
									Impuesto: detDoc?.IndImpuesto.id == 'EXO' || null ? 0 : (e.target.value * detDoc?.Precio * 0.18).toFixed(2),

									// Impuesto: detDoc?.IndImpuesto.id == 'IGV10' || null ? 0 : (e.target.value * detDoc?.Precio * 0.10).toFixed(2)
								}));
								setCampoValido(prevState => ({
									...prevState,
									Cantidad: Boolean(e.target.value)
								}));
							}}
						/>
						<label htmlFor="">(*)Impuesto:</label>
						<InputText
							value={detDoc?.Impuesto}
							onChange={(e) => {
								setImpuesto(e.target.value)
								setDetDoc(prevState => ({
									...prevState,
									Impuesto: e.target.value
								}));
							}}
						/>
						<label htmlFor="">(*)Total Detalle:</label>
						<InputText
							value={detDoc?.TotalDetalle}
							onChange={(e) => {
								setManualEdit(true); // Activa la edición manual
								setDetDoc(prevState => ({
									...prevState,
									TotalDetalle: e.target.value
								}));
							}}
							onBlur={() => {
								// Reinicia a cálculo automático si el campo está vacío
								if (!detDoc.TotalDetalle) {
									setManualEdit(false); // Volvemos al cálculo automático
								}
							}}
							disabled
						/>
						{editing ?
							<Button
								className="col-12"
								label="Editar"
								onClick={handleEdit}
							/>
							:
							<Button
								className='col-12'
								// label="Agregar"
								label="Agregar"
								onClick={addDetDoc}
								disabled={!Object.values(campoValido).every(Boolean)}
							/>
						}


						{/* <Button
                            className='col-12'
                            label="mostrar"
                            onClick={showCampos}
                        /> */}
					</div>
				</div>
			</Dialog>
		</div>
	);
}

export default FormDetalleDocumento;