import type { ConfidenceTier, FieldAssertion, RecordEvent } from "../types";
import { timestamp } from "../utils/format";
import { AnalyticalStore } from "./AnalyticalStore";

export class HistoryService {
  constructor(private store: AnalyticalStore) {}

  async record(recordId: string, eventType: string, summary: string, data: Record<string, unknown> = {}, actor = "STRIVE Navigator", batchId?: string, dedupeKey?: string): Promise<RecordEvent> {
    const event: RecordEvent = {
      id: `event_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      record_id: recordId,
      event_type: eventType,
      occurred_at: timestamp(),
      actor,
      summary,
      data,
      batch_id: batchId,
      dedupe_key: dedupeKey
    };
    await this.store.addEvent(event);
    return event;
  }

  async assert(recordId: string, field: string, value: unknown, options: {
    sourceId?: string; confidence?: ConfidenceTier; validFrom?: string; validTo?: string;
    reviewer?: string; reviewStatus?: FieldAssertion["review_status"]; supersedesId?: string;
  } = {}): Promise<FieldAssertion> {
    const assertion: FieldAssertion = {
      id: `assertion_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      record_id: recordId,
      field,
      value,
      valid_from: options.validFrom,
      valid_to: options.validTo,
      observed_at: timestamp(),
      source_id: options.sourceId,
      confidence: options.confidence ?? "C",
      reviewer: options.reviewer,
      review_status: options.reviewStatus ?? "pending",
      supersedes_id: options.supersedesId
    };
    await this.store.addAssertion(assertion);
    await this.record(recordId, "field_asserted", `Assertion added for ${field}`, { assertion_id: assertion.id, value, confidence: assertion.confidence });
    return assertion;
  }
}

