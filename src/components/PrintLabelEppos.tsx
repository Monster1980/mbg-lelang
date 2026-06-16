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
      <div className="bg-white text-black p-6 rounded-2xl shadow-xl border border-slate-200 relative z-10 mx-auto max-w-[300px] text-center flex flex-col items-center print:absolute print:left-0 print:top-0 print:w-[50mm] print:h-[30mm] print:max-w-full print:max-h-[30mm] print:flex print:flex-col print:items-center print:justify-center print:text-center print:p-4 print:m-0 print:rounded-none print:border-none print:shadow-none print:overflow-hidden box-border">
        <div className="font-black text-xl tracking-tight print:text-[9px] print:leading-tight">
          MBG LELANG
        </div>
        <div className="text-[10px] uppercase font-bold mb-3 border-b-2 border-black/20 pb-2 w-full text-center print:hidden">
          {branchName}
        </div>

        <div className="w-full truncate text-sm font-bold mb-1 px-2 text-center print:text-[8px] print:mb-0.5 print:px-0">
          {title}
        </div>

        <div className="flex justify-between w-full px-4 text-xs font-bold mb-2 print:flex print:justify-center print:gap-1.5 print:px-0 print:text-[7px] print:mb-0.5 print:font-bold">
          <span>{category}</span>
          <span className="hidden print:inline-block">•</span>
          <span>{kondisi}</span>
        </div>

        {hasSellingPrice && (
          <div className="text-base font-bold text-black tracking-wide mt-1 print:text-[8px] print:mt-0.5 print:leading-tight">
            Harga: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parsedPrice)}
          </div>
        )}

        <div className="my-2 print:my-0.5 bg-white flex justify-center w-full barcode-container">
          <Barcode
            value={sku}
            width={1.5}
            height={40}
            displayValue={false}
            margin={0}
            background="#ffffff"
            lineColor="#000000"
          />
        </div>

        <div className="font-mono tracking-wider print:text-[8px] text-sm font-bold text-center print:leading-none">
          {sku}
        </div>
      </div>

      {!hideDisclaimer && (
        <p className="text-xs text-slate-500 text-center mt-6 print:hidden bg-slate-50 p-3 rounded-lg border border-slate-100">
          💡 Saat menekan Print, hanya area stiker putih ini yang akan tercetak ke kertas thermal (ukuran 50mm x 30mm).
        </p>
      )}

      {/* Global styles for print specifically for this component */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: 50mm 30mm;
            margin: 0;
          }
          body {
            margin: 0;
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
          .barcode-container svg {
            height: 30px !important;
          }
        }
      `}} />
    </div>
  );
}
