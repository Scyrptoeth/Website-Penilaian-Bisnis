import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export type XlsxCellRef = {
  sheet: string;
  cell: string;
};

const blueFontRgb = "FF0000FF";

export function applyBlueFontToXlsxCells(data: ArrayBuffer | Uint8Array, cells: XlsxCellRef[]): Uint8Array {
  const source = data instanceof Uint8Array ? data : new Uint8Array(data);
  const uniqueCells = uniqueCellRefs(cells);

  if (uniqueCells.length === 0) {
    return source;
  }

  const zip = unzipSync(source);
  const workbookXml = readZipText(zip, "xl/workbook.xml");
  const workbookRelsXml = readZipText(zip, "xl/_rels/workbook.xml.rels");
  const sheetPaths = resolveWorksheetPaths(workbookXml, workbookRelsXml);
  const cellsByPath = new Map<string, string[]>();

  uniqueCells.forEach((item) => {
    const path = sheetPaths.get(item.sheet);

    if (!path || !zip[path]) {
      return;
    }

    const cellsForPath = cellsByPath.get(path) ?? [];
    cellsForPath.push(item.cell);
    cellsByPath.set(path, cellsForPath);
  });

  if (cellsByPath.size === 0) {
    return source;
  }

  const baseStyleIds = new Set<number>();

  cellsByPath.forEach((cellAddresses, path) => {
    const sheetXml = readZipText(zip, path);

    cellAddresses.forEach((cellAddress) => {
      const cellTag = findCellTag(sheetXml, cellAddress);

      if (cellTag) {
        baseStyleIds.add(getCellStyleId(cellTag));
      }
    });
  });

  if (baseStyleIds.size === 0) {
    return source;
  }

  const stylesXml = readZipText(zip, "xl/styles.xml");
  const { xml: patchedStylesXml, blueStyleByBaseStyle } = addBlueFontStyles(stylesXml, baseStyleIds);
  zip["xl/styles.xml"] = strToU8(patchedStylesXml);

  cellsByPath.forEach((cellAddresses, path) => {
    let sheetXml = readZipText(zip, path);

    cellAddresses.forEach((cellAddress) => {
      const cellTag = findCellTag(sheetXml, cellAddress);

      if (!cellTag) {
        return;
      }

      const baseStyleId = getCellStyleId(cellTag);
      const blueStyleId = blueStyleByBaseStyle.get(baseStyleId);

      if (blueStyleId === undefined) {
        return;
      }

      sheetXml = setCellStyle(sheetXml, cellAddress, blueStyleId);
    });

    zip[path] = strToU8(sheetXml);
  });

  return zipSync(zip, { level: 6 });
}

export function prepareXlsxForExcelRecalculation(data: ArrayBuffer | Uint8Array): Uint8Array {
  const source = data instanceof Uint8Array ? data : new Uint8Array(data);
  const zip = unzipSync(source);
  const workbookXml = readZipText(zip, "xl/workbook.xml");

  zip["xl/workbook.xml"] = strToU8(upsertWorkbookCalcPr(workbookXml));
  delete zip["xl/calcChain.xml"];

  if (zip["[Content_Types].xml"]) {
    zip["[Content_Types].xml"] = strToU8(removeCalcChainContentType(readZipText(zip, "[Content_Types].xml")));
  }

  if (zip["xl/_rels/workbook.xml.rels"]) {
    zip["xl/_rels/workbook.xml.rels"] = strToU8(removeCalcChainRelationship(readZipText(zip, "xl/_rels/workbook.xml.rels")));
  }

  return zipSync(zip, { level: 6 });
}

function uniqueCellRefs(cells: XlsxCellRef[]): XlsxCellRef[] {
  const seen = new Set<string>();
  const output: XlsxCellRef[] = [];

  cells.forEach((item) => {
    const key = `${item.sheet}!${item.cell}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    output.push(item);
  });

  return output;
}

function readZipText(zip: Record<string, Uint8Array>, path: string): string {
  const file = zip[path];

  if (!file) {
    throw new Error(`XLSX file is missing ${path}`);
  }

  return strFromU8(file);
}

function resolveWorksheetPaths(workbookXml: string, workbookRelsXml: string): Map<string, string> {
  const relationshipTargets = new Map<string, string>();
  const relationshipRegex = /<Relationship\b([^>]*)\/?>/g;
  let relationshipMatch: RegExpExecArray | null;

  while ((relationshipMatch = relationshipRegex.exec(workbookRelsXml))) {
    const id = getXmlAttribute(relationshipMatch[1], "Id");
    const target = getXmlAttribute(relationshipMatch[1], "Target");
    const type = getXmlAttribute(relationshipMatch[1], "Type");

    if (!id || !target || !type?.endsWith("/worksheet")) {
      continue;
    }

    relationshipTargets.set(id, normalizeWorkbookRelationshipTarget(target));
  }

  const paths = new Map<string, string>();
  const sheetRegex = /<sheet\b([^>]*)\/?>/g;
  let sheetMatch: RegExpExecArray | null;

  while ((sheetMatch = sheetRegex.exec(workbookXml))) {
    const name = getXmlAttribute(sheetMatch[1], "name");
    const relationshipId = getXmlAttribute(sheetMatch[1], "r:id");

    if (!name || !relationshipId) {
      continue;
    }

    const path = relationshipTargets.get(relationshipId);

    if (path) {
      paths.set(decodeXmlAttribute(name), path);
    }
  }

  return paths;
}

function normalizeWorkbookRelationshipTarget(target: string): string {
  if (target.startsWith("/")) {
    return target.slice(1);
  }

  return `xl/${target}`;
}

function addBlueFontStyles(stylesXml: string, baseStyleIds: Set<number>) {
  const fontsSection = /<fonts\b([^>]*)>([\s\S]*?)<\/fonts>/.exec(stylesXml);
  const cellXfsSection = /<cellXfs\b([^>]*)>([\s\S]*?)<\/cellXfs>/.exec(stylesXml);

  if (!fontsSection || !cellXfsSection) {
    throw new Error("XLSX styles.xml does not contain fonts/cellXfs sections");
  }

  const fonts = extractXmlElements(fontsSection[2], "font");
  const cellXfs = extractXmlElements(cellXfsSection[2], "xf");

  if (fonts.length === 0 || cellXfs.length === 0) {
    throw new Error("XLSX styles.xml has no base fonts or cell formats");
  }

  const blueFonts: string[] = [];
  const blueXfs: string[] = [];
  const blueStyleByBaseStyle = new Map<number, number>();

  [...baseStyleIds].sort((left, right) => left - right).forEach((baseStyleId) => {
    const baseXf = cellXfs[baseStyleId] ?? cellXfs[0];
    const baseFontId = Number(getXmlAttribute(baseXf, "fontId") ?? "0");
    const baseFont = fonts[baseFontId] ?? fonts[0];
    const blueFontId = fonts.length + blueFonts.length;
    const blueStyleId = cellXfs.length + blueXfs.length;
    const blueFont = withBlueFontColor(baseFont);
    const blueXf = setXmlAttribute(setXmlAttribute(baseXf, "fontId", String(blueFontId)), "applyFont", "1");

    blueFonts.push(blueFont);
    blueXfs.push(blueXf);
    blueStyleByBaseStyle.set(baseStyleId, blueStyleId);
  });

  const nextFontsOpen = setXmlAttribute(`<fonts${fontsSection[1]}>`, "count", String(fonts.length + blueFonts.length));
  const nextCellXfsOpen = setXmlAttribute(`<cellXfs${cellXfsSection[1]}>`, "count", String(cellXfs.length + blueXfs.length));
  const nextStylesXml = stylesXml
    .replace(fontsSection[0], `${nextFontsOpen}${fontsSection[2]}${blueFonts.join("")}</fonts>`)
    .replace(cellXfsSection[0], `${nextCellXfsOpen}${cellXfsSection[2]}${blueXfs.join("")}</cellXfs>`);

  return {
    xml: nextStylesXml,
    blueStyleByBaseStyle,
  };
}

function upsertWorkbookCalcPr(workbookXml: string): string {
  const calcPr = '<calcPr calcMode="auto" calcOnSave="1" forceFullCalc="1" fullCalcOnLoad="1"/>';
  const calcPrRegex = /<calcPr\b[^>]*(?:\/>|>[\s\S]*?<\/calcPr>)/;

  if (calcPrRegex.test(workbookXml)) {
    return workbookXml.replace(calcPrRegex, calcPr);
  }

  return workbookXml.replace("</workbook>", `${calcPr}</workbook>`);
}

function removeCalcChainContentType(contentTypesXml: string): string {
  return contentTypesXml.replace(/<Override\b(?=[^>]*\bPartName="\/xl\/calcChain\.xml")[^>]*\/>/g, "");
}

function removeCalcChainRelationship(workbookRelsXml: string): string {
  return workbookRelsXml.replace(/<Relationship\b(?=[^>]*\bType="[^"]*\/calcChain")[^>]*\/>/g, "");
}

function extractXmlElements(xml: string, elementName: string): string[] {
  const regex = new RegExp(`<${elementName}\\b[^>]*(?:/>|>[\\s\\S]*?</${elementName}>)`, "g");

  return [...xml.matchAll(regex)].map((match) => match[0]);
}

function withBlueFontColor(fontXml: string): string {
  if (/<color\b[^>]*\/>/.test(fontXml)) {
    return fontXml.replace(/<color\b[^>]*\/>/, `<color rgb="${blueFontRgb}"/>`);
  }

  if (/<color\b[^>]*>[\s\S]*?<\/color>/.test(fontXml)) {
    return fontXml.replace(/<color\b[^>]*>[\s\S]*?<\/color>/, `<color rgb="${blueFontRgb}"/>`);
  }

  return fontXml.replace(/<font\b[^>]*>/, (openingTag) => `${openingTag}<color rgb="${blueFontRgb}"/>`);
}

function findCellTag(sheetXml: string, cellAddress: string): string | null {
  const regex = new RegExp(`<c\\b(?=[^>]*\\br="${escapeRegExp(cellAddress)}")[^>]*>`);

  return regex.exec(sheetXml)?.[0] ?? null;
}

function setCellStyle(sheetXml: string, cellAddress: string, styleId: number): string {
  const regex = new RegExp(`<c\\b(?=[^>]*\\br="${escapeRegExp(cellAddress)}")[^>]*>`);

  return sheetXml.replace(regex, (cellTag) => setXmlAttribute(cellTag, "s", String(styleId)));
}

function getCellStyleId(cellTag: string): number {
  return Number(getXmlAttribute(cellTag, "s") ?? "0");
}

function getXmlAttribute(xmlFragment: string, attributeName: string): string | null {
  const match = new RegExp(`(?:^|\\s)${escapeRegExp(attributeName)}="([^"]*)"`).exec(xmlFragment);

  return match?.[1] ?? null;
}

function setXmlAttribute(xmlTag: string, attributeName: string, value: string): string {
  const attributeRegex = new RegExp(`(\\s${escapeRegExp(attributeName)}=")[^"]*(")`);

  if (attributeRegex.test(xmlTag)) {
    return xmlTag.replace(attributeRegex, `$1${value}$2`);
  }

  if (xmlTag.endsWith("/>")) {
    return `${xmlTag.slice(0, -2)} ${attributeName}="${value}"/>`;
  }

  return `${xmlTag.slice(0, -1)} ${attributeName}="${value}">`;
}

function decodeXmlAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
