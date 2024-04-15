import { Tooltip } from "primereact/tooltip";
import React from "react";

function HeaderRD({ header, estados, setEstados, filtrado, setFiltrado }) {
  return (
    <>
      <Tooltip
        target=".export-buttons>button"
        position="bottom"
        right={header}
      />
    </>
  );
}

export default HeaderRD;
