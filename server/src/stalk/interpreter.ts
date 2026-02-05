/**
 * STALK Language Interpreter
 *
 * Executes STALK programs with tick-based evaluation,
 * budget enforcement, and game state integration.
 */

import * as AST from "./ast.js";
import type { CapabilityType } from "./ast.js";

// ============================================================================
// Types
// ============================================================================

export interface RuntimeValue {
  type: "number" | "string" | "boolean" | "null" | "unknown" | "collection" | "reference";
  value: any;
}

export interface GameStateProvider {
  // Player state
  getPlayerState(path: string[]): RuntimeValue;
  setPlayerState(path: string[], value: any): void;

  // NPC state
  getNPCState(npcName: string, path: string[]): RuntimeValue;
  setNPCState(npcName: string, path: string[], value: any): void;

  // Social state
  getFeedState(path: string[]): RuntimeValue;
  getPostsState(path: string[]): RuntimeValue;
  getOnlineNPCs(): string[];
  getNearbyNPCs(): string[];

  // Market state
  getMarketState(path: string[]): RuntimeValue;
  setMarketState(path: string[], value: any): void;

  // Time state
  getTimeState(path: string[]): RuntimeValue;

  // Random (budgeted)
  getRandom(min: number, max: number): number;
  getRandomChoice<T>(collection: T[]): T;
}

export interface UIBridge {
  // Window management
  createWindow(props: Record<string, any>): void;
  updateElement(id: string, props: Record<string, any>): void;
  flashElement(id: string): void;

  // Notifications
  notify(title: string, message: string, duration?: number): void;
  toast(message: string, position?: string): void;
  modal(title: string, message: string, buttons: string[]): Promise<string>;

  // Sounds
  playSound(sound: string): void;

  // Console
  print(message: string): void;
}

export interface SocialBridge {
  // Posts
  createPost(platform: string, content: string, audience: string, media?: string): Promise<string>;

  // DMs
  sendDM(recipient: string, content: string): Promise<void>;

  // Reactions
  reactToPost(postId: string, reaction: string): Promise<void>;
}

export interface InterpreterConfig {
  gameState: GameStateProvider;
  ui: UIBridge;
  social: SocialBridge;

  // Capabilities granted to this program
  capabilities: Set<CapabilityType>;

  // Budget limits
  tickBudget: number;      // Operations per tick
  randomBudget: number;    // Random calls per tick
}

export interface InterpreterState {
  variables: Map<string, RuntimeValue>;
  uiElements: Map<string, Record<string, any>>;
  predictions: Map<string, PredictionState>;
  operationCount: number;
  randomCount: number;
}

export interface PredictionState {
  value: RuntimeValue;
  confidence: number;
  evidence: string;
  timeframe?: string;
  madeAt: number;
}

export interface ExecutionResult {
  success: boolean;
  errors: RuntimeError[];
  warnings: RuntimeWarning[];
  sideEffects: SideEffect[];
}

export interface RuntimeError {
  message: string;
  loc?: AST.SourceSpan;
}

export interface RuntimeWarning {
  message: string;
  severity: "info" | "warn" | "pop";
  loc?: AST.SourceSpan;
}

export interface SideEffect {
  type: string;
  data: any;
  tier: 0 | 1 | 2 | 3 | 4;
}

// ============================================================================
// Interpreter
// ============================================================================

export class Interpreter {
  private program: AST.Program;
  private config: InterpreterConfig;
  private state: InterpreterState;
  private errors: RuntimeError[] = [];
  private warnings: RuntimeWarning[] = [];
  private sideEffects: SideEffect[] = [];
  private eventHandlers: Map<string, AST.EventHandler[]> = new Map();
  private conditionTriggers: AST.EventHandler[] = [];
  private tickHandlers: AST.EventHandler[] = [];

  constructor(program: AST.Program, config: InterpreterConfig) {
    this.program = program;
    this.config = config;
    this.state = {
      variables: new Map(),
      uiElements: new Map(),
      predictions: new Map(),
      operationCount: 0,
      randomCount: 0,
    };
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Initialize the program (run REQUIRE, CONFIG, OBSERVE, PREDICT, DECLARE)
   */
  async initialize(): Promise<ExecutionResult> {
    this.resetTickBudget();

    try {
      // Process blocks in order
      for (const block of this.program.blocks) {
        switch (block.type) {
          case "RequireBlock":
            this.processRequire(block);
            break;
          case "ConfigBlock":
            this.processConfig(block);
            break;
          case "ObserveBlock":
            this.processObserve(block);
            break;
          case "PredictBlock":
            this.processPredict(block);
            break;
          case "DeclareBlock":
            await this.processDeclare(block);
            break;
          case "ImpactBlock":
            this.registerImpactHandlers(block);
            break;
          case "DisclaimerBlock":
            // Store disclaimers for pop-safety calculations
            this.state.variables.set("__disclaimers__", {
              type: "collection",
              value: block.disclaimers,
            });
            break;
        }
      }
    } catch (e) {
      if (e instanceof BudgetExceeded) {
        this.errors.push({ message: e.message });
      } else {
        throw e;
      }
    }

    return this.getResult();
  }

  /**
   * Execute a single tick (for CONTINUOUS mode)
   */
  async tick(): Promise<ExecutionResult> {
    this.resetTickBudget();
    this.sideEffects = [];

    try {
      // Re-evaluate OBSERVE
      for (const block of this.program.blocks) {
        if (block.type === "ObserveBlock") {
          this.processObserve(block);
        }
      }

      // Check condition triggers
      for (const handler of this.conditionTriggers) {
        if (handler.trigger.type === "ConditionTrigger") {
          const result = this.evaluate(handler.trigger.condition);
          if (this.isTruthy(result)) {
            await this.executeHandler(handler);
          }
        }
      }

      // Execute tick handlers
      for (const handler of this.tickHandlers) {
        await this.executeHandler(handler);
      }
    } catch (e) {
      if (e instanceof BudgetExceeded) {
        this.errors.push({ message: e.message });
      } else {
        throw e;
      }
    }

    return this.getResult();
  }

  /**
   * Handle a UI event
   */
  async handleEvent(eventType: string, elementId?: string): Promise<ExecutionResult> {
    this.resetTickBudget();
    this.sideEffects = [];

    const key = elementId ? `${eventType}:${elementId}` : eventType;
    const handlers = this.eventHandlers.get(key) || [];

    try {
      for (const handler of handlers) {
        await this.executeHandler(handler);
      }
    } catch (e) {
      if (e instanceof BudgetExceeded) {
        this.errors.push({ message: e.message });
      } else {
        throw e;
      }
    }

    return this.getResult();
  }

  /**
   * Get current variable value
   */
  getVariable(name: string): RuntimeValue | undefined {
    return this.state.variables.get(name);
  }

  /**
   * Get all predictions
   */
  getPredictions(): Map<string, PredictionState> {
    return this.state.predictions;
  }

  // ============================================================================
  // Block Processing
  // ============================================================================

  private processRequire(block: AST.RequireBlock): void {
    for (const cap of block.capabilities) {
      if (!this.config.capabilities.has(cap.capability)) {
        this.errors.push({
          message: `Capability '${cap.capability}' is required but not granted`,
          loc: cap.loc,
        });
      }
    }
  }

  private processConfig(block: AST.ConfigBlock): void {
    for (const assignment of block.assignments) {
      const value = this.evaluate(assignment.value);
      this.state.variables.set(`__config_${assignment.identifier}__`, value);
    }
  }

  private processObserve(block: AST.ObserveBlock): void {
    for (const stmt of block.statements) {
      if (stmt.type === "Assignment") {
        const value = this.evaluate(stmt.value);
        this.state.variables.set(stmt.identifier, value);
      }
    }
  }

  private processPredict(block: AST.PredictBlock): void {
    for (const prediction of block.predictions) {
      const value = this.evaluate(prediction.value);
      const confidence = prediction.confidence
        ? this.toNumber(this.evaluate(prediction.confidence))
        : 0.5;
      const evidence = prediction.evidence
        ? this.toString(this.evaluate(prediction.evidence))
        : "";
      const timeframe = prediction.timeframe
        ? this.toString(this.evaluate(prediction.timeframe))
        : undefined;

      this.state.predictions.set(prediction.identifier, {
        value,
        confidence,
        evidence,
        timeframe,
        madeAt: Date.now(),
      });

      // Also set as variable for use in expressions
      this.state.variables.set(prediction.identifier, value);

      // Pop-safety warning for high confidence + low evidence
      if (confidence > 0.8 && evidence.length < 20) {
        this.warnings.push({
          message: `High confidence (${confidence}) with weak evidence. Screenshot risk elevated.`,
          severity: "pop",
          loc: prediction.loc,
        });
      }
    }
  }

  private async processDeclare(block: AST.DeclareBlock): Promise<void> {
    for (const element of block.elements) {
      const props = this.evaluateProperties(element.properties);

      if (element.type === "WindowElement") {
        this.config.ui.createWindow(props);
      } else {
        const id = props.id || `element_${this.state.uiElements.size}`;
        this.state.uiElements.set(id, { type: element.type, ...props });
      }
    }
  }

  private registerImpactHandlers(block: AST.ImpactBlock): void {
    for (const stmt of block.statements) {
      if (stmt.type === "EventHandler") {
        const trigger = stmt.trigger;

        switch (trigger.type) {
          case "TickTrigger":
            this.tickHandlers.push(stmt);
            break;
          case "ClickTrigger":
            this.addHandler(`click:${trigger.elementId}`, stmt);
            break;
          case "ChangeTrigger":
            this.addHandler(`change:${trigger.elementId}`, stmt);
            break;
          case "SubmitTrigger":
            this.addHandler("submit", stmt);
            break;
          case "ConditionTrigger":
            this.conditionTriggers.push(stmt);
            break;
        }
      }
    }
  }

  private addHandler(key: string, handler: AST.EventHandler): void {
    const existing = this.eventHandlers.get(key) || [];
    existing.push(handler);
    this.eventHandlers.set(key, existing);
  }

  // ============================================================================
  // Handler Execution
  // ============================================================================

  private async executeHandler(handler: AST.EventHandler): Promise<void> {
    for (const stmt of handler.body) {
      await this.executeStatement(stmt);
    }
  }

  private async executeStatement(stmt: AST.Action | AST.Statement): Promise<void> {
    this.checkBudget();

    switch (stmt.type) {
      case "Assignment":
        const value = this.evaluate(stmt.value);
        this.state.variables.set(stmt.identifier, value);
        break;

      case "PropertyAssignment":
        await this.executePropertyAssignment(stmt);
        break;

      case "IfStatement":
        await this.executeIf(stmt);
        break;

      case "ForLoop":
        await this.executeFor(stmt);
        break;

      case "PrintAction":
        this.executePrint(stmt);
        break;

      case "FlashAction":
        this.executeFlash(stmt);
        break;

      case "SoundAction":
        this.executeSound(stmt);
        break;

      case "NotifyAction":
        this.executeNotify(stmt);
        break;

      case "ToastAction":
        this.executeToast(stmt);
        break;

      case "PostAction":
        await this.executePost(stmt);
        break;

      case "DMAction":
        await this.executeDM(stmt);
        break;

      case "ReactAction":
        await this.executeReact(stmt);
        break;
    }
  }

  private async executePropertyAssignment(stmt: AST.PropertyAssignment): Promise<void> {
    const path = this.resolvePath(stmt.path);
    const newValue = this.evaluate(stmt.value);

    if (path.length === 0) return;

    const first = path[0];

    // Self reference (UI element update)
    if (first === "self" && path.length >= 2) {
      const elementId = path[1];
      const propPath = path.slice(2);
      const element = this.state.uiElements.get(elementId);

      if (element && propPath.length > 0) {
        let current = newValue.value;
        if (stmt.operator === "+=") {
          const existing = this.getNestedProperty(element, propPath);
          current = this.add(existing, newValue).value;
        } else if (stmt.operator === "-=") {
          const existing = this.getNestedProperty(element, propPath);
          current = this.subtract(existing, newValue).value;
        }

        this.setNestedProperty(element, propPath, current);
        this.config.ui.updateElement(elementId, element);

        this.sideEffects.push({
          type: "ui_update",
          data: { elementId, property: propPath.join("."), value: current },
          tier: 0,
        });
      }
      return;
    }

    // Player state
    if (first === "player") {
      this.requireCapabilityForPath(path);
      let finalValue = newValue.value;
      if (stmt.operator !== "=") {
        const existing = this.config.gameState.getPlayerState(path.slice(1));
        finalValue = stmt.operator === "+="
          ? this.add(existing, newValue).value
          : this.subtract(existing, newValue).value;
      }
      this.config.gameState.setPlayerState(path.slice(1), finalValue);

      this.sideEffects.push({
        type: "player_state_update",
        data: { path: path.slice(1), value: finalValue },
        tier: 1,
      });
      return;
    }

    // NPC state (via npc function call in path)
    if (first === "npc" && path.length >= 2) {
      this.requireCapability("ALLOW_RELATIONSHIP_WRITE");
      const npcName = path[1]; // This would be extracted from npc("name") call
      const statePath = path.slice(2);
      let finalValue = newValue.value;
      if (stmt.operator !== "=") {
        const existing = this.config.gameState.getNPCState(npcName, statePath);
        finalValue = stmt.operator === "+="
          ? this.add(existing, newValue).value
          : this.subtract(existing, newValue).value;
      }
      this.config.gameState.setNPCState(npcName, statePath, finalValue);

      this.sideEffects.push({
        type: "npc_state_update",
        data: { npc: npcName, path: statePath, value: finalValue },
        tier: 3,
      });
      return;
    }

    // Market state
    if (first === "market") {
      this.requireCapability("ALLOW_MARKET_INFLUENCE");
      let finalValue = newValue.value;
      if (stmt.operator !== "=") {
        const existing = this.config.gameState.getMarketState(path.slice(1));
        finalValue = stmt.operator === "+="
          ? this.add(existing, newValue).value
          : this.subtract(existing, newValue).value;
      }
      this.config.gameState.setMarketState(path.slice(1), finalValue);

      this.sideEffects.push({
        type: "market_state_update",
        data: { path: path.slice(1), value: finalValue },
        tier: 4,
      });
      return;
    }

    // Local variable
    const varName = path[0];
    let finalValue = newValue;
    if (stmt.operator !== "=") {
      const existing = this.state.variables.get(varName) || { type: "number", value: 0 };
      finalValue = stmt.operator === "+="
        ? this.add(existing, newValue)
        : this.subtract(existing, newValue);
    }
    this.state.variables.set(varName, finalValue);
  }

  private async executeIf(stmt: AST.IfStatement): Promise<void> {
    const condition = this.evaluate(stmt.condition);

    if (this.isTruthy(condition)) {
      for (const s of stmt.consequent) {
        await this.executeStatement(s);
      }
    } else if (stmt.alternate) {
      for (const s of stmt.alternate) {
        await this.executeStatement(s);
      }
    }
  }

  private async executeFor(stmt: AST.ForLoop): Promise<void> {
    const collection = this.evaluate(stmt.collection);

    if (collection.type !== "collection" || !Array.isArray(collection.value)) {
      this.warnings.push({
        message: `FOR loop expected collection, got ${collection.type}`,
        severity: "warn",
        loc: stmt.loc,
      });
      return;
    }

    for (const item of collection.value) {
      this.state.variables.set(stmt.variable, { type: "reference", value: item });

      for (const s of stmt.body) {
        await this.executeStatement(s);
        this.checkBudget();
      }
    }

    this.state.variables.delete(stmt.variable);
  }

  // ============================================================================
  // Action Execution
  // ============================================================================

  private executePrint(stmt: AST.PrintAction): void {
    const message = this.toString(this.evaluate(stmt.message));
    this.config.ui.print(message);
    this.sideEffects.push({ type: "print", data: { message }, tier: 0 });
  }

  private executeFlash(stmt: AST.FlashAction): void {
    const elementId = this.toString(this.evaluate(stmt.elementId));
    this.config.ui.flashElement(elementId);
    this.sideEffects.push({ type: "flash", data: { elementId }, tier: 0 });
  }

  private executeSound(stmt: AST.SoundAction): void {
    const sound = this.toString(this.evaluate(stmt.sound));
    this.config.ui.playSound(sound);
    this.sideEffects.push({ type: "sound", data: { sound }, tier: 0 });
  }

  private executeNotify(stmt: AST.NotifyAction): void {
    const props = this.evaluateProperties(stmt.properties);
    this.config.ui.notify(
      props.title || "Notification",
      props.message || "",
      props.duration
    );
    this.sideEffects.push({ type: "notify", data: props, tier: 0 });
  }

  private executeToast(stmt: AST.ToastAction): void {
    const props = this.evaluateProperties(stmt.properties);
    this.config.ui.toast(props.message || "", props.position);
    this.sideEffects.push({ type: "toast", data: props, tier: 0 });
  }

  private async executePost(stmt: AST.PostAction): Promise<void> {
    this.requireCapability("ALLOW_BROADCAST");

    const platform = this.toString(this.evaluate(stmt.platform));
    const props = this.evaluateProperties(stmt.properties);

    const postId = await this.config.social.createPost(
      platform,
      props.content || "",
      props.AUDIENCE || "FRIENDS",
      props.media
    );

    this.sideEffects.push({
      type: "post",
      data: { platform, postId, ...props },
      tier: 2,
    });
  }

  private async executeDM(stmt: AST.DMAction): Promise<void> {
    this.requireCapability("ALLOW_NPC_CONTACT");

    const recipient = this.toString(this.evaluate(stmt.recipient));
    const props = this.evaluateProperties(stmt.properties);

    await this.config.social.sendDM(recipient, props.content || "");

    this.sideEffects.push({
      type: "dm",
      data: { recipient, ...props },
      tier: 2,
    });
  }

  private async executeReact(stmt: AST.ReactAction): Promise<void> {
    const target = this.toString(this.evaluate(stmt.target));
    const reaction = this.toString(this.evaluate(stmt.reaction));

    await this.config.social.reactToPost(target, reaction);

    this.sideEffects.push({
      type: "react",
      data: { target, reaction },
      tier: 2,
    });
  }

  // ============================================================================
  // Expression Evaluation
  // ============================================================================

  private evaluate(expr: AST.Expression): RuntimeValue {
    this.checkBudget();

    switch (expr.type) {
      case "NumberLiteral":
        return { type: "number", value: expr.value };

      case "StringLiteral":
        return { type: "string", value: expr.value };

      case "BooleanLiteral":
        return { type: "boolean", value: expr.value };

      case "NullLiteral":
        return { type: "null", value: null };

      case "UnknownLiteral":
        return { type: "unknown", value: undefined };

      case "Identifier":
        return this.resolveIdentifier(expr.name);

      case "PathExpression":
        return this.evaluatePath(expr);

      case "BinaryExpression":
        return this.evaluateBinary(expr);

      case "UnaryExpression":
        return this.evaluateUnary(expr);

      case "CallExpression":
        return this.evaluateCall(expr);

      case "ConditionalExpression":
        return this.evaluateConditional(expr);

      case "TupleExpression":
        return {
          type: "collection",
          value: expr.elements.map(e => this.evaluate(e).value),
        };

      case "CollectionExpression":
        return {
          type: "collection",
          value: expr.elements.map(e => this.evaluate(e).value),
        };

      case "InterpolatedString":
        return this.evaluateInterpolatedString(expr);

      default:
        return { type: "null", value: null };
    }
  }

  private resolveIdentifier(name: string): RuntimeValue {
    // Check local variables first
    const local = this.state.variables.get(name);
    if (local) return local;

    // Check for special identifiers
    switch (name) {
      case "SELF":
      case "FRIENDS":
      case "FOLLOWERS":
      case "PUBLIC":
        return { type: "string", value: name };

      case "HEADING":
      case "SUBHEADING":
      case "CAPTION":
      case "RESULT":
      case "ERROR":
      case "NORMAL":
      case "PRIMARY":
      case "SECONDARY":
      case "DANGER":
      case "CENTER":
      case "BOTTOM":
      case "LINE":
      case "BAR":
      case "PIE":
        return { type: "string", value: name };

      case "ONCE":
      case "ON_CONDITION":
      case "CONTINUOUS":
        return { type: "string", value: name };

      default:
        return { type: "null", value: null };
    }
  }

  private evaluatePath(expr: AST.PathExpression): RuntimeValue {
    const path = this.resolvePath(expr);

    if (path.length === 0) {
      return { type: "null", value: null };
    }

    const first = path[0];

    // Player state
    if (first === "player") {
      return this.config.gameState.getPlayerState(path.slice(1));
    }

    // Self (UI element)
    if (first === "self" && path.length >= 2) {
      const element = this.state.uiElements.get(path[1]);
      if (element) {
        return { type: "reference", value: this.getNestedProperty(element, path.slice(2)) };
      }
      return { type: "null", value: null };
    }

    // Time
    if (first === "time") {
      return this.config.gameState.getTimeState(path.slice(1));
    }

    // Market
    if (first === "market") {
      return this.config.gameState.getMarketState(path.slice(1));
    }

    // Feed
    if (first === "feed") {
      return this.config.gameState.getFeedState(path.slice(1));
    }

    // Posts
    if (first === "posts") {
      return this.config.gameState.getPostsState(path.slice(1));
    }

    // Online NPCs
    if (first === "online" && path[1] === "npcs") {
      return { type: "collection", value: this.config.gameState.getOnlineNPCs() };
    }

    // Nearby NPCs
    if (first === "nearby" && path[1] === "npcs") {
      return { type: "collection", value: this.config.gameState.getNearbyNPCs() };
    }

    // Check local variables
    const local = this.state.variables.get(first);
    if (local && path.length === 1) {
      return local;
    }

    return { type: "null", value: null };
  }

  private resolvePath(expr: AST.PathExpression): string[] {
    const path: string[] = [];

    for (const segment of expr.segments) {
      switch (segment.type) {
        case "PropertyAccess":
          path.push(segment.property);
          break;

        case "IndexAccess":
          const index = this.evaluate(segment.index);
          path.push(this.toString(index));
          break;

        case "FunctionCall":
          // For npc("name"), push "npc" and the name
          path.push(segment.name);
          if (segment.arguments.length > 0) {
            const arg = this.evaluate(segment.arguments[0]);
            path.push(this.toString(arg));
          }
          break;
      }
    }

    return path;
  }

  private evaluateBinary(expr: AST.BinaryExpression): RuntimeValue {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      case "+":
        return this.add(left, right);
      case "-":
        return this.subtract(left, right);
      case "*":
        return { type: "number", value: this.toNumber(left) * this.toNumber(right) };
      case "/":
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          this.warnings.push({ message: "Division by zero", severity: "warn", loc: expr.loc });
          return { type: "number", value: 0 };
        }
        return { type: "number", value: this.toNumber(left) / divisor };
      case "%":
        return { type: "number", value: this.toNumber(left) % this.toNumber(right) };
      case "==":
        return { type: "boolean", value: this.equals(left, right) };
      case "!=":
        return { type: "boolean", value: !this.equals(left, right) };
      case "~=":
        return { type: "boolean", value: this.vibesEqual(left, right) };
      case ">":
        return { type: "boolean", value: this.toNumber(left) > this.toNumber(right) };
      case "<":
        return { type: "boolean", value: this.toNumber(left) < this.toNumber(right) };
      case ">=":
        return { type: "boolean", value: this.toNumber(left) >= this.toNumber(right) };
      case "<=":
        return { type: "boolean", value: this.toNumber(left) <= this.toNumber(right) };
      case "AND":
        return { type: "boolean", value: this.isTruthy(left) && this.isTruthy(right) };
      case "OR":
        return { type: "boolean", value: this.isTruthy(left) || this.isTruthy(right) };
      case "UNLESS":
        return { type: "boolean", value: this.isTruthy(left) && !this.isTruthy(right) };
      default:
        return { type: "null", value: null };
    }
  }

  private evaluateUnary(expr: AST.UnaryExpression): RuntimeValue {
    const argument = this.evaluate(expr.argument);

    switch (expr.operator) {
      case "NOT":
        return { type: "boolean", value: !this.isTruthy(argument) };
      case "-":
        return { type: "number", value: -this.toNumber(argument) };
      default:
        return { type: "null", value: null };
    }
  }

  private evaluateCall(expr: AST.CallExpression): RuntimeValue {
    // Handle built-in functions
    if (expr.callee.type === "Identifier") {
      const name = expr.callee.name.toLowerCase();
      const args = expr.arguments.map(a => this.evaluate(a));

      switch (name) {
        case "abs":
          return { type: "number", value: Math.abs(this.toNumber(args[0])) };
        case "round":
          const decimals = args[1] ? this.toNumber(args[1]) : 0;
          const factor = Math.pow(10, decimals);
          return { type: "number", value: Math.round(this.toNumber(args[0]) * factor) / factor };
        case "floor":
          return { type: "number", value: Math.floor(this.toNumber(args[0])) };
        case "ceil":
          return { type: "number", value: Math.ceil(this.toNumber(args[0])) };
        case "min":
          return { type: "number", value: Math.min(this.toNumber(args[0]), this.toNumber(args[1])) };
        case "max":
          return { type: "number", value: Math.max(this.toNumber(args[0]), this.toNumber(args[1])) };
        case "clamp":
          const val = this.toNumber(args[0]);
          const min = this.toNumber(args[1]);
          const max = this.toNumber(args[2]);
          return { type: "number", value: Math.max(min, Math.min(max, val)) };

        case "npc":
          // Return a reference that can be used with property access
          const npcName = this.toString(args[0]);
          return {
            type: "reference",
            value: { __npc__: npcName },
          };

        case "group":
          const groupName = this.toString(args[0]);
          return {
            type: "reference",
            value: { __group__: groupName },
          };

        default:
          this.warnings.push({
            message: `Unknown function '${name}'`,
            severity: "warn",
          });
          return { type: "null", value: null };
      }
    }

    // Handle method calls on paths
    if (expr.callee.type === "PathExpression") {
      return this.evaluateMethodCall(expr.callee, expr.arguments);
    }

    return { type: "null", value: null };
  }

  private evaluateMethodCall(path: AST.PathExpression, args: AST.Expression[]): RuntimeValue {
    const segments = path.segments;
    if (segments.length === 0) return { type: "null", value: null };

    const lastSegment = segments[segments.length - 1];
    if (lastSegment.type !== "PropertyAccess") return { type: "null", value: null };

    const methodName = lastSegment.property.toLowerCase();
    const evalArgs = args.map(a => this.evaluate(a));

    // Get the object we're calling the method on
    const objectPath: AST.PathExpression = {
      type: "PathExpression",
      segments: segments.slice(0, -1),
    };
    const object = this.evaluatePath(objectPath);

    // Collection methods
    if (object.type === "collection" && Array.isArray(object.value)) {
      switch (methodName) {
        case "count":
          return { type: "number", value: object.value.length };
        case "first":
          return object.value.length > 0
            ? { type: "reference", value: object.value[0] }
            : { type: "null", value: null };
        case "last":
          return object.value.length > 0
            ? { type: "reference", value: object.value[object.value.length - 1] }
            : { type: "null", value: null };
        case "contains":
          return { type: "boolean", value: object.value.includes(evalArgs[0]?.value) };
        case "limit":
          const n = this.toNumber(evalArgs[0]);
          return { type: "collection", value: object.value.slice(0, n) };
        case "skip":
          const skip = this.toNumber(evalArgs[0]);
          return { type: "collection", value: object.value.slice(skip) };
        case "reverse":
          return { type: "collection", value: [...object.value].reverse() };
      }
    }

    // String methods
    if (object.type === "string") {
      switch (methodName) {
        case "upper":
          return { type: "string", value: object.value.toUpperCase() };
        case "lower":
          return { type: "string", value: object.value.toLowerCase() };
        case "trim":
          return { type: "string", value: object.value.trim() };
        case "contains":
          return { type: "boolean", value: object.value.includes(this.toString(evalArgs[0])) };
        case "starts_with":
          return { type: "boolean", value: object.value.startsWith(this.toString(evalArgs[0])) };
        case "ends_with":
          return { type: "boolean", value: object.value.endsWith(this.toString(evalArgs[0])) };
        case "length":
          return { type: "number", value: object.value.length };
      }
    }

    return { type: "null", value: null };
  }

  private evaluateConditional(expr: AST.ConditionalExpression): RuntimeValue {
    const test = this.evaluate(expr.test);

    if (this.isTruthy(test)) {
      return this.evaluate(expr.consequent);
    } else if (expr.alternate) {
      return this.evaluate(expr.alternate);
    }

    return { type: "null", value: null };
  }

  private evaluateInterpolatedString(expr: AST.InterpolatedString): RuntimeValue {
    let result = "";

    for (const part of expr.parts) {
      if (typeof part === "string") {
        result += part;
      } else {
        result += this.toString(this.evaluate(part as AST.Expression));
      }
    }

    return { type: "string", value: result };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private evaluateProperties(props: AST.UIProperty[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const prop of props) {
      result[prop.name] = this.evaluate(prop.value).value;
    }
    return result;
  }

  private toNumber(value: RuntimeValue): number {
    switch (value.type) {
      case "number":
        return value.value;
      case "string":
        const parsed = parseFloat(value.value);
        if (isNaN(parsed)) {
          this.warnings.push({ message: `Cannot convert '${value.value}' to number`, severity: "warn" });
          return 0;
        }
        return parsed;
      case "boolean":
        return value.value ? 1 : 0;
      case "null":
      case "unknown":
        return 0;
      default:
        return 0;
    }
  }

  private toString(value: RuntimeValue): string {
    switch (value.type) {
      case "string":
        return value.value;
      case "number":
        return String(value.value);
      case "boolean":
        return value.value ? "true" : "false";
      case "null":
        return "null";
      case "unknown":
        return "unknown";
      case "collection":
        return JSON.stringify(value.value);
      case "reference":
        if (value.value?.__npc__) return value.value.__npc__;
        if (value.value?.__group__) return value.value.__group__;
        return String(value.value);
      default:
        return "";
    }
  }

  private isTruthy(value: RuntimeValue): boolean {
    switch (value.type) {
      case "boolean":
        return value.value;
      case "null":
      case "unknown":
        return false;
      case "number":
        return value.value !== 0;
      case "string":
        return value.value.length > 0;
      case "collection":
        return value.value.length > 0;
      default:
        return true;
    }
  }

  private equals(a: RuntimeValue, b: RuntimeValue): boolean {
    if (a.type !== b.type) {
      // Try coercion
      if (a.type === "number" || b.type === "number") {
        return this.toNumber(a) === this.toNumber(b);
      }
      return this.toString(a) === this.toString(b);
    }
    return a.value === b.value;
  }

  private vibesEqual(a: RuntimeValue, b: RuntimeValue): boolean {
    // Fuzzy equality
    if (a.type === "number" && b.type === "number") {
      const diff = Math.abs(a.value - b.value);
      const avg = (Math.abs(a.value) + Math.abs(b.value)) / 2;
      return avg === 0 ? diff === 0 : diff / avg <= 0.1;
    }

    if (a.type === "string" && b.type === "string") {
      return a.value.toLowerCase() === b.value.toLowerCase();
    }

    return this.equals(a, b);
  }

  private add(a: RuntimeValue, b: RuntimeValue): RuntimeValue {
    if (a.type === "string" || b.type === "string") {
      return { type: "string", value: this.toString(a) + this.toString(b) };
    }
    return { type: "number", value: this.toNumber(a) + this.toNumber(b) };
  }

  private subtract(a: RuntimeValue, b: RuntimeValue): RuntimeValue {
    return { type: "number", value: this.toNumber(a) - this.toNumber(b) };
  }

  private getNestedProperty(obj: any, path: string[]): any {
    let current = obj;
    for (const key of path) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    return current;
  }

  private setNestedProperty(obj: any, path: string[], value: any): void {
    if (path.length === 0) return;

    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  // ============================================================================
  // Capability Checking
  // ============================================================================

  private requireCapability(cap: CapabilityType): void {
    if (!this.config.capabilities.has(cap)) {
      throw new CapabilityDenied(cap);
    }
  }

  private requireCapabilityForPath(path: string[]): void {
    const first = path[0];

    // Player mood/anxiety is always allowed (Tier 1)
    if (first === "player" && (path[1] === "mood" || path[1] === "anxiety")) {
      return;
    }

    // Player trust/reputation requires ALLOW_RELATIONSHIP_WRITE
    if (first === "player" && (path[1] === "trust" || path[1] === "reputation")) {
      this.requireCapability("ALLOW_RELATIONSHIP_WRITE");
    }
  }

  // ============================================================================
  // Budget Management
  // ============================================================================

  private resetTickBudget(): void {
    this.state.operationCount = 0;
    this.state.randomCount = 0;
  }

  private checkBudget(): void {
    this.state.operationCount++;
    if (this.state.operationCount > this.config.tickBudget) {
      throw new BudgetExceeded(
        `Operation budget exceeded (${this.state.operationCount}/${this.config.tickBudget}). ` +
        "Your program is doing too much. Simplify OBSERVE conditions or reduce tick_rate."
      );
    }
  }

  // ============================================================================
  // Result Building
  // ============================================================================

  private getResult(): ExecutionResult {
    return {
      success: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      sideEffects: [...this.sideEffects],
    };
  }
}

// ============================================================================
// Exceptions
// ============================================================================

class BudgetExceeded extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetExceeded";
  }
}

class CapabilityDenied extends Error {
  constructor(public capability: CapabilityType) {
    super(`Capability '${capability}' is required but not granted`);
    this.name = "CapabilityDenied";
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create and initialize a STALK program interpreter
 */
export async function createInterpreter(
  program: AST.Program,
  config: InterpreterConfig
): Promise<{ interpreter: Interpreter; result: ExecutionResult }> {
  const interpreter = new Interpreter(program, config);
  const result = await interpreter.initialize();
  return { interpreter, result };
}
