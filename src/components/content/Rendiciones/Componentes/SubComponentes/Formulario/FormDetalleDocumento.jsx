
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useState } from 'react';

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
    visible, setVisible

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
        "Cod": null,
        "Concepto": null,
        "Almacen": null,
        "Proyecto": null,
        "UnidadNegocio": null,
        "Filial": null,
        "Areas": null,
        "CentroCosto": null,
        "IndImpuesto": null,
        "Precio": null,
        "Cantidad": null,
        "Impuesto": null
    });

    // const [documentoDet, setDocumentoDet] = useState(
    //     {
    //         "ID": null,
    //         "STR_CODARTICULO": null,
    //         "STR_CONCEPTO": null,
    //         "STR_ALMACEN": null,
    //         "STR_SUBTOTAL": null,
    //         "STR_INDIC_IMPUESTO": null,
    //         "STR_DIM1": null,
    //         "STR_DIM2": null,
    //         "STR_DIM3": null,
    //         "STR_DIM4": null,
    //         "STR_DIM5": null,
    //         "STR_DOC_ID": null,
    //         "STR_CANTIDAD": null,
    //         "STR_TPO_OPERACION": null
    //     }
    // );


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
        if (validarCampos()) {
            setArticulos([...articulos, detDoc]);
            // setDocumento(prevState => ({
            //     ...prevState,
            //     DocumentoDet: articulos
            // }))
            // setDocumento([...documento,documento.DocumentoDet])
            setProductDialog(false)
            setDetDoc(null)
        } else {
            alert('Por favor complete todos los campos requeridos.');
        }
    }

    const showCampos = () => {
        console.log(detDoc)
    }

    const [campoValido, setCampoValido] = useState({
        Cod: false,
        Proyecto: false,
        UnidadNegocio: false,
        Filial: false,
        Areas: false,
        CentroCosto: false,
        IndImpuesto: false,
        Precio: false,
        Cantidad: false,
        // Impuesto: false
    });

    const validarCampos = () => {
        for (let campo in campoValido) {
            if (!detDoc[campo]) {
                setCampoValido(prevState => ({
                    ...prevState,
                    [campo]: false
                }));
                return false;
            }
        }
        return true;
    };



    return (
        <div>
            <Dialog
                visible={productDialog}

                
                onHide={() => (
                    setProductDialog(false),
                    setDetDoc(null),
                    setVisible(false)
                  

                )}
                style={{ width: '50vw' }} 

            >
                <h2>Agregar Detalle:</h2>
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
                            filterBy='ItemName'
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
                            filterBy='name'
                            optionLabel="name"
                            placeholder='Seleccione Proyecto'
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
                            filterBy='name'
                            optionLabel={"name"}
                            placeholder='Seleccione Unidad de Negocio'
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
                            filterBy='name'
                            optionLabel="name"
                            placeholder='Seleccione Filial'
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
                            filterBy='name'
                            optionLabel="name"
                            placeholder='Seleccione Area'
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
                            filterBy='name'
                            optionLabel="name"
                            placeholder='Seleccione Centro Costo'
                        />
                        <label htmlFor="">(*)Ind. Impuesto:</label>
                        <Dropdown
                            value={detDoc?.IndImpuesto}
                            onChange={(e) => {
                                setIndImp(e.value)
                                setDetDoc(prevState => ({
                                    ...prevState,
                                    IndImpuesto: e.target.value
                                }));
                                setCampoValido(prevState => ({
                                    ...prevState,
                                    IndImpuesto: Boolean(e.target.value)
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
                                    Impuesto: detDoc?.IndImpuesto?.id=='EXO'||detDoc?.IndImpuesto==null? 0 : (e.target.value*detDoc?.Cantidad*0.18).toFixed(2)
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
                                    Impuesto: detDoc?.IndImpuesto.id=='EXO'||null? 0 :(e.target.value*detDoc?.Precio*0.18).toFixed(2)
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
                            disabled
                        />
                        <Button
                            className='col-12'
                            label="Agregar"
                            onClick={addDetDoc}
                            disabled={!Object.values(campoValido).every(Boolean)}
                        />
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