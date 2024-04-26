import React, { useState } from "react";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Navigate, useNavigate } from "react-router-dom";
import { Divider } from "primereact/divider";

function HeaderSL({ header, estados, setEstados, filtrado, setFiltrado }) {
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

export default HeaderSL;
