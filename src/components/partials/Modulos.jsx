import React, { useEffect, useState } from "react";
import SideBar from "./subpartials/SideBar";
import { Sidebar } from "primereact/sidebar";

function Modulos({
  SideBarActive,
  setSideBarActive,
  responsiveSize,
  responsiveSizeMobile,
}) {
  return (
    <>
      <div
        className={`fixed flex z-5 overflow-y-auto bg-white border-round-lg shadow-1 ${!SideBarActive ? "-translate-x-100" : ""
          } layout_modulos `}
        style={{
          top: "7rem",
          left: "2rem",
          height: "calc(100vh - 9rem)",
          transition: "transform .2s, left .2s",
          padding: ".5rem 1.5rem",
          width: "240px"   // ancho fijo
        }}
      >
        <SideBar />
      </div>

      {responsiveSize & (SideBarActive == false) && (
        <Sidebar
          className="layout_menu"
          visible={!SideBarActive}
          onHide={() => setSideBarActive(!SideBarActive)}
          content={({ }) => (
            <div
              className={`fixed flex w-18rem z-5 overflow-y-auto  bg-white `}
              style={{
                top: "1rem",
                left: "1rem",
                height: "calc(100vh - 9rem)",
                transition: "transform .2s, left .2s",
                padding: ".5rem 1.5rem",
              }}
            >
              <SideBar
                responsiveSize={responsiveSize}
                setSideBarActive={setSideBarActive}
                SideBarActive={SideBarActive}
              />
            </div>

            // <div className="min-h-screen flex relative lg:static surface-ground">
            //   <div
            //     id="app-sidebar-2"
            //     className="surface-section h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 surface-border select-none"
            //     style={{ width: "280px" }}
            //   >
            //     <div className="flex flex-column h-full">
            //       <div className="overflow-y-auto">
            //         <ul className="list-none p-3 m-0">
            //           <li>
            //             <ul className="list-none p-0 m-0">
            //               <li>
            //                 <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
            //                   <i className="pi pi-home mr-2"></i>
            //                   <span className="font-medium">Dashboard</span>
            //                   <Ripple />
            //                 </a>
            //               </li>
            //               <li>
            //                 <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
            //                   <i className="pi pi-bookmark mr-2"></i>
            //                   <span className="font-medium">Bookmarks</span>
            //                   <Ripple />
            //                 </a>
            //               </li>
            //             </ul>
            //           </li>
            //         </ul>
            //       </div>
            //       <div className="mt-auto">
            //         <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
            //         <a
            //           v-ripple
            //           className="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple"
            //         >
            //           <Avatar
            //             image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            //             shape="circle"
            //           />
            //           <span className="font-bold">Amy Elsner</span>
            //         </a>
            //       </div>
            //     </div>
            //   </div>
            // </div>
          )}
        ></Sidebar>
      )}
    </>
  );
}

export default Modulos;
