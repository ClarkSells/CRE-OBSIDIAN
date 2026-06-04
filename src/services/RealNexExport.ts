import { Notice, Vault } from "obsidian";
import type { NavigatorRecord } from "../types";
import { csvEscape } from "../utils/markdown";

const COLUMNS = [
  "RecordType", "RealNexID", "Name", "Address", "City", "State", "Zip", "County",
  "Submarket", "AssetClass", "AssetSubtype", "BuildingSF", "LandAcres", "YearBuilt",
  "OwnerEntity", "BeneficialOwner", "PrimaryContact", "Phone", "Email", "LastSaleDate",
  "LastSalePrice", "AssessedValue", "DealSignalScore", "ConfidenceTier", "HumanReview",
  "SourceStatus", "LastUpdated", "Notes"
];

export class RealNexExportService {
  constructor(private vault: Vault) {}

  async export(records: NavigatorRecord[]): Promise<string> {
    if (!this.vault.getAbstractFileByPath("Exports")) await this.vault.createFolder("Exports");
    const rows = records.map((record) => this.toRow(record));
    const csv = [COLUMNS.map(csvEscape).join(","), ...rows.map((row) => COLUMNS.map((column) => csvEscape(row[column] ?? "")).join(","))].join("\r\n");
    const stamp = new Date().toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19);
    const path = `Exports/realnex_export_${stamp}.csv`;
    await this.vault.create(path, csv);
    new Notice(`STRIVE Navigator: RealNex CSV exported to ${path}`);
    return path;
  }

  private toRow(record: NavigatorRecord): Record<string, unknown> {
    return {
      RecordType: record.type, RealNexID: record.realnex_id, Name: record.name,
      Address: record.address ?? record.situs_address, City: record.city, State: record.state,
      Zip: record.zip, County: record.county, Submarket: record.submarket,
      AssetClass: record.asset_class, AssetSubtype: record.asset_subtype,
      BuildingSF: record.building_sf ?? record.sf, LandAcres: record.land_acres ?? record.acreage,
      YearBuilt: record.year_built, OwnerEntity: record.owner_entity, BeneficialOwner: record.beneficial_owner,
      PrimaryContact: record.primary_contact ?? record.full_name, Phone: record.phone_mobile ?? record.phone_office,
      Email: record.email_business, LastSaleDate: record.last_sale_date ?? record.sale_date,
      LastSalePrice: record.last_sale_price ?? record.sale_price, AssessedValue: record.assessed_value ?? record.total_value,
      DealSignalScore: record.deal_signal_score ?? record.signal_strength, ConfidenceTier: record.confidence_tier,
      HumanReview: record.human_review, SourceStatus: record.source_status, LastUpdated: record.updated,
      Notes: record.next_step ?? record.recommended_action ?? ""
    };
  }
}

