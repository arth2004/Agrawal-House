"use client";

import React from "react";
import { buildWhatsAppUrl, WhatsAppBookingDetails, buildBookingMessage } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

type WhatsAppBookButtonProps = {
  details: WhatsAppBookingDetails;
  label?: string;
  fullWidth?: boolean;
  variant?: "primary" | "outline";
  style?: React.CSSProperties;
};

export default function WhatsAppBookButton({
  details,
  label = "Book via WhatsApp",
  fullWidth = true,
  variant = "outline",
  style,
}: WhatsAppBookButtonProps) {
  const whatsappUrl = buildWhatsAppUrl(buildBookingMessage(details));

  const isPrimary = variant === "primary";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: fullWidth ? "100%" : "auto",
        padding: "14px 20px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: isPrimary ? "#25D366" : "transparent",
        color: isPrimary ? "#FFFFFF" : "#25D366",
        border: isPrimary ? "none" : "2px solid #25D366",
        fontWeight: "600",
        fontSize: "0.95rem",
        textDecoration: "none",
        transition: "background-color 0.2s ease, opacity 0.2s ease",
        ...style,
      }}
      className="whatsapp-book-btn"
    >
      <WhatsAppIcon size={18} color={isPrimary ? "#FFFFFF" : "#25D366"} />
      {label}
      <style jsx>{`
        .whatsapp-book-btn:hover {
          opacity: 0.9;
          background-color: ${isPrimary ? "#1ebe57" : "rgba(37, 211, 102, 0.08)"};
        }
      `}</style>
    </a>
  );
}
