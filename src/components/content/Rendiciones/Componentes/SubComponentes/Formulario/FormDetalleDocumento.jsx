
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState } from 'react';

function FormDetalleDocumento({
    productDialog,
    setProductDialog,
    proveedores,

}) {

    const [proveedor, handleChangeProveedor] = useState(null);

    const selectedOptionTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex">
                    <div>{option.CardCode}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const complementoOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center border-bottom-1 surface-border w-full">
                <div>
                    {option.LicTradNum} - {option.CardName}
                </div>
            </div>
        );
    };


    const addDetDoc = () => {

    }

    return (
        <div>
            <Dialog
                visible={productDialog}
                onHide={() => setProductDialog(false)}
            >
                <h2>Agregar Detalle:</h2>
                <div className="col-12 md:col-6 lg:col-12">
                    <div className="mb-3 flex flex-column gap-2">
                        <Dropdown
                            value={proveedor}
                            onChange={(e) => handleChangeProveedor(e.value)}
                            options={proveedores}
                            optionLabel="CardName"
                            placeholder="Selecciona Proveedor"
                            valueTemplate={selectedOptionTemplate}
                            itemTemplate={complementoOptionTemplate}
                        />
                        <label htmlFor="">Empleado:</label>
                        <InputText
                        />
                        <label htmlFor="">(*)Tipo:</label>
                        <Dropdown
                            placeholder='Selecciona Tipo'
                        />
                        <label htmlFor="">(*)Moneda:</label>
                        <Dropdown
                            placeholder='Selecciona Moneda'
                        />
                        <label htmlFor="">(*)Monto:</label>
                        <InputText
                            placeholder='Monto a solicitar'
                        />
                        <label htmlFor="">(*)Motivo:</label>
                        <Dropdown
                            placeholder='Selecciona Motivo'
                        />
                        <label htmlFor="">(*)Comentario:</label>
                        <InputTextarea
                            rows={5}
                            cols={70}
                        />
                        <Button
                            className='col-12'
                            label="Agregar"
                            onClick={addDetDoc}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default FormDetalleDocumento;