import React from "react";

function Layout({ children, SideBarActive, responsiveSizeMobile }) {
  const updatedChildren = React.Children.map(children, (child) => {
    // Solo clona elementos válidos
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { responsiveSizeMobile });
    }
    return child;
  });

  return (
    <div
      className={`${
        !SideBarActive ? "" : "layInit"
      }  flex flex-column min-h-screen justify-content-between`}
      style={{
        paddingTop: "7rem",
        paddingRight: "2rem",
        paddingBottom: "2rem",
        paddingLeft: "4rem",
        transition: "margin-left .2s",
      }}
    >
      <div className="" style={{ flex: "1 1 auto" }}>
        <div
          className="flex flex-wrap"
          style={{
            marginRight: "-1rem",
            marginLeft: "-1rem",
            marginTop: "-1rem",
          }}
        >
          <div
            className=""
            style={{ flex: "0 0 auto", padding: "1rem", width: "100%" }}
          >
            <div
              className="mb-0 bg-white p-5 border-round-sm"
              style={{ border: "1px solid #ffffff" }}
            >
              {updatedChildren}
              {/* {children} */}
              {/* {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                  responsiveSizeMobile: responsiveSizeMobile,
                });
              })} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
