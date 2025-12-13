import { Profile, ProfileDoc, TestResultDoc, AdvancedMetricsDoc } from "../models/profile.model";
import mongoose from "mongoose";

class ProfileServices {
  static async getOrCreateByUser(userId: string, name: string): Promise<ProfileDoc> {
    const uid = new mongoose.Types.ObjectId(userId);
    let profile = await Profile.findOne({ user: uid });
    if (!profile) {
      profile = await Profile.create({ user: uid, name, results: [] });
    }
    return profile;
  }

  static async getByUser(userId: string): Promise<ProfileDoc | null> {
    return Profile.findOne({ user: new mongoose.Types.ObjectId(userId) });
  }

  static async appendResult(userId: string, result: TestResultDoc): Promise<ProfileDoc | null> {
    return Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $push: { results: result } },
      { new: true }
    );
  }

  static async setMetrics(userId: string, metrics: AdvancedMetricsDoc): Promise<ProfileDoc | null> {
    return Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $set: { latestMetrics: metrics } },
      { new: true }
    );
  }

  static async clearData(userId: string): Promise<ProfileDoc | null> {
    return Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $set: { results: [], latestMetrics: undefined } },
      { new: true }
    );
  }
}

export default ProfileServices;
