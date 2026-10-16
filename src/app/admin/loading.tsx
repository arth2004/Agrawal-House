import React from "react";
import HeritageLoader from "@/components/HeritageLoader";

export default function AdminLoading() {
  return (
    <HeritageLoader
      title="Agrawal House Admin"
      subtitle="Loading management dashboard..."
      fullScreen={true}
    />
  );
}
