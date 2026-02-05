/**
 * STALK Language Parser
 *
 * Recursive descent parser that converts tokens into an AST.
 * Enforces block ordering and syntax rules from the spec.
 */

import { Token, TokenType, isCapabilityKeyword, isUIElementKeyword, isActionKeyword, isTriggerKeyword } from "./tokens.js";
import * as AST from "./ast.js";

export interface ParseError {
  message: string;
  line: number;
  column: number;
  hint?: string;
}

export interface ParseResult {
  program: AST.Program | null;
  errors: ParseError[];
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    // Filter out newlines for easier parsing (we don't need them)
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE);
  }

  parse(): ParseResult {
    try {
      const program = this.program();
      return { program, errors: this.errors };
    } catch (e) {
      if (e instanceof ParseAbort) {
        return { program: null, errors: this.errors };
      }
      throw e;
    }
  }

  // ============================================================================
  // Program
  // ============================================================================

  private program(): AST.Program {
    this.consume(TokenType.STALK, "Expected 'STALK' at start of program");

    const nameToken = this.consume(TokenType.STRING, "Expected program name string after 'STALK'");
    const name = nameToken.value;

    this.consume(TokenType.LBRACE, "Expected '{' after program name");

    const blocks: AST.Block[] = [];
    let lastBlockOrder = -1;

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const block = this.block();
      if (block) {
        // Enforce block ordering (DISCLAIMER can appear anywhere)
        const blockOrder = this.getBlockOrder(block);
        if (blockOrder !== -1 && blockOrder < lastBlockOrder) {
          this.addError(
            `Block '${block.type.replace("Block", "")}' is out of order. Expected order: REQUIRE, CONFIG, OBSERVE, PREDICT, DECLARE, IMPACT`,
            this.previous(),
            "Blocks must appear in the specified order (DISCLAIMER can appear anywhere)"
          );
        }
        if (blockOrder !== -1) {
          lastBlockOrder = blockOrder;
        }
        blocks.push(block);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' at end of program");

    return {
      type: "Program",
      name,
      blocks,
      loc: this.makeSpan(0, this.current - 1),
    };
  }

  private getBlockOrder(block: AST.Block): number {
    switch (block.type) {
      case "RequireBlock": return 0;
      case "ConfigBlock": return 1;
      case "ObserveBlock": return 2;
      case "PredictBlock": return 3;
      case "DeclareBlock": return 4;
      case "ImpactBlock": return 5;
      case "DisclaimerBlock": return -1; // Can appear anywhere
      default: return 100;
    }
  }

  // ============================================================================
  // Blocks
  // ============================================================================

  private block(): AST.Block | null {
    if (this.check(TokenType.REQUIRE)) return this.requireBlock();
    if (this.check(TokenType.CONFIG)) return this.configBlock();
    if (this.check(TokenType.OBSERVE)) return this.observeBlock();
    if (this.check(TokenType.PREDICT)) return this.predictBlock();
    if (this.check(TokenType.DECLARE)) return this.declareBlock();
    if (this.check(TokenType.IMPACT)) return this.impactBlock();
    if (this.check(TokenType.DISCLAIMER)) return this.disclaimerBlock();

    this.addError(
      `Unexpected token '${this.peek().value}'. Expected a block keyword.`,
      this.peek()
    );
    this.advance(); // Skip the bad token
    return null;
  }

  private requireBlock(): AST.RequireBlock {
    const start = this.current;
    this.advance(); // consume REQUIRE
    this.consume(TokenType.LBRACE, "Expected '{' after REQUIRE");

    const capabilities: AST.Capability[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const capToken = this.peek();
      if (isCapabilityKeyword(capToken.type)) {
        this.advance();
        capabilities.push({
          type: "Capability",
          capability: capToken.value as AST.CapabilityType,
          loc: this.makeSpan(this.current - 1, this.current - 1),
        });
      } else {
        this.addError(
          `Expected capability keyword, got '${capToken.value}'`,
          capToken,
          "Valid capabilities: ALLOW_BROADCAST, ALLOW_RELATIONSHIP_WRITE, ALLOW_NPC_CONTACT, ALLOW_MARKET_INFLUENCE, ALLOW_VIRALITY, ALLOW_SYSTEMIC"
        );
        this.advance();
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after REQUIRE block");

    return {
      type: "RequireBlock",
      capabilities,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private configBlock(): AST.ConfigBlock {
    const start = this.current;
    this.advance(); // consume CONFIG
    this.consume(TokenType.LBRACE, "Expected '{' after CONFIG");

    const assignments: AST.Assignment[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const assignment = this.assignment();
      if (assignment) {
        assignments.push(assignment);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after CONFIG block");

    return {
      type: "ConfigBlock",
      assignments,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private observeBlock(): AST.ObserveBlock {
    const start = this.current;
    this.advance(); // consume OBSERVE
    this.consume(TokenType.LBRACE, "Expected '{' after OBSERVE");

    const statements: (AST.Assignment | AST.Condition)[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.assignment();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after OBSERVE block");

    return {
      type: "ObserveBlock",
      statements,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private predictBlock(): AST.PredictBlock {
    const start = this.current;
    this.advance(); // consume PREDICT
    this.consume(TokenType.LBRACE, "Expected '{' after PREDICT");

    const predictions: AST.Prediction[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const prediction = this.prediction();
      if (prediction) {
        predictions.push(prediction);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after PREDICT block");

    return {
      type: "PredictBlock",
      predictions,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private declareBlock(): AST.DeclareBlock {
    const start = this.current;
    this.advance(); // consume DECLARE
    this.consume(TokenType.LBRACE, "Expected '{' after DECLARE");

    const elements: AST.UIElement[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const element = this.uiElement();
      if (element) {
        elements.push(element);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after DECLARE block");

    return {
      type: "DeclareBlock",
      elements,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private impactBlock(): AST.ImpactBlock {
    const start = this.current;
    this.advance(); // consume IMPACT
    this.consume(TokenType.LBRACE, "Expected '{' after IMPACT");

    const statements: AST.ImpactStatement[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.impactStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after IMPACT block");

    return {
      type: "ImpactBlock",
      statements,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private disclaimerBlock(): AST.DisclaimerBlock {
    const start = this.current;
    this.advance(); // consume DISCLAIMER
    this.consume(TokenType.LBRACE, "Expected '{' after DISCLAIMER");

    const disclaimers: string[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.STRING)) {
        disclaimers.push(this.advance().value);
      } else {
        this.addError("Expected string in DISCLAIMER block", this.peek());
        this.advance();
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after DISCLAIMER block");

    return {
      type: "DisclaimerBlock",
      disclaimers,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  // ============================================================================
  // Statements
  // ============================================================================

  private assignment(): AST.Assignment | null {
    const start = this.current;

    if (!this.check(TokenType.IDENTIFIER)) {
      this.addError("Expected identifier for assignment", this.peek());
      this.advance();
      return null;
    }

    const identifier = this.advance().value;

    if (!this.check(TokenType.ASSIGN)) {
      this.addError("Expected '=' after identifier", this.peek());
      return null;
    }
    this.advance();

    const value = this.expression();

    return {
      type: "Assignment",
      identifier,
      value,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private prediction(): AST.Prediction | null {
    const start = this.current;

    // Check for metadata keywords first (CONFIDENCE, EVIDENCE, TIMEFRAME)
    if (this.check(TokenType.CONFIDENCE) || this.check(TokenType.EVIDENCE) || this.check(TokenType.TIMEFRAME)) {
      // This is metadata for the previous prediction, skip (handled elsewhere)
      this.advance();
      this.consume(TokenType.ASSIGN, "Expected '=' after metadata keyword");
      this.expression(); // consume the value
      return null;
    }

    if (!this.check(TokenType.IDENTIFIER)) {
      this.addError("Expected identifier for prediction", this.peek());
      this.advance();
      return null;
    }

    const identifier = this.advance().value;
    this.consume(TokenType.ASSIGN, "Expected '=' after identifier");
    const value = this.expression();

    // Parse optional metadata
    let confidence: AST.Expression | undefined;
    let evidence: AST.Expression | undefined;
    let timeframe: AST.Expression | undefined;

    while (
      this.check(TokenType.CONFIDENCE) ||
      this.check(TokenType.EVIDENCE) ||
      this.check(TokenType.TIMEFRAME)
    ) {
      const metaType = this.advance().type;
      this.consume(TokenType.ASSIGN, "Expected '=' after metadata keyword");
      const metaValue = this.expression();

      switch (metaType) {
        case TokenType.CONFIDENCE:
          confidence = metaValue;
          break;
        case TokenType.EVIDENCE:
          evidence = metaValue;
          break;
        case TokenType.TIMEFRAME:
          timeframe = metaValue;
          break;
      }
    }

    return {
      type: "Prediction",
      identifier,
      value,
      confidence,
      evidence,
      timeframe,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  // ============================================================================
  // UI Elements
  // ============================================================================

  private uiElement(): AST.UIElement | null {
    const start = this.current;
    const elementToken = this.peek();

    if (!isUIElementKeyword(elementToken.type)) {
      this.addError(
        `Expected UI element keyword, got '${elementToken.value}'`,
        elementToken,
        "Valid elements: WINDOW, TEXT, BUTTON, SLIDER, INPUT, CHART, NOTIFY, TOAST, MODAL"
      );
      this.advance();
      return null;
    }

    this.advance(); // consume element keyword
    this.consume(TokenType.LBRACE, `Expected '{' after ${elementToken.value}`);

    const properties = this.uiProperties();

    this.consume(TokenType.RBRACE, `Expected '}' after ${elementToken.value} properties`);

    const elementType = this.tokenToUIElementType(elementToken.type);

    return {
      type: elementType,
      properties,
      loc: this.makeSpan(start, this.current - 1),
    } as AST.UIElement;
  }

  private tokenToUIElementType(type: TokenType): AST.UIElement["type"] {
    switch (type) {
      case TokenType.WINDOW: return "WindowElement";
      case TokenType.TEXT: return "TextElement";
      case TokenType.BUTTON: return "ButtonElement";
      case TokenType.SLIDER: return "SliderElement";
      case TokenType.INPUT: return "InputElement";
      case TokenType.CHART: return "ChartElement";
      case TokenType.NOTIFY: return "NotifyElement";
      case TokenType.TOAST: return "ToastElement";
      case TokenType.MODAL: return "ModalElement";
      default: return "TextElement";
    }
  }

  private uiProperties(): AST.UIProperty[] {
    const properties: AST.UIProperty[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.IDENTIFIER)) {
        const start = this.current;
        const name = this.advance().value;
        this.consume(TokenType.ASSIGN, "Expected '=' after property name");
        const value = this.expression();

        properties.push({
          type: "UIProperty",
          name,
          value,
          loc: this.makeSpan(start, this.current - 1),
        });
      } else {
        this.addError("Expected property name", this.peek());
        this.advance();
      }
    }

    return properties;
  }

  // ============================================================================
  // Impact Statements
  // ============================================================================

  private impactStatement(): AST.ImpactStatement | null {
    const start = this.current;

    // Event handlers: ON CLICK/CHANGE/SUBMIT/TICK { }
    if (this.check(TokenType.ON)) {
      return this.eventHandler();
    }

    // Direct actions: PRINT, POST, DM, etc.
    if (isActionKeyword(this.peek().type)) {
      return this.action();
    }

    // FOR loop
    if (this.check(TokenType.FOR)) {
      return this.forLoop();
    }

    // Assignment or property assignment
    if (this.check(TokenType.IDENTIFIER)) {
      return this.impactAssignment();
    }

    this.addError("Expected event handler or action in IMPACT block", this.peek());
    this.advance();
    return null;
  }

  private eventHandler(): AST.EventHandler {
    const start = this.current;
    this.advance(); // consume ON

    const trigger = this.trigger();

    this.consume(TokenType.LBRACE, "Expected '{' after event trigger");

    const body: (AST.Action | AST.Statement)[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.impactBody();
      if (stmt) {
        body.push(stmt);
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after event handler body");

    return {
      type: "EventHandler",
      trigger,
      body,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private trigger(): AST.Trigger {
    const start = this.current;

    if (this.check(TokenType.TICK)) {
      this.advance();
      return { type: "TickTrigger", loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.CLICK)) {
      this.advance();
      const elementId = this.consume(TokenType.STRING, "Expected element ID after CLICK").value;
      return { type: "ClickTrigger", elementId, loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.CHANGE)) {
      this.advance();
      const elementId = this.consume(TokenType.STRING, "Expected element ID after CHANGE").value;
      return { type: "ChangeTrigger", elementId, loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.SUBMIT)) {
      this.advance();
      return { type: "SubmitTrigger", loc: this.makeSpan(start, this.current - 1) };
    }

    // Condition trigger (any expression)
    const condition = this.expression();
    return {
      type: "ConditionTrigger",
      condition,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private impactBody(): AST.Action | AST.Statement | null {
    // Actions
    if (isActionKeyword(this.peek().type)) {
      return this.action();
    }

    // IF statement
    if (this.check(TokenType.IF)) {
      return this.ifStatement();
    }

    // FOR loop
    if (this.check(TokenType.FOR)) {
      return this.forLoop();
    }

    // Assignment or property assignment
    if (this.check(TokenType.IDENTIFIER)) {
      return this.impactAssignment();
    }

    // Path expression assignment (self.result.content = ...)
    if (this.check(TokenType.SELF) || this.checkPath()) {
      return this.propertyAssignment();
    }

    this.addError("Expected action or statement in impact body", this.peek());
    this.advance();
    return null;
  }

  private checkPath(): boolean {
    // Look ahead to see if this is a path expression
    const current = this.current;
    if (this.check(TokenType.IDENTIFIER)) {
      this.advance();
      if (this.check(TokenType.DOT) || this.check(TokenType.LBRACKET) || this.check(TokenType.LPAREN)) {
        this.current = current;
        return true;
      }
      this.current = current;
    }
    return false;
  }

  private action(): AST.Action | null {
    const start = this.current;
    const actionToken = this.advance();

    switch (actionToken.type) {
      case TokenType.PRINT:
        return {
          type: "PrintAction",
          message: this.expression(),
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.FLASH:
        return {
          type: "FlashAction",
          elementId: this.expression(),
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.SOUND:
        return {
          type: "SoundAction",
          sound: this.expression(),
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.NOTIFY:
      case TokenType.TOAST:
        this.consume(TokenType.LBRACE, `Expected '{' after ${actionToken.value}`);
        const notifyProps = this.uiProperties();
        this.consume(TokenType.RBRACE, `Expected '}' after ${actionToken.value} properties`);
        return {
          type: actionToken.type === TokenType.NOTIFY ? "NotifyAction" : "ToastAction",
          properties: notifyProps,
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.POST:
        this.consume(TokenType.TO, "Expected 'TO' after POST");
        const platform = this.expression();
        this.consume(TokenType.LBRACE, "Expected '{' after platform");
        const postProps = this.uiProperties();
        this.consume(TokenType.RBRACE, "Expected '}' after POST properties");
        return {
          type: "PostAction",
          platform,
          properties: postProps,
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.DM:
        this.consume(TokenType.TO, "Expected 'TO' after DM");
        const recipient = this.expression();
        this.consume(TokenType.LBRACE, "Expected '{' after recipient");
        const dmProps = this.uiProperties();
        this.consume(TokenType.RBRACE, "Expected '}' after DM properties");
        return {
          type: "DMAction",
          recipient,
          properties: dmProps,
          loc: this.makeSpan(start, this.current - 1),
        };

      case TokenType.REACT:
        this.consume(TokenType.TO, "Expected 'TO' after REACT");
        const target = this.expression();
        this.consume(TokenType.WITH, "Expected 'WITH' after target");
        const reaction = this.expression();
        return {
          type: "ReactAction",
          target,
          reaction,
          loc: this.makeSpan(start, this.current - 1),
        };

      default:
        this.addError(`Unknown action '${actionToken.value}'`, actionToken);
        return null;
    }
  }

  private ifStatement(): AST.IfStatement {
    const start = this.current;
    this.advance(); // consume IF

    const condition = this.expression();

    // Optional THEN
    if (this.check(TokenType.THEN)) {
      this.advance();
    }

    this.consume(TokenType.LBRACE, "Expected '{' after IF condition");

    const consequent: (AST.Action | AST.Statement)[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.impactBody();
      if (stmt) consequent.push(stmt);
    }
    this.consume(TokenType.RBRACE, "Expected '}' after IF body");

    let alternate: (AST.Action | AST.Statement)[] | undefined;
    if (this.check(TokenType.ELSE)) {
      this.advance();
      this.consume(TokenType.LBRACE, "Expected '{' after ELSE");
      alternate = [];
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        const stmt = this.impactBody();
        if (stmt) alternate.push(stmt);
      }
      this.consume(TokenType.RBRACE, "Expected '}' after ELSE body");
    }

    return {
      type: "IfStatement",
      condition,
      consequent,
      alternate,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private forLoop(): AST.ForLoop {
    const start = this.current;
    this.advance(); // consume FOR

    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name after FOR").value;
    this.consume(TokenType.IN, "Expected 'IN' after variable");
    const collection = this.expression();

    this.consume(TokenType.LBRACE, "Expected '{' after FOR collection");

    const body: (AST.Action | AST.Statement)[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.impactBody();
      if (stmt) body.push(stmt);
    }
    this.consume(TokenType.RBRACE, "Expected '}' after FOR body");

    return {
      type: "ForLoop",
      variable,
      collection,
      body,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private impactAssignment(): AST.PropertyAssignment | AST.Assignment {
    const start = this.current;

    // Parse the left side - could be simple identifier or path
    const leftStart = this.current;
    const firstId = this.advance().value;

    // Check if this is a path expression
    if (this.check(TokenType.DOT) || this.check(TokenType.LBRACKET) || this.check(TokenType.LPAREN)) {
      // It's a path expression
      const path = this.continuePath(firstId, leftStart);

      // Parse operator
      let operator: "=" | "+=" | "-=" = "=";
      if (this.check(TokenType.PLUS_ASSIGN)) {
        operator = "+=";
        this.advance();
      } else if (this.check(TokenType.MINUS_ASSIGN)) {
        operator = "-=";
        this.advance();
      } else {
        this.consume(TokenType.ASSIGN, "Expected '=', '+=', or '-=' after path");
      }

      const value = this.expression();

      return {
        type: "PropertyAssignment",
        path,
        operator,
        value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Simple assignment
    let operator: "=" | "+=" | "-=" = "=";
    if (this.check(TokenType.PLUS_ASSIGN)) {
      operator = "+=";
      this.advance();
    } else if (this.check(TokenType.MINUS_ASSIGN)) {
      operator = "-=";
      this.advance();
    } else {
      this.consume(TokenType.ASSIGN, "Expected '=', '+=', or '-=' after identifier");
    }

    const value = this.expression();

    if (operator === "=") {
      return {
        type: "Assignment",
        identifier: firstId,
        value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Convert to PropertyAssignment for += and -=
    return {
      type: "PropertyAssignment",
      path: {
        type: "PathExpression",
        segments: [{ type: "PropertyAccess", property: firstId }],
        loc: this.makeSpan(leftStart, leftStart),
      },
      operator,
      value,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  private propertyAssignment(): AST.PropertyAssignment {
    const start = this.current;
    const path = this.pathExpression();

    let operator: "=" | "+=" | "-=" = "=";
    if (this.check(TokenType.PLUS_ASSIGN)) {
      operator = "+=";
      this.advance();
    } else if (this.check(TokenType.MINUS_ASSIGN)) {
      operator = "-=";
      this.advance();
    } else {
      this.consume(TokenType.ASSIGN, "Expected '=', '+=', or '-=' after path");
    }

    const value = this.expression();

    return {
      type: "PropertyAssignment",
      path,
      operator,
      value,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  // ============================================================================
  // Expressions
  // ============================================================================

  private expression(): AST.Expression {
    return this.conditional();
  }

  private conditional(): AST.Expression {
    const start = this.current;

    // Check for IF THEN ELSE expression
    if (this.check(TokenType.IF)) {
      this.advance();
      const test = this.or();
      this.consume(TokenType.THEN, "Expected 'THEN' in conditional expression");
      const consequent = this.expression();
      let alternate: AST.Expression | undefined;
      if (this.check(TokenType.ELSE)) {
        this.advance();
        alternate = this.expression();
      }
      return {
        type: "ConditionalExpression",
        test,
        consequent,
        alternate,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return this.or();
  }

  private or(): AST.Expression {
    let left = this.and();

    while (this.check(TokenType.OR)) {
      const start = this.current;
      this.advance();
      const right = this.and();
      left = {
        type: "BinaryExpression",
        operator: "OR",
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private and(): AST.Expression {
    let left = this.unless();

    while (this.check(TokenType.AND)) {
      const start = this.current;
      this.advance();
      const right = this.unless();
      left = {
        type: "BinaryExpression",
        operator: "AND",
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private unless(): AST.Expression {
    let left = this.equality();

    while (this.check(TokenType.UNLESS)) {
      const start = this.current;
      this.advance();
      const right = this.equality();
      left = {
        type: "BinaryExpression",
        operator: "UNLESS",
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private equality(): AST.Expression {
    let left = this.comparison();

    while (this.check(TokenType.EQ) || this.check(TokenType.NEQ) || this.check(TokenType.VIBES_EQ)) {
      const start = this.current;
      const op = this.advance();
      const right = this.comparison();
      const operator = op.type === TokenType.EQ ? "==" : op.type === TokenType.NEQ ? "!=" : "~=";
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private comparison(): AST.Expression {
    let left = this.term();

    while (
      this.check(TokenType.GT) ||
      this.check(TokenType.GTE) ||
      this.check(TokenType.LT) ||
      this.check(TokenType.LTE)
    ) {
      const start = this.current;
      const op = this.advance();
      const right = this.term();
      const operator =
        op.type === TokenType.GT ? ">" :
        op.type === TokenType.GTE ? ">=" :
        op.type === TokenType.LT ? "<" : "<=";
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private term(): AST.Expression {
    let left = this.factor();

    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const start = this.current;
      const op = this.advance();
      const right = this.factor();
      left = {
        type: "BinaryExpression",
        operator: op.type === TokenType.PLUS ? "+" : "-",
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private factor(): AST.Expression {
    let left = this.unary();

    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.PERCENT)) {
      const start = this.current;
      const op = this.advance();
      const right = this.unary();
      const operator = op.type === TokenType.STAR ? "*" : op.type === TokenType.SLASH ? "/" : "%";
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return left;
  }

  private unary(): AST.Expression {
    const start = this.current;

    if (this.check(TokenType.NOT)) {
      this.advance();
      const argument = this.unary();
      return {
        type: "UnaryExpression",
        operator: "NOT",
        argument,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    if (this.check(TokenType.MINUS)) {
      this.advance();
      const argument = this.unary();
      return {
        type: "UnaryExpression",
        operator: "-",
        argument,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    return this.call();
  }

  private call(): AST.Expression {
    let expr = this.primary();

    // Handle method chaining and property access
    while (true) {
      if (this.check(TokenType.DOT)) {
        this.advance();
        const property = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'").value;

        // Check for method call
        if (this.check(TokenType.LPAREN)) {
          this.advance();
          const args = this.arguments();
          this.consume(TokenType.RPAREN, "Expected ')' after arguments");
          expr = {
            type: "CallExpression",
            callee: {
              type: "PathExpression",
              segments: [
                ...(expr.type === "PathExpression" ? expr.segments : [{ type: "PropertyAccess" as const, property: (expr as AST.Identifier).name }]),
                { type: "PropertyAccess" as const, property },
              ],
            } as AST.PathExpression,
            arguments: args,
          };
        } else {
          // Property access
          if (expr.type === "PathExpression") {
            (expr as AST.PathExpression).segments.push({ type: "PropertyAccess", property });
          } else if (expr.type === "Identifier") {
            expr = {
              type: "PathExpression",
              segments: [
                { type: "PropertyAccess", property: (expr as AST.Identifier).name },
                { type: "PropertyAccess", property },
              ],
            } as AST.PathExpression;
          } else {
            expr = {
              type: "PathExpression",
              segments: [{ type: "PropertyAccess", property }],
            } as AST.PathExpression;
          }
        }
      } else if (this.check(TokenType.LBRACKET)) {
        this.advance();
        const index = this.expression();
        this.consume(TokenType.RBRACKET, "Expected ']' after index");

        if (expr.type === "PathExpression") {
          (expr as AST.PathExpression).segments.push({ type: "IndexAccess", index });
        } else if (expr.type === "Identifier") {
          expr = {
            type: "PathExpression",
            segments: [
              { type: "PropertyAccess", property: (expr as AST.Identifier).name },
              { type: "IndexAccess", index },
            ],
          } as AST.PathExpression;
        }
      } else if (this.check(TokenType.LPAREN) && expr.type === "Identifier") {
        // Function call on identifier
        this.advance();
        const args = this.arguments();
        this.consume(TokenType.RPAREN, "Expected ')' after arguments");
        expr = {
          type: "CallExpression",
          callee: expr,
          arguments: args,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private arguments(): AST.Expression[] {
    const args: AST.Expression[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    return args;
  }

  private primary(): AST.Expression {
    const start = this.current;

    // Literals
    if (this.check(TokenType.NUMBER)) {
      return {
        type: "NumberLiteral",
        value: parseFloat(this.advance().value),
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    if (this.check(TokenType.STRING)) {
      return {
        type: "StringLiteral",
        value: this.advance().value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    if (this.check(TokenType.INTERPOLATED_STRING)) {
      const token = this.advance();
      const parts = JSON.parse(token.value);
      return {
        type: "InterpolatedString",
        parts: parts.map((p: string | { expr: string }) => {
          if (typeof p === "string") return p;
          // Parse the expression inside interpolation
          const subParser = new Parser(new (require("./lexer.js").Lexer)(p.expr).tokenize().tokens);
          const result = subParser.expression();
          return result;
        }),
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    if (this.check(TokenType.TRUE)) {
      this.advance();
      return { type: "BooleanLiteral", value: true, loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.FALSE)) {
      this.advance();
      return { type: "BooleanLiteral", value: false, loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.NULL)) {
      this.advance();
      return { type: "NullLiteral", loc: this.makeSpan(start, this.current - 1) };
    }

    if (this.check(TokenType.UNKNOWN)) {
      this.advance();
      return { type: "UnknownLiteral", loc: this.makeSpan(start, this.current - 1) };
    }

    // Audience keywords
    if (this.check(TokenType.SELF) || this.check(TokenType.FRIENDS) ||
        this.check(TokenType.FOLLOWERS) || this.check(TokenType.PUBLIC)) {
      return {
        type: "Identifier",
        name: this.advance().value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Style keywords
    if (this.check(TokenType.HEADING) || this.check(TokenType.SUBHEADING) ||
        this.check(TokenType.CAPTION) || this.check(TokenType.RESULT) ||
        this.check(TokenType.ERROR) || this.check(TokenType.NORMAL) ||
        this.check(TokenType.PRIMARY) || this.check(TokenType.SECONDARY) ||
        this.check(TokenType.DANGER) || this.check(TokenType.CENTER) ||
        this.check(TokenType.BOTTOM) || this.check(TokenType.LINE) ||
        this.check(TokenType.BAR) || this.check(TokenType.PIE)) {
      return {
        type: "Identifier",
        name: this.advance().value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Trigger mode keywords
    if (this.check(TokenType.ONCE) || this.check(TokenType.ON_CONDITION) ||
        this.check(TokenType.CONTINUOUS)) {
      return {
        type: "Identifier",
        name: this.advance().value,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Tuple/Grouping: (expr) or (expr, expr, ...)
    if (this.check(TokenType.LPAREN)) {
      this.advance();
      const first = this.expression();

      if (this.check(TokenType.COMMA)) {
        // Tuple
        const elements = [first];
        while (this.match(TokenType.COMMA)) {
          elements.push(this.expression());
        }
        this.consume(TokenType.RPAREN, "Expected ')' after tuple");
        return {
          type: "TupleExpression",
          elements,
          loc: this.makeSpan(start, this.current - 1),
        };
      }

      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return first; // Just grouping
    }

    // Collection: [expr, expr, ...]
    if (this.check(TokenType.LBRACKET)) {
      this.advance();
      const elements: AST.Expression[] = [];
      if (!this.check(TokenType.RBRACKET)) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACKET, "Expected ']' after collection");
      return {
        type: "CollectionExpression",
        elements,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    // Identifier
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value;
      return {
        type: "Identifier",
        name,
        loc: this.makeSpan(start, this.current - 1),
      };
    }

    this.addError(`Unexpected token '${this.peek().value}'`, this.peek());
    this.advance();
    return { type: "NullLiteral", loc: this.makeSpan(start, this.current - 1) };
  }

  private pathExpression(): AST.PathExpression {
    const start = this.current;
    const segments: AST.PathSegment[] = [];

    // First segment must be an identifier
    const firstId = this.consume(TokenType.IDENTIFIER, "Expected identifier at start of path").value;
    segments.push({ type: "PropertyAccess", property: firstId });

    return this.continuePath(firstId, start);
  }

  private continuePath(firstId: string, start: number): AST.PathExpression {
    const segments: AST.PathSegment[] = [{ type: "PropertyAccess", property: firstId }];

    while (true) {
      if (this.check(TokenType.DOT)) {
        this.advance();
        const property = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'").value;
        segments.push({ type: "PropertyAccess", property });
      } else if (this.check(TokenType.LBRACKET)) {
        this.advance();
        const index = this.expression();
        this.consume(TokenType.RBRACKET, "Expected ']' after index");
        segments.push({ type: "IndexAccess", index });
      } else if (this.check(TokenType.LPAREN)) {
        this.advance();
        const args = this.arguments();
        this.consume(TokenType.RPAREN, "Expected ')' after arguments");
        // Convert last PropertyAccess to FunctionCall
        const lastSegment = segments.pop();
        if (lastSegment && lastSegment.type === "PropertyAccess") {
          segments.push({
            type: "FunctionCall",
            name: lastSegment.property,
            arguments: args,
          });
        }
      } else {
        break;
      }
    }

    return {
      type: "PathExpression",
      segments,
      loc: this.makeSpan(start, this.current - 1),
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    this.addError(message, this.peek());
    throw new ParseAbort();
  }

  private addError(message: string, token: Token, hint?: string): void {
    this.errors.push({
      message,
      line: token.line,
      column: token.column,
      hint,
    });
  }

  private makeSpan(startIndex: number, endIndex: number): AST.SourceSpan {
    const startToken = this.tokens[startIndex] || this.tokens[0];
    const endToken = this.tokens[endIndex] || this.tokens[this.tokens.length - 1];

    return {
      start: {
        line: startToken.line,
        column: startToken.column,
        offset: startToken.offset,
      },
      end: {
        line: endToken.line,
        column: endToken.column + endToken.value.length,
        offset: endToken.offset + endToken.value.length,
      },
    };
  }
}

class ParseAbort extends Error {
  constructor() {
    super("Parse aborted");
    this.name = "ParseAbort";
  }
}

/**
 * Convenience function to parse STALK source code
 */
export function parse(tokens: Token[]): ParseResult {
  const parser = new Parser(tokens);
  return parser.parse();
}
