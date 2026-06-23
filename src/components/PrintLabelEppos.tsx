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
  hasWarranty?: boolean;
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
  hasWarranty = false,
}: PrintLabelProps) {
  const priceVal = sellingPrice !== undefined ? sellingPrice : hargaJual;
  const parsedPrice = typeof priceVal === "number" ? priceVal : parseFloat(String(priceVal || ""));
  const hasSellingPrice = !isNaN(parsedPrice) && parsedPrice > 0;

  const displayBranch = branchName && branchName.toLowerCase().includes("pasuruan") 
    ? "Cabang Pasuruan - Sangar" 
    : branchName;

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
      <div className="receipt-print-wrapper flex flex-col items-center justify-between p-6 bg-white text-black box-border overflow-hidden rounded-2xl shadow-xl border border-slate-200 relative z-10 mx-auto max-w-[300px] text-center">
        
        {/* HEADER */}
        <div className="text-lg font-bold tracking-wide border-b-2 border-black pb-2 w-full text-center uppercase print:text-base print:leading-tight">
          PT MBG - {displayBranch}
        </div>

        {/* BODY CONTENT */}
        <div className="flex flex-col items-center w-full">
          <div className="text-base font-semibold mt-4 text-center w-full break-words print:text-xs print:mt-1 print:text-slate-800 line-clamp-1">
            {title}
          </div>
          <div className="text-sm text-slate-700 mt-1 print:text-[10px] print:mt-0.5">
            {category} • {kondisi}
          </div>
          {hasWarranty && (
            <div className="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 mt-1.5 uppercase tracking-wide print:text-[9px] print:leading-none print:mt-1">
              [ 🛡️ GARANSI RESMI MBG ]
            </div>
          )}

          {/* PRICE DISPLAY */}
          {hasSellingPrice && (
            <div className="w-full max-w-[85mm] box-border text-center text-3xl md:text-4xl print:text-xl font-black text-black border-2 border-dashed border-black py-2 px-4 print:py-1 print:my-1.5 block tracking-wider mx-auto">
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
          <div className="font-mono tracking-wider text-sm font-bold text-center mt-2 w-full">
            {sku}
          </div>
        </div>
      </div>

      {!hideDisclaimer && (
        <p className="text-xs text-slate-500 text-center mt-6 print:hidden bg-slate-50 p-3 rounded-lg border border-slate-100">
          💡 Saat menekan Print, hanya area stiker putih ini yang akan tercetak ke kertas thermal (ukuran 100mm x 80mm).
        </p>
      )}

      {/* Global styles for print specifically for this component */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: 100mm 80mm !important;
            margin: 0 !important; /* Strips browser space leakage completely */
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
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
          /* Lock the master wrapper tightly inside label dimensions */
          .receipt-print-wrapper {
            visibility: visible !important;
            width: 100mm !important;
            height: 80mm !important;
            max-width: 100mm !important;
            max-height: 80mm !important;
            box-sizing: border-box !important;
            padding: 4mm 6mm !important; /* Safe inner bounds */
            overflow: hidden !important; /* Prevents text from making a 2nd page */
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important; /* Distributes items nicely within 80mm */
            align-items: center !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            background-color: white !important;
          }
          .receipt-print-wrapper * {
            visibility: visible !important;
          }
          .barcode-container {
            padding-top: 2px !important;
            margin-top: auto !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .barcode-container svg {
            max-width: 100% !important;
            max-height: 20mm !important;
            width: auto !important;
            height: auto !important;
          }
          .barcode-container div {
            font-size: 10px !important;
            margin-top: 2px !important;
          }
        }
      `}} />
    </div>
  );
}
