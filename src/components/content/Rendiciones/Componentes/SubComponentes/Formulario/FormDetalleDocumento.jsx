
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState } from 'react';

function FormDetalleDocumento({
    productDialog,
    setProductDialog,
    articles,
    filial,
    proyectos,
    areas,
    centroCostos,
    unidNegocios,
    indImpuestos
}) {

    const [article, setArticle] = useState(null);
    const [proyecto, setProyecto] = useState(null);
    const [area, setArea] = useState(null);
    const [fili, setFili] = useState(null);
    const [centCosto, setCentCosto] = useState(null);
    const [unidNeg, setUnidNeg] = useState(null);
    const [indImp, setIndImp] = useState(null);

    const [detDoc, setDetDoc] = useState({
        articulo: "",
        concepto: "",
        almacen: "",
        proyecto: "",
        unidNegocio: "",
        filial: "",
        area: "",
        centroCosto: "",
        indImpuesto: "",
        precio: 0,
        cantidad: 0,
        impuesto: 0
    });

    const selectedOptionTemplate = (option, props) => {
        if (option) {
            return (
                    <div>{option.ItemCode}</div>
            );
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

    const addDetDoc = () => {
        setProductDialog(false)
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
                        <label htmlFor="">(*)Cod. Articulo/Servicio:</label>
                        <Dropdown
                            value={article}
                            onChange={(e) => {
                                setArticle(e.value)
                            }}
                            options={articles}
                            optionLabel="ItemCode"
                            placeholder='Seleccione Articulo/Servicio'
                            valueTemplate={selectedOptionTemplate}
                            itemTemplate={complementoOptionTemplate}
                        />
                        <label htmlFor="">(*)Proyecto:</label>
                        <Dropdown
                            value={proyecto}
                            onChange={(e) => {
                                console.log(e.value)
                                setProyecto(e.value)
                            }}
                            options={proyectos}
                            optionLabel="name"
                            placeholder='Seleccione Proyecto'
                        />
                        <label htmlFor="">(*)Unidad de Negocio:</label>
                        <Dropdown
                            value={unidNeg}
                            onChange={(e) => {
                                console.log(e.value)
                                setUnidNeg(e.value)
                            }}
                            options={areas}
                            optionLabel="name"
                            placeholder='Seleccione Unidad de Negocio'
                        />
                        <label htmlFor="">(*)Filial:</label>
                        <Dropdown
                            value={fili}
                            onChange={(e) => {
                                console.log(e.value)
                                setFili(e.value)
                            }}
                            options={filial}
                            optionLabel="name"
                            placeholder='Seleccione Filial'
                        />
                        <label htmlFor="">(*)Area:</label>
                        <Dropdown
                            value={area}
                            onChange={(e) => {
                                console.log(e.value)
                                setArea(e.value)
                            }}
                            options={areas}
                            optionLabel="name"
                            placeholder='Seleccione Area'
                        />
                        <label htmlFor="">(*)Centro Costo:</label>
                        <Dropdown
                            value={centCosto}
                            onChange={(e) => {
                                console.log(e.value)
                                setCentCosto(e.value)
                            }}
                            options={centroCostos}
                            optionLabel="name"
                            placeholder='Seleccione Centro Costo'
                        />
                        <label htmlFor="">(*)Ind. Impuesto:</label>
                        <Dropdown
                            value={indImp}
                            onChange={(e) => {
                                console.log(e.value)
                                setIndImp(e.value)
                            }}
                            options={indImpuestos}
                            optionLabel="name"
                            placeholder='Seleccione Ind. Impuesto'
                        />
                        <label htmlFor="">(*)Precio:</label>
                        <InputText
                        />
                        <label htmlFor="">(*)Cantidad:</label>
                        <InputText
                        />
                        <label htmlFor="">(*)Impuesto:</label>
                        <InputText
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