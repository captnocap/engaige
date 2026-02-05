/**
 * STALK Pop-Safety Analyzer
 *
 * Static analysis that calculates pop-safety warnings before execution.
 * Analyzes confidence/evidence ratios, audience mismatches, timing risks.
 */

import * as AST from "./ast.js";

// ============================================================================
// Types
// ============================================================================

export interface PopWarning {
  severity: "info" | "warn" | "pop" | "panic";
  message: string;
  hint?: string;
  loc?: AST.SourceSpan;
  socialFallout?: SocialFalloutPrediction;
}

export interface SocialFalloutPrediction {
  screenshotRisk: number;      // 0-1
  relationshipDamage: number;  // 0-1
  viralPotential: number;      // 0-1
  cringeScore: number;         // 0-1
  affectedNPCs: string[];
}

export interface PopSafetyReport {
  score: number;               // 0-1, higher = safer
  warnings: PopWarning[];
  recommendations: string[];
  worstCase: string;           // Narrative description of worst outcome
}

export interface AnalysisContext {
  currentHour?: number;        // 0-23 for timing analysis
  playerReputation?: number;   // 0-100 for credibility factor
  disclaimerCount?: number;    // From program
}

// ============================================================================
// Analyzer
// ============================================================================

export class PopSafetyAnalyzer {
  private program: AST.Program;
  private context: AnalysisContext;
  private warnings: PopWarning[] = [];
  private predictions: Map<string, { confidence: number; evidence: string }> = new Map();
  private audiences: Set<string> = new Set();
  private capabilities: Set<string> = new Set();
  private disclaimers: string[] = [];

  constructor(program: AST.Program, context: AnalysisContext = {}) {
    this.program = program;
    this.context = context;
  }

  analyze(): PopSafetyReport {
    this.warnings = [];
    this.predictions.clear();
    this.audiences.clear();
    this.capabilities.clear();
    this.disclaimers = [];

    // First pass: collect metadata
    this.collectMetadata();

    // Second pass: analyze for pop risks
    this.analyzeBlocks();

    // Calculate overall score
    const score = this.calculateScore();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Generate worst case narrative
    const worstCase = this.generateWorstCase();

    return {
      score,
      warnings: this.warnings,
      recommendations,
      worstCase,
    };
  }

  // ============================================================================
  // Metadata Collection
  // ============================================================================

  private collectMetadata(): void {
    for (const block of this.program.blocks) {
      switch (block.type) {
        case "RequireBlock":
          for (const cap of block.capabilities) {
            this.capabilities.add(cap.capability);
          }
          break;

        case "DisclaimerBlock":
          this.disclaimers.push(...block.disclaimers);
          break;

        case "PredictBlock":
          for (const pred of block.predictions) {
            const confidence = this.extractConfidence(pred);
            const evidence = this.extractEvidence(pred);
            this.predictions.set(pred.identifier, { confidence, evidence });
          }
          break;

        case "ImpactBlock":
          this.collectAudiences(block);
          break;
      }
    }
  }

  private extractConfidence(pred: AST.Prediction): number {
    if (!pred.confidence) return 0.5;
    if (pred.confidence.type === "NumberLiteral") {
      return pred.confidence.value;
    }
    return 0.5; // Default for non-literal
  }

  private extractEvidence(pred: AST.Prediction): string {
    if (!pred.evidence) return "";
    if (pred.evidence.type === "StringLiteral") {
      return pred.evidence.value;
    }
    return ""; // Default for non-literal
  }

  private collectAudiences(block: AST.ImpactBlock): void {
    const findAudiences = (node: any): void => {
      if (!node || typeof node !== "object") return;

      if (node.type === "UIProperty" && node.name === "AUDIENCE") {
        if (node.value?.type === "Identifier") {
          this.audiences.add(node.value.name);
        }
      }

      // Recurse into child properties
      for (const key of Object.keys(node)) {
        if (Array.isArray(node[key])) {
          for (const item of node[key]) {
            findAudiences(item);
          }
        } else if (typeof node[key] === "object") {
          findAudiences(node[key]);
        }
      }
    };

    findAudiences(block);
  }

  // ============================================================================
  // Block Analysis
  // ============================================================================

  private analyzeBlocks(): void {
    for (const block of this.program.blocks) {
      switch (block.type) {
        case "PredictBlock":
          this.analyzePredictions(block);
          break;

        case "ImpactBlock":
          this.analyzeImpact(block);
          break;
      }
    }

    // Cross-block analysis
    this.analyzeAudienceMismatch();
    this.analyzeTimingRisks();
    this.analyzeCapabilityRisks();
    this.analyzeDisclaimerCoverage();
  }

  private analyzePredictions(block: AST.PredictBlock): void {
    for (const pred of block.predictions) {
      const confidence = this.extractConfidence(pred);
      const evidence = this.extractEvidence(pred);

      // High confidence, low evidence
      if (confidence > 0.8 && evidence.length < 20) {
        this.warnings.push({
          severity: "pop",
          message: `High confidence (${(confidence * 100).toFixed(0)}%) with weak evidence`,
          hint: "Consider lowering CONFIDENCE or providing more EVIDENCE",
          loc: pred.loc,
          socialFallout: {
            screenshotRisk: 0.8,
            relationshipDamage: 0.3,
            viralPotential: 0.6,
            cringeScore: 0.7,
            affectedNPCs: [],
          },
        });
      }

      // Very high confidence is always suspicious
      if (confidence > 0.95) {
        this.warnings.push({
          severity: "warn",
          message: "Extremely high confidence detected",
          hint: "Nothing is 95%+ certain. Consider CONFIDENCE = 0.8 max.",
          loc: pred.loc,
        });
      }

      // "Trust me" type evidence
      const weakEvidencePhrases = ["trust me", "obviously", "everyone knows", "i feel"];
      const evidenceLower = evidence.toLowerCase();
      if (weakEvidencePhrases.some(phrase => evidenceLower.includes(phrase))) {
        this.warnings.push({
          severity: "warn",
          message: "Weak evidence phrase detected",
          hint: `"${evidence}" is not evidence. Cite sources or data.`,
          loc: pred.loc,
        });
      }
    }
  }

  private analyzeImpact(block: AST.ImpactBlock): void {
    for (const stmt of block.statements) {
      this.analyzeImpactStatement(stmt);
    }
  }

  private analyzeImpactStatement(stmt: AST.ImpactStatement): void {
    if (stmt.type === "EventHandler") {
      for (const action of stmt.body) {
        this.analyzeAction(action);
      }
    } else {
      this.analyzeAction(stmt);
    }
  }

  private analyzeAction(action: AST.Action | AST.Statement): void {
    switch (action.type) {
      case "PostAction":
        this.analyzePost(action);
        break;

      case "DMAction":
        this.analyzeDM(action);
        break;

      case "PropertyAssignment":
        this.analyzePropertyAssignment(action);
        break;

      case "ForLoop":
        // Check for mass actions
        this.analyzeForLoop(action);
        break;

      case "IfStatement":
        for (const s of action.consequent) {
          this.analyzeAction(s);
        }
        if (action.alternate) {
          for (const s of action.alternate) {
            this.analyzeAction(s);
          }
        }
        break;
    }
  }

  private analyzePost(action: AST.PostAction): void {
    const props = this.extractProperties(action.properties);

    // Public post without disclaimer
    if (props.AUDIENCE === "PUBLIC" && this.disclaimers.length === 0) {
      this.warnings.push({
        severity: "warn",
        message: "Public post without disclaimer",
        hint: "Add a DISCLAIMER block to reduce blowback risk",
        loc: action.loc,
      });
    }

    // Check content for risky patterns
    if (props.content) {
      this.analyzeContentRisk(props.content, action.loc);
    }
  }

  private analyzeDM(action: AST.DMAction): void {
    // DMs to NPCs we might not know well
    this.warnings.push({
      severity: "info",
      message: "Direct message to NPC",
      hint: "Ensure relationship level supports this contact",
      loc: action.loc,
    });
  }

  private analyzePropertyAssignment(action: AST.PropertyAssignment): void {
    const path = this.extractPathString(action.path);

    // Relationship modifications
    if (path.includes("trust") || path.includes("affinity")) {
      this.warnings.push({
        severity: "warn",
        message: "Direct relationship modification",
        hint: "Relationship changes can have cascading effects",
        loc: action.loc,
      });
    }

    // Market manipulation
    if (path.includes("market") || path.includes("stalks")) {
      this.warnings.push({
        severity: "pop",
        message: "Market state modification detected",
        hint: "Market manipulation may attract attention",
        loc: action.loc,
        socialFallout: {
          screenshotRisk: 0.5,
          relationshipDamage: 0.1,
          viralPotential: 0.3,
          cringeScore: 0.2,
          affectedNPCs: [],
        },
      });
    }
  }

  private analyzeForLoop(action: AST.ForLoop): void {
    // Check if loop contains mass social actions
    let hasSocialAction = false;
    for (const stmt of action.body) {
      if (stmt.type === "PostAction" || stmt.type === "DMAction" || stmt.type === "ReactAction") {
        hasSocialAction = true;
        break;
      }
    }

    if (hasSocialAction) {
      this.warnings.push({
        severity: "pop",
        message: "Mass social action detected in FOR loop",
        hint: "Sending many messages/posts at once may appear spammy",
        loc: action.loc,
        socialFallout: {
          screenshotRisk: 0.6,
          relationshipDamage: 0.4,
          viralPotential: 0.7,
          cringeScore: 0.5,
          affectedNPCs: [],
        },
      });
    }
  }

  private analyzeContentRisk(content: string, loc?: AST.SourceSpan): void {
    const contentLower = content.toLowerCase();

    // All caps detection
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5 && content.length > 10) {
      this.warnings.push({
        severity: "warn",
        message: "Excessive caps lock detected",
        hint: "All caps reads as yelling. Consider normal case.",
        loc,
      });
    }

    // Exclamation overuse
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      this.warnings.push({
        severity: "info",
        message: "Multiple exclamation marks",
        hint: "Enthusiasm is great but may reduce credibility",
        loc,
      });
    }

    // Potentially controversial keywords
    const controversialKeywords = ["actually", "well actually", "unpopular opinion", "hot take"];
    if (controversialKeywords.some(kw => contentLower.includes(kw))) {
      this.warnings.push({
        severity: "warn",
        message: "Potentially confrontational phrasing",
        hint: "This phrasing may attract disagreement",
        loc,
      });
    }
  }

  // ============================================================================
  // Cross-Block Analysis
  // ============================================================================

  private analyzeAudienceMismatch(): void {
    // High confidence predictions shared publicly
    for (const [name, pred] of this.predictions) {
      if (pred.confidence > 0.7 && this.audiences.has("PUBLIC")) {
        this.warnings.push({
          severity: "pop",
          message: `High-confidence prediction "${name}" broadcast to PUBLIC`,
          hint: "If wrong, this will be screenshotted. Consider AUDIENCE = FRIENDS.",
          socialFallout: {
            screenshotRisk: 0.9,
            relationshipDamage: 0.2,
            viralPotential: 0.8,
            cringeScore: 0.6,
            affectedNPCs: [],
          },
        });
      }
    }
  }

  private analyzeTimingRisks(): void {
    if (this.context.currentHour === undefined) return;

    const hour = this.context.currentHour;
    const isCringeHours = hour >= 2 && hour <= 5;
    const isPeakHours = hour >= 18 && hour <= 22;

    if (isCringeHours && this.audiences.has("PUBLIC")) {
      this.warnings.push({
        severity: "pop",
        message: "Public post during cringe hours (2-5 AM)",
        hint: "Posts made at this hour often age poorly. Sleep on it.",
        socialFallout: {
          screenshotRisk: 0.7,
          relationshipDamage: 0.1,
          viralPotential: 0.3,
          cringeScore: 0.9,
          affectedNPCs: [],
        },
      });
    }

    if (isPeakHours && this.audiences.has("PUBLIC") && this.predictions.size > 0) {
      this.warnings.push({
        severity: "info",
        message: "Public predictions during peak hours",
        hint: "Maximum visibility. Maximum accountability.",
      });
    }
  }

  private analyzeCapabilityRisks(): void {
    // ALLOW_SYSTEMIC is always risky
    if (this.capabilities.has("ALLOW_SYSTEMIC")) {
      this.warnings.push({
        severity: "pop",
        message: "Systemic capability in use",
        hint: "This program can affect global game state. Proceed with caution.",
        socialFallout: {
          screenshotRisk: 0.4,
          relationshipDamage: 0.3,
          viralPotential: 0.5,
          cringeScore: 0.2,
          affectedNPCs: [],
        },
      });
    }

    // ALLOW_VIRALITY removes safety throttles
    if (this.capabilities.has("ALLOW_VIRALITY")) {
      this.warnings.push({
        severity: "warn",
        message: "Virality throttle disabled",
        hint: "Content can spread without limits. This amplifies both success and failure.",
      });
    }

    // Multiple high-tier capabilities
    const highTierCaps = ["ALLOW_RELATIONSHIP_WRITE", "ALLOW_MARKET_INFLUENCE", "ALLOW_SYSTEMIC"];
    const highTierCount = highTierCaps.filter(c => this.capabilities.has(c)).length;
    if (highTierCount >= 2) {
      this.warnings.push({
        severity: "warn",
        message: "Multiple high-tier capabilities",
        hint: "This program has significant power. Review all IMPACT statements carefully.",
      });
    }
  }

  private analyzeDisclaimerCoverage(): void {
    if (this.disclaimers.length === 0 && this.audiences.has("PUBLIC")) {
      this.warnings.push({
        severity: "warn",
        message: "No disclaimers for public content",
        hint: "Add DISCLAIMER block to reduce blowback",
      });
    }

    if (this.disclaimers.length > 5) {
      this.warnings.push({
        severity: "info",
        message: "Excessive disclaimers",
        hint: "Too many disclaimers may appear defensive or suspicious",
      });
    }

    // Check for weak disclaimers
    const weakDisclaimers = ["just kidding", "jk", "lol", "/s"];
    for (const disclaimer of this.disclaimers) {
      if (weakDisclaimers.some(w => disclaimer.toLowerCase().includes(w))) {
        this.warnings.push({
          severity: "info",
          message: `Weak disclaimer: "${disclaimer}"`,
          hint: "Informal disclaimers provide less protection than formal ones",
        });
      }
    }
  }

  // ============================================================================
  // Score Calculation
  // ============================================================================

  private calculateScore(): number {
    let score = 1.0;

    for (const warning of this.warnings) {
      switch (warning.severity) {
        case "panic":
          score -= 0.4;
          break;
        case "pop":
          score -= 0.2;
          break;
        case "warn":
          score -= 0.1;
          break;
        case "info":
          score -= 0.02;
          break;
      }
    }

    // Disclaimer bonus
    if (this.disclaimers.length > 0 && this.disclaimers.length <= 3) {
      score += 0.1;
    }

    // Reputation factor
    if (this.context.playerReputation !== undefined) {
      const repFactor = this.context.playerReputation / 100;
      score = score * 0.8 + repFactor * 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  // ============================================================================
  // Recommendations
  // ============================================================================

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Based on warnings
    const hasPop = this.warnings.some(w => w.severity === "pop" || w.severity === "panic");
    const hasConfidenceIssue = this.warnings.some(w =>
      w.message.toLowerCase().includes("confidence")
    );
    const hasAudienceIssue = this.warnings.some(w =>
      w.message.toLowerCase().includes("public") || w.message.toLowerCase().includes("audience")
    );

    if (hasPop) {
      recommendations.push("Review high-severity warnings before publishing");
    }

    if (hasConfidenceIssue) {
      recommendations.push("Lower CONFIDENCE values or provide stronger EVIDENCE");
    }

    if (hasAudienceIssue) {
      recommendations.push("Consider narrowing AUDIENCE to FRIENDS for sensitive content");
    }

    if (this.disclaimers.length === 0 && this.audiences.has("PUBLIC")) {
      recommendations.push("Add DISCLAIMER block for public content");
    }

    if (this.capabilities.has("ALLOW_VIRALITY")) {
      recommendations.push("Test with ALLOW_VIRALITY disabled first");
    }

    // Default if no specific issues
    if (recommendations.length === 0) {
      recommendations.push("Program appears relatively pop-safe");
    }

    return recommendations;
  }

  // ============================================================================
  // Worst Case Narrative
  // ============================================================================

  private generateWorstCase(): string {
    const panicWarnings = this.warnings.filter(w => w.severity === "panic");
    const popWarnings = this.warnings.filter(w => w.severity === "pop");

    if (panicWarnings.length > 0) {
      return this.generatePanicNarrative(panicWarnings);
    }

    if (popWarnings.length > 0) {
      return this.generatePopNarrative(popWarnings);
    }

    if (this.warnings.length > 0) {
      return "Minor embarrassment possible. Some people might roll their eyes.";
    }

    return "Low risk. Worst case: mild indifference.";
  }

  private generatePanicNarrative(warnings: PopWarning[]): string {
    const parts: string[] = [
      "KERNEL POPPED",
      "",
      "Reason:",
    ];

    for (const warning of warnings.slice(0, 3)) {
      parts.push(`  - ${warning.message}`);
    }

    parts.push("");
    parts.push("Consequences:");
    parts.push("  - Screenshots archived permanently");
    parts.push("  - Multiple NPCs questioning your judgment");
    parts.push("  - Reputation recovery may take weeks");
    parts.push("");
    parts.push("The internet never forgets.");

    return parts.join("\n");
  }

  private generatePopNarrative(warnings: PopWarning[]): string {
    const parts: string[] = [];

    if (warnings.some(w => w.message.includes("confidence"))) {
      parts.push("Your prediction could be proven wrong publicly.");
    }

    if (warnings.some(w => w.message.includes("PUBLIC"))) {
      parts.push("Content reaches unintended audience.");
    }

    if (warnings.some(w => w.message.includes("cringe"))) {
      parts.push("Late night posts rarely age well.");
    }

    if (warnings.some(w => w.message.includes("mass"))) {
      parts.push("Mass actions may appear spammy or desperate.");
    }

    parts.push("");
    parts.push("Expected fallout: Mild to moderate embarrassment.");
    parts.push("Recovery time: 1-3 days of normal posting.");

    return parts.join("\n");
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private extractProperties(props: AST.UIProperty[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const prop of props) {
      if (prop.value.type === "StringLiteral") {
        result[prop.name] = prop.value.value;
      } else if (prop.value.type === "Identifier") {
        result[prop.name] = prop.value.name;
      } else if (prop.value.type === "NumberLiteral") {
        result[prop.name] = prop.value.value;
      }
    }
    return result;
  }

  private extractPathString(path: AST.PathExpression): string {
    return path.segments
      .map(seg => {
        if (seg.type === "PropertyAccess") return seg.property;
        if (seg.type === "FunctionCall") return seg.name;
        return "[]";
      })
      .join(".");
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Analyze a STALK program for pop-safety
 */
export function analyzePopSafety(
  program: AST.Program,
  context?: AnalysisContext
): PopSafetyReport {
  const analyzer = new PopSafetyAnalyzer(program, context);
  return analyzer.analyze();
}

/**
 * Quick check if a program is safe to run
 */
export function isPopSafe(program: AST.Program, threshold = 0.6): boolean {
  const report = analyzePopSafety(program);
  return report.score >= threshold;
}

/**
 * Get formatted diagnostic output
 */
export function formatDiagnostics(report: PopSafetyReport): string {
  const lines: string[] = [];

  lines.push(`Pop-Safety Score: ${(report.score * 100).toFixed(0)}%`);
  lines.push("");

  if (report.warnings.length > 0) {
    lines.push("Warnings:");
    for (const warning of report.warnings) {
      const icon = warning.severity === "panic" ? "x" :
                   warning.severity === "pop" ? "!" :
                   warning.severity === "warn" ? "?" : "i";
      lines.push(`  [${icon}] ${warning.message}`);
      if (warning.hint) {
        lines.push(`      ${warning.hint}`);
      }
    }
    lines.push("");
  }

  if (report.recommendations.length > 0) {
    lines.push("Recommendations:");
    for (const rec of report.recommendations) {
      lines.push(`  - ${rec}`);
    }
    lines.push("");
  }

  lines.push("Worst Case:");
  lines.push(report.worstCase.split("\n").map(l => `  ${l}`).join("\n"));

  return lines.join("\n");
}
