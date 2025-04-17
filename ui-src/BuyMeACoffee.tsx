import React from "react";
// import './App.css'
import qr from "./styles/assets/bmc_qr.png";

function BuyMeACoffee() {
  return (
    <div
      className="BuyMeACoffee"
      style={{
        backgroundColor: "var(--figma-color-bg)",
        color: "var(--figma-color-text)",
        width: "100%",
        height: "100%",
      }}
    >
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
            display: "inline-block",
            alignSelf: "center",
            padding: "8px 16px",
            backgroundColor: "var(--figma-color-bg-brand)",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 11,
            fontWeight: 500,
            lineHeight: "16px",
            color: "var(--figma-color-text-on-brand)",
            fontFamily: "Inter, Roboto, sans-serif",
            border: "none",
            cursor: "pointer",
            textAlign: "center",
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
