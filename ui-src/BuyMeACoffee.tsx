import React from "react";
// import './App.css'
import qr from "./styles/assets/bmc_qr.png";

function BuyMeACoffee() {
  return (
    <div className="BuyMeACoffee">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <img
          style={{ width: 200, height: "auto", margin: "24px auto 12px" }}
          src={qr}
        />
        <a
          style={{
            padding: "12px 32px",
            backgroundColor: "#ffdd00",
            margin: "0 auto 0",
            borderRadius: 24,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 600,
            color: "black",
            fontFamily: '"roboto", sans-serif',
          }}
          href="https://www.buymeacoffee.com/vboy234"
          target="_blank"
        >
          Buy me a Coffee
        </a>
      </div>
    </div>
  );
}

export default BuyMeACoffee;
