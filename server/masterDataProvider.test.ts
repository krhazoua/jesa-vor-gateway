import { describe, expect, it, vi } from "vitest";
import { createLocalEngineeringMasterRepository } from "./masterDataProvider";

describe("local engineering master repository", () => {
  it("returns the existing catalog as a read-only local authoritative dataset", async () => {
    const readCatalog = vi.fn(async () => ({ equipment: [{ id: 1, tag: "E-1" }], variables: [{ id: 2, tag: "V-1" }] }));
    const repository = createLocalEngineeringMasterRepository(readCatalog);

    const snapshot = await repository.getCatalog();

    expect(readCatalog).toHaveBeenCalledOnce();
    expect(snapshot).toMatchObject({
      equipment: [{ id: 1, tag: "E-1" }],
      variables: [{ id: 2, tag: "V-1" }],
      source: "LOCAL_DATABASE",
      mode: "LOCAL_AUTHORITATIVE_DATASET",
      readOnly: true,
    });
    expect(snapshot.retrievedAt).toBeInstanceOf(Date);
  });

  it("does not expose a production endpoint or mutate the source", async () => {
    const catalog = { equipment: [], variables: [] };
    const repository = createLocalEngineeringMasterRepository(async () => catalog);

    expect(repository.mode).toBe("LOCAL_AUTHORITATIVE_DATASET");
    expect(repository.readOnly).toBe(true);
    expect(Object.keys(repository)).not.toContain("endpoint");
    expect(await repository.getCatalog()).toMatchObject({ source: "LOCAL_DATABASE", readOnly: true });
    expect(catalog).toEqual({ equipment: [], variables: [] });
  });
});
