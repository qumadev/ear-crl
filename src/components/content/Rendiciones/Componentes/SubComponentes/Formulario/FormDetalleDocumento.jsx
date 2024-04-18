
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState } from 'react';

function FormDetalleDocumento({
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
    indImpuestos
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
    const [impuesto, setImpuesto] = useState(null);

    const [detDoc, setDetDoc] = useState({
        "Cod": article,
        "Concepto": "Producto 1",
        "Almacen": "ALMACEN 01",
        "Proyecto": proyecto,
        "UnidadNegocio": unidNeg,
        "Filial": fili,
        "Areas": area,
        "CentroCosto": centCosto,
        "IndImpuesto": indImp,
        "Precio": precio,
        "Cantidad": cantidad,
        "Impuesto": impuesto
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
        setArticulos([...articulos, detDoc]);
        setProductDialog(false)
        setDetDoc(null)
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
                            value={detDoc?.article}
                            onChange={(e) => {
                                // setArticle(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Cod: e.value.ItemCode
                                }));
                            }}
                            options={articles}
                            optionLabel="ItemCode"
                            placeholder='Seleccione Articulo/Servicio'
                            valueTemplate={selectedOptionTemplate}
                            itemTemplate={complementoOptionTemplate}
                        />
                        <label htmlFor="">(*)Proyecto:</label>
                        <Dropdown
                            value={detDoc?.proyecto}
                            onChange={(e) => {
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Proyecto: e.value.name
                                }));
                            }}
                            options={proyectos}
                            optionLabel="name"
                            placeholder='Seleccione Proyecto'
                        />
                        <label htmlFor="">(*)Unidad de Negocio:</label>
                        <Dropdown
                            value={detDoc?.unidNeg}
                            onChange={(e) => {
                                // setUnidNeg(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    UnidadNegocio: e.value.name
                                }));
                            }}
                            options={unidNegocios}
                            optionLabel={"name"}
                            placeholder='Seleccione Unidad de Negocio'
                        />
                        <label htmlFor="">(*)Filial:</label>
                        <Dropdown
                            value={detDoc?.fili}
                            onChange={(e) => {
                                setFili(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Filial: e.value.name
                                }));
                            }}
                            options={filial}
                            optionLabel="name"
                            placeholder='Seleccione Filial'
                        />
                        <label htmlFor="">(*)Area:</label>
                        <Dropdown
                            value={detDoc?.area}
                            onChange={(e) => {
                                setArea(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Areas: e.value.name
                                }));
                            }}
                            options={areas}
                            optionLabel="name"
                            placeholder='Seleccione Area'
                        />
                        <label htmlFor="">(*)Centro Costo:</label>
                        <Dropdown
                            value={detDoc?.centCosto}
                            onChange={(e) => {
                                setCentCosto(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    CentroCosto: e.value.name
                                }));
                            }}
                            options={centroCostos}
                            optionLabel="name"
                            placeholder='Seleccione Centro Costo'
                        />
                        <label htmlFor="">(*)Ind. Impuesto:</label>
                        <Dropdown
                            value={detDoc?.indImp}
                            onChange={(e) => {
                                setIndImp(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    IndImpuesto: e.value.name
                                }));
                            }}
                            options={indImpuestos}
                            optionLabel="name"
                            placeholder='Seleccione Ind. Impuesto'
                        />
                        <label htmlFor="">(*)Precio:</label>
                        <InputText
                            value={detDoc?.precio}
                            onChange={(e) => {
                                setPrecio(e.target.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Precio: e.target.value
                                }));
                            }}
                        />
                        <label htmlFor="">(*)Cantidad:</label>
                        <InputText
                            value={detDoc?.cantidad}
                            onChange={(e) => {
                                setCantidad(e.target.value)
                                console.log(e.target.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Cantidad: e.target.value
                                }));
                            }}
                        />
                        <label htmlFor="">(*)Impuesto:</label>
                        <InputText
                            value={detDoc?.impuesto}
                            onChange={(e) => {
                                setImpuesto(e.target.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    Impuesto: e.target.value
                                }));
                            }}
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