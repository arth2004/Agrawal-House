"use client";

import React from "react";
import {
  buildGeneralBookingMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function WhatsAppFloat() {
  const whatsappUrl = buildWhatsAppUrl(buildGeneralBookingMessage());

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book via WhatsApp"
      title="Book via WhatsApp"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 45,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        textDecoration: "none",
      }}
      className="whatsapp-float"
    >
      <WhatsAppIcon size={28} color="#FFFFFF" />
      <style jsx>{`
        .whatsapp-float:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
        }
      `}</style>
    </a>
  );
}
