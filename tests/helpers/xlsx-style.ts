import { strFromU8, unzipSync } from "fflate";

export function getCellFontRgbFromXlsx(data: ArrayBuffer | Uint8Array, sheetName: string, cellAddress: string): string | null {
  const zip = unzipSync(data instanceof Uint8Array ? data : new Uint8Array(data));
  const workbookXml = readZipText(zip, "xl/workbook.xml");
  const workbookRelsXml = readZipText(zip, "xl/_rels/workbook.xml.rels");
  const sheetPath = resolveWorksheetPaths(workbookXml, workbookRelsXml).get(sheetName);

  if (!sheetPath) {
    return null;
  }

  const sheetXml = readZipText(zip, sheetPath);
  const cellTag = findCellTag(sheetXml, cellAddress);

  if (!cellTag) {
    return null;
  }

  const styleId = Number(getXmlAttribute(cellTag, "s") ?? "0");
  const stylesXml = readZipText(zip, "xl/styles.xml");
  const cellXf = getIndexedElement(stylesXml, "cellXfs", "xf", styleId);
  const fontId = Number(getXmlAttribute(cellXf ?? "", "fontId") ?? "0");
  const font = getIndexedElement(stylesXml, "fonts", "font", fontId);
  const colorTag = font ? /<color\b[^>]*\/?>/.exec(font)?.[0] : null;

  return colorTag ? getXmlAttribute(colorTag, "rgb") : null;
}

export function getWorkbookCalcPrAttributesFromXlsx(data: ArrayBuffer | Uint8Array): Record<string, string> {
  const zip = unzipSync(data instanceof Uint8Array ? data : new Uint8Array(data));
  const workbookXml = readZipText(zip, "xl/workbook.xml");
  const calcPrTag = /<calcPr\b[^>]*(?:\/>|>[\s\S]*?<\/calcPr>)/.exec(workbookXml)?.[0] ?? "";
  const attributes: Record<string, string> = {};

  for (const match of calcPrTag.matchAll(/\s([A-Za-z0-9:]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

export function hasXlsxEntry(data: ArrayBuffer | Uint8Array, path: string): boolean {
  const zip = unzipSync(data instanceof Uint8Array ? data : new Uint8Array(data));

  return Boolean(zip[path]);
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

    if (id && target && type?.endsWith("/worksheet")) {
      relationshipTargets.set(id, target.startsWith("/") ? target.slice(1) : `xl/${target}`);
    }
  }

  const paths = new Map<string, string>();
  const sheetRegex = /<sheet\b([^>]*)\/?>/g;
  let sheetMatch: RegExpExecArray | null;

  while ((sheetMatch = sheetRegex.exec(workbookXml))) {
    const name = getXmlAttribute(sheetMatch[1], "name");
    const relationshipId = getXmlAttribute(sheetMatch[1], "r:id");
    const path = relationshipId ? relationshipTargets.get(relationshipId) : null;

    if (name && path) {
      paths.set(decodeXmlAttribute(name), path);
    }
  }

  return paths;
}

function getIndexedElement(stylesXml: string, sectionName: string, elementName: string, index: number): string | null {
  const section = new RegExp(`<${sectionName}\\b[^>]*>([\\s\\S]*?)</${sectionName}>`).exec(stylesXml);

  if (!section) {
    return null;
  }

  const elements = [...section[1].matchAll(new RegExp(`<${elementName}\\b[^>]*(?:/>|>[\\s\\S]*?</${elementName}>)`, "g"))].map((match) => match[0]);

  return elements[index] ?? null;
}

function findCellTag(sheetXml: string, cellAddress: string): string | null {
  const regex = new RegExp(`<c\\b(?=[^>]*\\br="${escapeRegExp(cellAddress)}")[^>]*>`);

  return regex.exec(sheetXml)?.[0] ?? null;
}

function getXmlAttribute(xmlFragment: string, attributeName: string): string | null {
  const match = new RegExp(`(?:^|\\s)${escapeRegExp(attributeName)}="([^"]*)"`).exec(xmlFragment);

  return match?.[1] ?? null;
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
