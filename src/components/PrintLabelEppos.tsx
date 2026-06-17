"use client";

import React from "react";
import Barcode from "react-barcode";

export type PrintLabelProps = {
  branchName: string;
  title: string;
  category: string;
  kondisi: string;
  sku: string;
  formattedPrice?: string;
  sellingPrice?: number | string;
  hargaJual?: number | string;
  className?: string;
  hideDisclaimer?: boolean;
};

export default function PrintLabelEppos({
  branchName,
  title,
  category,
  kondisi,
  sku,
  formattedPrice,
  sellingPrice,
  hargaJual,
  className = "",
  hideDisclaimer = false,
}: PrintLabelProps) {
  const priceVal = sellingPrice !== undefined ? sellingPrice : hargaJual;
  const parsedPrice = typeof priceVal === "number" ? priceVal : parseFloat(String(priceVal || ""));
  const hasSellingPrice = !isNaN(parsedPrice) && parsedPrice > 0;

  return (
    <div className={`print:block print:w-full print:m-0 ${className}`}>
      {!hideDisclaimer && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4 print:hidden">Stiker Barcode</h3>
      )}

      {/* 
        HARDWARE ARCHITECTURE NOTE: Eppos EP9220UB (USB+Bluetooth)
        - Max Paper Width: 110mm
        - Thermal Speed: 160mm/s
        - The `sku` used here is raw string format (Code128 compatible), 
          making it easily translatable into ESC/POS thermal command bytes 
          for future React Native / Bluetooth mobile print controllers.
      */}
      <div className="flex flex-col items-center justify-between p-6 bg-white text-black box-border overflow-hidden rounded-2xl shadow-xl border border-slate-200 relative z-10 mx-auto max-w-[300px] text-center print:absolute print:left-0 print:top-0 print:w-[80mm] print:h-[100mm] print:max-w-[80mm] print:max-h-[100mm] print:p-6 print:m-0 print:rounded-none print:border-none print:shadow-none">
        
        {/* HEADER */}
        <div className="text-lg font-bold tracking-wider border-b-2 border-black pb-2 w-full text-center uppercase">
          PT MBG - {branchName}
        </div>

        {/* BODY CONTENT */}
        <div className="flex flex-col items-center w-full">
          <div className="text-base font-semibold mt-4 text-center w-full break-words">
            {title}
          </div>
          <div className="text-sm text-slate-700 mt-1">
            {category} • {kondisi}
          </div>

          {/* PRICE DISPLAY */}
          {hasSellingPrice && (
            <div className="text-3xl md:text-4xl font-black text-black border-2 border-dashed border-black py-2 px-4 my-2 block tracking-wider">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parsedPrice)}
            </div>
          )}
        </div>

        {/* BARCODE ENGINE */}
        <div className="mt-auto flex flex-col items-center w-full barcode-container pt-4">
          <Barcode
            value={sku}
            width={2.5}
            height={70}
            displayValue={false}
            margin={0}
            background="#ffffff"
            lineColor="#000000"
          />
          <div className="font-mono tracking-wider text-sm font-bold text-center mt-2">
            {sku}
          </div>
        </div>
      </div>

      {!hideDisclaimer && (
        <p className="text-xs text-slate-500 text-center mt-6 print:hidden bg-slate-50 p-3 rounded-lg border border-slate-100">
          💡 Saat menekan Print, hanya area stiker putih ini yang akan tercetak ke kertas thermal (ukuran 80mm x 100mm).
        </p>
      )}

      {/* Global styles for print specifically for this component */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: 80mm 100mm;
            margin: 0mm !important; /* This strips browser headers/footers completely */
          }
          body {
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
            image-rendering: pixelated;
            -webkit-font-smoothing: none;
            font-smooth: never;
          }
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
