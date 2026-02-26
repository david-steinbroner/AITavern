import { captureError } from "./sentry";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface DailySpend {
  date: string; // YYYY-MM-DD
  totalCost: number; // in dollars
  requestCount: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

interface SessionSpend {
  requestCount: number;
  totalCost: number;
  totalTokens: number;
}

interface AllTimeStats {
  totalCost: number;
  requestCount: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

class SpendTracker {
  private currentSpend: DailySpend;
  private allTimeStats: AllTimeStats;
  private sessionSpends: Map<string, SessionSpend>;
  private readonly DAILY_LIMIT = 10; // $10 per day
  private readonly WARNING_THRESHOLD = 8; // Alert at $8

  // Claude 3.5 Haiku via OpenRouter pricing (per 1K tokens)
  private readonly INPUT_COST_PER_1K = 0.0008; // $0.0008 per 1K input tokens
  private readonly OUTPUT_COST_PER_1K = 0.004; // $0.004 per 1K output tokens

  constructor() {
    this.currentSpend = this.initializeDay();
    this.allTimeStats = {
      totalCost: 0,
      requestCount: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
    };
    this.sessionSpends = new Map();
  }

  private initializeDay(): DailySpend {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      totalCost: 0,
      requestCount: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
    };
  }

  private checkAndResetDay(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.currentSpend.date !== today) {
      console.log(`[SpendTracker] Day reset. Previous: ${this.currentSpend.date}, Spent: $${this.currentSpend.totalCost.toFixed(4)}, Requests: ${this.currentSpend.requestCount}`);
      this.currentSpend = this.initializeDay();
    }
  }

  private calculateCost(usage: TokenUsage): number {
    const inputCost = (usage.promptTokens / 1000) * this.INPUT_COST_PER_1K;
    const outputCost = (usage.completionTokens / 1000) * this.OUTPUT_COST_PER_1K;
    return inputCost + outputCost;
  }

  canMakeRequest(): { allowed: boolean; reason?: string; remaining?: number } {
    this.checkAndResetDay();

    if (this.currentSpend.totalCost >= this.DAILY_LIMIT) {
      const resetTime = new Date();
      resetTime.setUTCHours(24, 0, 0, 0);
      const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60));

      return {
        allowed: false,
        reason: `Daily AI budget limit reached ($${this.DAILY_LIMIT}). Resets in ${hoursUntilReset} hours.`,
      };
    }

    const remaining = this.DAILY_LIMIT - this.currentSpend.totalCost;
    // Estimate ~2000 tokens per request average for remaining calculation
    const estimatedCostPerRequest = (1000 * this.INPUT_COST_PER_1K + 1000 * this.OUTPUT_COST_PER_1K);
    return {
      allowed: true,
      remaining: Math.floor(remaining / estimatedCostPerRequest),
    };
  }

  trackRequest(sessionId?: string, usage?: TokenUsage): void {
    this.checkAndResetDay();

    // Calculate cost based on actual usage or estimate
    let cost: number;
    let promptTokens = 0;
    let completionTokens = 0;

    if (usage) {
      cost = this.calculateCost(usage);
      promptTokens = usage.promptTokens;
      completionTokens = usage.completionTokens;
    } else {
      // Fallback estimate if no usage provided (~2000 tokens total, realistic split)
      promptTokens = 1500;
      completionTokens = 500;
      cost = this.calculateCost({ promptTokens, completionTokens, totalTokens: 2000 });
      console.warn('[SpendTracker] No token usage provided, using fallback estimate');
    }

    // Update daily spend
    this.currentSpend.totalCost += cost;
    this.currentSpend.requestCount += 1;
    this.currentSpend.totalPromptTokens += promptTokens;
    this.currentSpend.totalCompletionTokens += completionTokens;

    // Update all-time stats
    this.allTimeStats.totalCost += cost;
    this.allTimeStats.requestCount += 1;
    this.allTimeStats.totalPromptTokens += promptTokens;
    this.allTimeStats.totalCompletionTokens += completionTokens;

    // Track per-session if sessionId provided
    if (sessionId) {
      const sessionSpend = this.sessionSpends.get(sessionId) || {
        requestCount: 0,
        totalCost: 0,
        totalTokens: 0,
      };
      sessionSpend.requestCount += 1;
      sessionSpend.totalCost += cost;
      sessionSpend.totalTokens += promptTokens + completionTokens;
      this.sessionSpends.set(sessionId, sessionSpend);
    }

    console.log(`[SpendTracker] Request tracked. Tokens: ${promptTokens}+${completionTokens}=${promptTokens + completionTokens}, Cost: $${cost.toFixed(6)}, Today: $${this.currentSpend.totalCost.toFixed(4)} (${this.currentSpend.requestCount} requests)`);

    // Alert if approaching limit
    if (this.currentSpend.totalCost >= this.WARNING_THRESHOLD && this.currentSpend.totalCost - cost < this.WARNING_THRESHOLD) {
      console.warn(`[SpendTracker] WARNING: Approaching daily limit! $${this.currentSpend.totalCost.toFixed(2)}/$${this.DAILY_LIMIT}`);

      captureError(new Error('Daily AI spend approaching limit'), {
        totalCost: this.currentSpend.totalCost,
        requestCount: this.currentSpend.requestCount,
        limit: this.DAILY_LIMIT,
        percentage: (this.currentSpend.totalCost / this.DAILY_LIMIT * 100).toFixed(1),
      });
    }

    // Alert if limit reached
    if (this.currentSpend.totalCost >= this.DAILY_LIMIT && this.currentSpend.totalCost - cost < this.DAILY_LIMIT) {
      console.error(`[SpendTracker] LIMIT REACHED! $${this.currentSpend.totalCost.toFixed(2)}/$${this.DAILY_LIMIT}`);

      captureError(new Error('Daily AI spend limit reached'), {
        totalCost: this.currentSpend.totalCost,
        requestCount: this.currentSpend.requestCount,
        limit: this.DAILY_LIMIT,
      });
    }
  }

  getStats(): DailySpend & { limit: number; percentage: number } {
    this.checkAndResetDay();
    return {
      ...this.currentSpend,
      limit: this.DAILY_LIMIT,
      percentage: (this.currentSpend.totalCost / this.DAILY_LIMIT) * 100,
    };
  }

  getAdminStats(): {
    today: DailySpend;
    allTime: AllTimeStats;
    dailyLimit: number;
    remainingBudget: number;
    averageCostPerRequest: number;
  } {
    this.checkAndResetDay();
    return {
      today: { ...this.currentSpend },
      allTime: { ...this.allTimeStats },
      dailyLimit: this.DAILY_LIMIT,
      remainingBudget: Math.max(0, this.DAILY_LIMIT - this.currentSpend.totalCost),
      averageCostPerRequest: this.allTimeStats.requestCount > 0
        ? this.allTimeStats.totalCost / this.allTimeStats.requestCount
        : 0,
    };
  }

  getSessionStats(): Array<{ sessionId: string; requestCount: number; totalCost: number; totalTokens: number }> {
    return Array.from(this.sessionSpends.entries()).map(([sessionId, spend]) => ({
      sessionId,
      ...spend,
    }));
  }
}

// Singleton instance
export const spendTracker = new SpendTracker();
