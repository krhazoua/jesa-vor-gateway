export type EngineeringMasterMode = "LOCAL_AUTHORITATIVE_DATASET" | "PRODUCTION_ADAPTER_NOT_CONFIGURED";

export type EngineeringCatalogSnapshot<Equipment = unknown, Variable = unknown> = {
  equipment: Equipment[];
  variables: Variable[];
  source: "LOCAL_DATABASE" | "PRODUCTION_MASTER";
  mode: EngineeringMasterMode;
  readOnly: true;
  retrievedAt: Date;
};

export interface EngineeringMasterRepository<Equipment = unknown, Variable = unknown> {
  readonly mode: EngineeringMasterMode;
  readonly readOnly: true;
  getCatalog(): Promise<EngineeringCatalogSnapshot<Equipment, Variable>>;
}

/**
 * The prototype's active authoritative source is the canonical local database.
 * A production adapter can implement the same interface once project-specific
 * endpoint, protocol, authentication, and catalog mapping are supplied.
 */
export function createLocalEngineeringMasterRepository<Equipment, Variable>(
  readCatalog: () => Promise<{ equipment: Equipment[]; variables: Variable[] }>,
): EngineeringMasterRepository<Equipment, Variable> {
  return {
    mode: "LOCAL_AUTHORITATIVE_DATASET",
    readOnly: true,
    async getCatalog() {
      const catalog = await readCatalog();
      return {
        ...catalog,
        source: "LOCAL_DATABASE",
        mode: "LOCAL_AUTHORITATIVE_DATASET",
        readOnly: true,
        retrievedAt: new Date(),
      };
    },
  };
}
