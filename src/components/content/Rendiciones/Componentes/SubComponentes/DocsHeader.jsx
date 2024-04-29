
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import React from "react";

function DocsHeader({
  nrendicon,
  nombre,
  totalRendido,
  moneda,
  estado,
  totalSolicitado,
}) {
  return (
    <>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">N° de Rendición</label>
            <div className="card flex">
              <InputText
                className="w-12"
                value={nrendicon}
                disabled
                //placeholder="N° de Rendición"
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Empleado Asignado</label>
            <div className="card flex">
              <InputText
                className="w-12"
                value={nombre}
                disabled
                //placeholder="N° de Rendición"
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Monto Total Rendido</label>
            <div className="card flex">
              <InputNumber
                className="w-12"
                value={totalRendido}
                disabled
                //placeholder="N° de Rendición"
                mode="currency"
                currency={`${moneda}`}
                locale={
                  moneda == "SOL"
                    ? "en-PE"
                    : moneda == "EUR"
                    ? "de-DE"
                    : "en-US"
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Estado</label>
            <div className="card flex">
              <InputText
                className="w-12"
                value={estado}
                disabled
                width={"100%"}
                //placeholder="N° de Rendición"
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Total Solicitado</label>
            <div className="card flex">
              <InputNumber
                className="w-12"
                value={totalSolicitado}
                disabled
                mode="currency"
                currency={`${moneda}`}
                width={"100%"}
                locale={
                  moneda == "SOL"
                    ? "en-PE"
                    : moneda == "EUR"
                    ? "de-DE"
                    : "en-US"
                }
                //placeholder="N° de Rendición"
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Saldo Disponible</label>
            <div className="card flex">
              <InputNumber
                className="w-12"
                value={totalSolicitado - totalRendido}
                disabled
                //placeholder="N° de Rendición"
                mode="currency"
                currency={`${moneda}`}
                locale={
                  moneda == "SOL"
                    ? "en-PE"
                    : moneda == "EUR"
                    ? "de-DE"
                    : "en-US"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DocsHeader;
