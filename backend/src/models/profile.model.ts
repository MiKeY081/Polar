import mongoose, { Schema, Model } from "mongoose";

const TestResultSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["REACTION", "PATTERN", "STROOP", "SEQUENCE", "N_BACK"], required: true },
    timestamp: { type: Number, required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    duration: { type: Number, required: true },
    difficultyLevel: { type: Number },
    meta: { type: Object, default: {} },
  },
  { _id: false }
);

const AdvancedMetricsSchema = new Schema(
  {
    decisionConfidence: { type: Number, required: true },
    cognitiveLoad: { type: Number, required: true },
    fatigueIndex: { type: Number, required: true },
    behaviorDrift: { type: Number, required: true },
    analysisTimestamp: { type: Number, required: true },
    summary: { type: String, required: true },
    anomalies: { type: [String], default: [] },
  },
  { _id: false }
);

const ProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true, unique: true },
    name: { type: String, required: true },
    results: { type: [TestResultSchema], default: [] },
    latestMetrics: { type: AdvancedMetricsSchema, required: false },
  },
  { timestamps: true }
);

export interface TestResultDoc {
  id: string;
  type: "REACTION" | "PATTERN" | "STROOP" | "SEQUENCE" | "N_BACK";
  timestamp: number;
  score: number;
  accuracy: number;
  duration: number;
  difficultyLevel?: number;
  meta: Record<string, any>;
}

export interface AdvancedMetricsDoc {
  decisionConfidence: number;
  cognitiveLoad: number;
  fatigueIndex: number;
  behaviorDrift: number;
  analysisTimestamp: number;
  summary: string;
  anomalies: string[];
}

export interface ProfileDoc extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  name: string;
  results: TestResultDoc[];
  latestMetrics?: AdvancedMetricsDoc;
}

export const Profile: Model<ProfileDoc> = mongoose.model<ProfileDoc>("Profile", ProfileSchema);
