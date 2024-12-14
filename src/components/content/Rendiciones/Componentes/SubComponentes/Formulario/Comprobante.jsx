import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useState } from "react";
import { consultaComprobante } from "../../../../../../services/axios.service";

function Comprobante({
  setDocumento,
  showSuccess,
  tpoDocs,
  tipo,
  serie,
  correlativo,
  fechaEmision,
  existeSunat,
  //setCompExisteSunat,
  ruc,
  fechaDocumento,
  showError,
  monto,
  editable,
}) {
  // UseStates para Comprobante
  const [loading, setLoading] = useState(false);
  const selectedOptionTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex">
          <div>
            {option.id} - {option.name}
          </div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  async function handleConsultSunat() {
    try {
      setLoading(true);
      
      if (
        ruc != null &&
        tipo != null &&
        serie != null &&
        correlativo != null &&
        fechaDocumento != null
      ) {
        let fechaISO = fechaDocumento.toISOString().split("T")[0];

        let fecha = fechaISO.split("-");
        let dia = fecha[2];
        let mes = fecha[1];
        let anio = fecha[0];

        var comprobanteReq = {
          numRuc: ruc,
          codComp: tipo.id,
          numeroSerie: serie,
          numero: correlativo,
          fechaEmision: `${dia}/${mes}/${anio}`,
          monto: monto,
        };
        let response = await consultaComprobante(comprobanteReq);
        let compResponse = response.data.Result[0];
        if (compResponse.data.estadoCp == "0") {
          showError("No se encontró el comprobante");
          setLoading(false);
          setDocumento((prevDocumento) => ({
            ...prevDocumento,
            STR_VALIDA_SUNAT: false,
          }));
          setCompExisteSunat(false);
        } else {
          showSuccess("El comprobante es existente");
          setLoading(false);
          setDocumento((prevDocumento) => ({
            ...prevDocumento,
            STR_VALIDA_SUNAT: true,
          }));
          //setCompExisteSunat(true);
        }
      } else {
        showError(
          "No se completó el ruc, tipo, serie, fecha de doc y/o correlativo"
        );
        setDocumento((prevDocumento) => ({
          ...prevDocumento,
          STR_VALIDA_SUNAT: false,
        }));
        //setCompExisteSunat(false);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      showError("Error al consultar el comprobante");
      setLoading(false);
      setDocumento((prevDocumento) => ({
        ...prevDocumento,
        STR_VALIDA_SUNAT: false,
      }));
      //setCompExisteSunat(false);
    }
  }

  const complementoOptionTemplate = (option) => {
    return (
      <div className="flex">
        <div>
          {option.id}- {option.name}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid gap-8">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Tipo de Documento</label>
            <div className="card flex">
              <Dropdown
                value={tipo}
                onChange={(e) => {
                  setDocumento((prevDocumento) => ({
                    ...prevDocumento,
                    STR_TIPO_DOC: e.target.value,
                    STR_VALIDA_SUNAT: false,
                  }));
                  //setCompExisteSunat(false);
                }}
                options={tpoDocs}
                optionLabel="name"
                placeholder="Selecciona Tipo de Documento"
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-full "
                disabled={editable}
                //disabled={!estadosEditables.includes(solicitudRD.estado)}
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Serie del Documento</label>
            <InputText
              value={serie}
              onChange={(e) => {
                setDocumento((prevDocumento) => ({
                  ...prevDocumento,
                  STR_SERIE_DOC: e.target.value,
                  STR_VALIDA_SUNAT: false,
                }));
              }}
              placeholder="Serie del documento"
              disabled={editable}
              maxLength={4}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-8">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Correlativo de Documento</label>
            <InputText
              value={correlativo}
              onChange={(e) => {
                setDocumento((prevDocumento) => ({
                  ...prevDocumento,
                  STR_CORR_DOC: e.target.value,
                  STR_VALIDA_SUNAT: false,
                }));
              }}
              placeholder="Correlativo de Documento"
              disabled={editable}
              maxLength={8}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-8">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <Button
              //value={documento.emisionDocumento}
              label="Consultar a SUNAT"
              icon="pi pi-search"
              size="large"
              onClick={handleConsultSunat}
              loading={loading}
              disabled={editable}
            />
            {!existeSunat && (
              <small className="p-error">
                Validación en SUNAT es requerida
              </small>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Comprobante;
