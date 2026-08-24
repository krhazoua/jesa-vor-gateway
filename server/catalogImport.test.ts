import { describe, expect, it } from "vitest";
import { parseCatalogCsv } from "./catalogImport";

describe("parseCatalogCsv", () => {
  it("parses a valid equipment catalog with quoted fields", () => {
    const result = parseCatalogCsv("EQUIPMENT", 'tag,name,processArea,sourceRef\nATTACK-01,"Attack Reactor, Unit 1",ATTACK_REACTOR,PAP-REF\n');
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ tag: "ATTACK-01", name: "Attack Reactor, Unit 1" });
  });

  it("parses a valid variable catalog and preserves numeric text", () => {
    const result = parseCatalogCsv("VARIABLE", "tag,name,variableType,unit,hardLow,hardHigh,warningLow,warningHigh,criticalLow,criticalHigh,silClass,dcsMapping,sourceRef\nTIC-5210,Reactor Temperature,PV,°C,71,80,72,79,70,81,SIL-0,DCS.PAP.TIC5210,PAP-REF\n");
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ tag: "TIC-5210", variableType: "PV", hardLow: "71", hardHigh: "80", silClass: "SIL-0" });
  });

  it("rejects duplicate tags and invalid enum/numeric values", () => {
    const result = parseCatalogCsv("VARIABLE", "tag,name,variableType,unit,hardLow,hardHigh,warningLow,warningHigh,criticalLow,criticalHigh,silClass,dcsMapping,sourceRef\nTIC-5210,One,PV,°C,low,80,,,,,SIL-9,DCS.TAG,REF\nTIC-5210,Two,PV,°C,71,80,,,,,SIL-0,DCS.TAG,REF\n");
    expect(result.errors.map(error => error.message).join(" | ")).toMatch(/hardLow must be numeric/);
    expect(result.errors.map(error => error.message).join(" | ")).toMatch(/silClass must be SIL-0/);
    expect(result.errors.map(error => error.message).join(" | ")).toMatch(/Duplicate tag TIC-5210/);
  });

  it("rejects header-only and wrong-header files", () => {
    expect(parseCatalogCsv("EQUIPMENT", "tag,name,processArea,sourceRef\n").errors[0].message).toContain("no data rows");
    expect(parseCatalogCsv("EQUIPMENT", "name,tag,processArea,sourceRef\nA,B,C,D\n").errors[0].message).toContain("Expected headers");
  });
});
