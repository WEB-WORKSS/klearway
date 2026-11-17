// Field definitions per document type. Labels are matched case-insensitively at the start
// of a line ("Label: value"), which suits digital (text-layer) PDFs and plain-text exports.
export const DOC_TYPES = {
  bill_of_lading: { label: 'Bill of lading', short: 'B/L' },
  commercial_invoice: { label: 'Commercial invoice', short: 'Invoice' },
  packing_list: { label: 'Packing list', short: 'Packing list' },
  other: { label: 'Other document', short: 'Other' },
};

export const REQUIRED_TYPES = ['bill_of_lading', 'commercial_invoice', 'packing_list'];

export const FIELDS = {
  bill_of_lading: [
    { key: 'bl_number', label: 'B/L number', labels: ['b/l no', 'b/l number', 'bill of lading no', 'bill of lading number', 'bl number', 'bl no'] },
    { key: 'shipper', label: 'Shipper', labels: ['shipper', 'exporter'] },
    { key: 'consignee', label: 'Consignee', labels: ['consignee'] },
    { key: 'notify_party', label: 'Notify party', labels: ['notify party'], optional: true },
    { key: 'vessel_voyage', label: 'Vessel / voyage', labels: ['vessel / voyage', 'vessel/voyage', 'vessel', 'flight no'], optional: true },
    { key: 'port_of_loading', label: 'Port of loading', labels: ['port of loading', 'place of loading'] },
    { key: 'port_of_discharge', label: 'Port of discharge', labels: ['port of discharge', 'place of discharge'] },
    { key: 'container_numbers', label: 'Container numbers', labels: ['container nos', 'container numbers', 'container number', 'container no', 'containers'], type: 'containers' },
    { key: 'package_count', label: 'Number of packages', labels: ['no. of packages', 'number of packages', 'total packages', 'no of packages', 'packages'], type: 'number' },
    { key: 'gross_weight_kg', label: 'Gross weight (kg)', labels: ['total gross weight', 'gross weight'], type: 'weight' },
    { key: 'goods_description', label: 'Description of goods', labels: ['description of goods', 'description'], optional: true },
  ],
  commercial_invoice: [
    { key: 'invoice_number', label: 'Invoice number', labels: ['invoice no', 'invoice number', 'invoice #', 'inv no'] },
    { key: 'invoice_date', label: 'Invoice date', labels: ['invoice date'], optional: true },
    { key: 'seller', label: 'Seller', labels: ['seller', 'exporter', 'supplier'] },
    { key: 'buyer', label: 'Buyer / consignee', labels: ['buyer', 'consignee', 'sold to', 'bill to'] },
    { key: 'currency', label: 'Currency', labels: ['currency'], optional: true },
    { key: 'total_value', label: 'Total invoice value', labels: ['total invoice value', 'invoice total', 'total value', 'total amount', 'grand total'], type: 'number' },
    { key: 'incoterms', label: 'Incoterms', labels: ['incoterms', 'terms of delivery'], optional: true },
    { key: 'quantity', label: 'Total quantity', labels: ['total quantity', 'quantity'], type: 'number' },
    { key: 'hs_code', label: 'HS code', labels: ['hs code', 'h.s. code', 'tariff code'], optional: true },
    { key: 'goods_description', label: 'Description of goods', labels: ['description of goods', 'description'], optional: true },
  ],
  packing_list: [
    { key: 'invoice_reference', label: 'Invoice reference', labels: ['invoice reference', 'invoice ref', 'invoice no', 'invoice number'] },
    { key: 'consignee', label: 'Consignee', labels: ['consignee', 'ship to'] },
    { key: 'container_numbers', label: 'Container numbers', labels: ['container nos', 'container numbers', 'container number', 'container no', 'containers'], type: 'containers', optional: true },
    { key: 'package_count', label: 'Number of packages', labels: ['total packages', 'no. of packages', 'number of packages', 'no of packages', 'packages'], type: 'number' },
    { key: 'quantity', label: 'Total quantity', labels: ['total quantity', 'quantity'], type: 'number' },
    { key: 'gross_weight_kg', label: 'Gross weight (kg)', labels: ['total gross weight', 'gross weight'], type: 'weight' },
    { key: 'net_weight_kg', label: 'Net weight (kg)', labels: ['total net weight', 'net weight'], type: 'weight', optional: true },
  ],
  other: [],
};

export function fieldDefs(type) {
  return FIELDS[type] || [];
}
