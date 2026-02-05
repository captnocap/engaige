/**
 * STALK Language AST Type Definitions
 *
 * These types define the Abstract Syntax Tree structure for STALK programs.
 * Generated from the EBNF grammar in docs/STALK_LANGUAGE_SPEC.md
 */

// ============================================================================
// Source Location
// ============================================================================

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface SourceSpan {
  start: SourceLocation;
  end: SourceLocation;
}

// ============================================================================
// Base Node
// ============================================================================

export interface BaseNode {
  type: string;
  loc?: SourceSpan;
}

// ============================================================================
// Program
// ============================================================================

export interface Program extends BaseNode {
  type: "Program";
  name: string;
  blocks: Block[];
}

// ============================================================================
// Blocks
// ============================================================================

export type Block =
  | RequireBlock
  | ConfigBlock
  | ObserveBlock
  | PredictBlock
  | DeclareBlock
  | ImpactBlock
  | DisclaimerBlock;

export interface RequireBlock extends BaseNode {
  type: "RequireBlock";
  capabilities: Capability[];
}

export interface ConfigBlock extends BaseNode {
  type: "ConfigBlock";
  assignments: Assignment[];
}

export interface ObserveBlock extends BaseNode {
  type: "ObserveBlock";
  statements: (Assignment | Condition)[];
}

export interface PredictBlock extends BaseNode {
  type: "PredictBlock";
  predictions: Prediction[];
}

export interface DeclareBlock extends BaseNode {
  type: "DeclareBlock";
  elements: UIElement[];
}

export interface ImpactBlock extends BaseNode {
  type: "ImpactBlock";
  statements: ImpactStatement[];
}

export interface DisclaimerBlock extends BaseNode {
  type: "DisclaimerBlock";
  disclaimers: string[];
}

// ============================================================================
// Capabilities
// ============================================================================

export type CapabilityType =
  | "ALLOW_BROADCAST"
  | "ALLOW_RELATIONSHIP_WRITE"
  | "ALLOW_NPC_CONTACT"
  | "ALLOW_MARKET_INFLUENCE"
  | "ALLOW_VIRALITY"
  | "ALLOW_SYSTEMIC";

export interface Capability extends BaseNode {
  type: "Capability";
  capability: CapabilityType;
}

// ============================================================================
// Statements
// ============================================================================

export interface Assignment extends BaseNode {
  type: "Assignment";
  identifier: string;
  value: Expression;
}

export interface Condition extends BaseNode {
  type: "Condition";
  identifier: string;
  value: Expression;
}

// ============================================================================
// Predictions
// ============================================================================

export interface Prediction extends BaseNode {
  type: "Prediction";
  identifier: string;
  value: Expression;
  confidence?: Expression;
  evidence?: Expression;
  timeframe?: Expression;
}

// ============================================================================
// UI Elements
// ============================================================================

export type UIElement =
  | WindowElement
  | TextElement
  | ButtonElement
  | SliderElement
  | InputElement
  | ChartElement
  | NotifyElement
  | ToastElement
  | ModalElement;

export interface UIElementBase extends BaseNode {
  properties: UIProperty[];
}

export interface UIProperty extends BaseNode {
  type: "UIProperty";
  name: string;
  value: Expression;
}

export interface WindowElement extends UIElementBase {
  type: "WindowElement";
}

export interface TextElement extends UIElementBase {
  type: "TextElement";
}

export interface ButtonElement extends UIElementBase {
  type: "ButtonElement";
}

export interface SliderElement extends UIElementBase {
  type: "SliderElement";
}

export interface InputElement extends UIElementBase {
  type: "InputElement";
}

export interface ChartElement extends UIElementBase {
  type: "ChartElement";
}

export interface NotifyElement extends UIElementBase {
  type: "NotifyElement";
}

export interface ToastElement extends UIElementBase {
  type: "ToastElement";
}

export interface ModalElement extends UIElementBase {
  type: "ModalElement";
}

// ============================================================================
// Impact Statements
// ============================================================================

export type ImpactStatement = EventHandler | Action;

export interface EventHandler extends BaseNode {
  type: "EventHandler";
  trigger: Trigger;
  body: (Action | Statement)[];
}

export type Trigger =
  | TickTrigger
  | ClickTrigger
  | ChangeTrigger
  | SubmitTrigger
  | ConditionTrigger;

export interface TickTrigger extends BaseNode {
  type: "TickTrigger";
}

export interface ClickTrigger extends BaseNode {
  type: "ClickTrigger";
  elementId: string;
}

export interface ChangeTrigger extends BaseNode {
  type: "ChangeTrigger";
  elementId: string;
}

export interface SubmitTrigger extends BaseNode {
  type: "SubmitTrigger";
}

export interface ConditionTrigger extends BaseNode {
  type: "ConditionTrigger";
  condition: Expression;
}

// ============================================================================
// Actions (Side Effects)
// ============================================================================

export type Action =
  | PrintAction
  | FlashAction
  | SoundAction
  | NotifyAction
  | ToastAction
  | PostAction
  | DMAction
  | ReactAction
  | PropertyAssignment
  | ForLoop;

export interface PrintAction extends BaseNode {
  type: "PrintAction";
  message: Expression;
}

export interface FlashAction extends BaseNode {
  type: "FlashAction";
  elementId: Expression;
}

export interface SoundAction extends BaseNode {
  type: "SoundAction";
  sound: Expression;
}

export interface NotifyAction extends BaseNode {
  type: "NotifyAction";
  properties: UIProperty[];
}

export interface ToastAction extends BaseNode {
  type: "ToastAction";
  properties: UIProperty[];
}

export interface PostAction extends BaseNode {
  type: "PostAction";
  platform: Expression;
  properties: UIProperty[];
}

export interface DMAction extends BaseNode {
  type: "DMAction";
  recipient: Expression;
  properties: UIProperty[];
}

export interface ReactAction extends BaseNode {
  type: "ReactAction";
  target: Expression;
  reaction: Expression;
}

export interface PropertyAssignment extends BaseNode {
  type: "PropertyAssignment";
  path: PathExpression;
  operator: "=" | "+=" | "-=";
  value: Expression;
}

export interface ForLoop extends BaseNode {
  type: "ForLoop";
  variable: string;
  collection: Expression;
  body: (Action | Statement)[];
}

// ============================================================================
// Statements (used in IMPACT body)
// ============================================================================

export type Statement = Assignment | IfStatement;

export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  consequent: (Action | Statement)[];
  alternate?: (Action | Statement)[];
}

// ============================================================================
// Expressions
// ============================================================================

export type Expression =
  | Literal
  | Identifier
  | PathExpression
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | ConditionalExpression
  | TupleExpression
  | CollectionExpression
  | InterpolatedString;

// Literals
export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral extends BaseNode {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "NullLiteral";
}

export interface UnknownLiteral extends BaseNode {
  type: "UnknownLiteral";
}

export type Literal =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | UnknownLiteral;

// Identifier
export interface Identifier extends BaseNode {
  type: "Identifier";
  name: string;
}

// Path Expression (for game state access)
export interface PathExpression extends BaseNode {
  type: "PathExpression";
  segments: PathSegment[];
}

export type PathSegment =
  | PropertyAccess
  | IndexAccess
  | FunctionCall;

export interface PropertyAccess extends BaseNode {
  type: "PropertyAccess";
  property: string;
}

export interface IndexAccess extends BaseNode {
  type: "IndexAccess";
  index: Expression;
}

export interface FunctionCall extends BaseNode {
  type: "FunctionCall";
  name: string;
  arguments: Expression[];
}

// Binary Expression
export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "~="
  | "AND"
  | "OR"
  | "UNLESS";

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

// Unary Expression
export type UnaryOperator = "NOT" | "-";

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: UnaryOperator;
  argument: Expression;
}

// Call Expression
export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

// Conditional Expression (IF THEN ELSE)
export interface ConditionalExpression extends BaseNode {
  type: "ConditionalExpression";
  test: Expression;
  consequent: Expression;
  alternate?: Expression;
}

// Tuple Expression (for things like size = (420, 300))
export interface TupleExpression extends BaseNode {
  type: "TupleExpression";
  elements: Expression[];
}

// Collection Expression (for inline collections)
export interface CollectionExpression extends BaseNode {
  type: "CollectionExpression";
  elements: Expression[];
}

// Interpolated String
export interface InterpolatedString extends BaseNode {
  type: "InterpolatedString";
  parts: (string | Expression)[];
}

// ============================================================================
// Metadata Types (for predictions)
// ============================================================================

export interface PredictionMetadata {
  confidence?: number;
  evidence?: string;
  timeframe?: string;
}

// ============================================================================
// Audience Types
// ============================================================================

export type AudienceType =
  | "SELF"
  | "FRIENDS"
  | "FOLLOWERS"
  | "PUBLIC"
  | { type: "npc"; name: string }
  | { type: "group"; name: string };

// ============================================================================
// Config Types
// ============================================================================

export type TriggerMode = "ONCE" | "ON_CONDITION" | "CONTINUOUS";

export interface ProgramConfig {
  version?: string;
  author?: string;
  description?: string;
  trigger?: TriggerMode;
  tickRate?: number;
  maxConfidence?: number;
  defaultAudience?: AudienceType;
}

// ============================================================================
// Helper Types for Type Guards
// ============================================================================

export function isBlock(node: BaseNode): node is Block {
  return [
    "RequireBlock",
    "ConfigBlock",
    "ObserveBlock",
    "PredictBlock",
    "DeclareBlock",
    "ImpactBlock",
    "DisclaimerBlock",
  ].includes(node.type);
}

export function isUIElement(node: BaseNode): node is UIElement {
  return [
    "WindowElement",
    "TextElement",
    "ButtonElement",
    "SliderElement",
    "InputElement",
    "ChartElement",
    "NotifyElement",
    "ToastElement",
    "ModalElement",
  ].includes(node.type);
}

export function isExpression(node: BaseNode): node is Expression {
  return [
    "NumberLiteral",
    "StringLiteral",
    "BooleanLiteral",
    "NullLiteral",
    "UnknownLiteral",
    "Identifier",
    "PathExpression",
    "BinaryExpression",
    "UnaryExpression",
    "CallExpression",
    "ConditionalExpression",
    "TupleExpression",
    "CollectionExpression",
    "InterpolatedString",
  ].includes(node.type);
}

export function isAction(node: BaseNode): node is Action {
  return [
    "PrintAction",
    "FlashAction",
    "SoundAction",
    "NotifyAction",
    "ToastAction",
    "PostAction",
    "DMAction",
    "ReactAction",
    "PropertyAssignment",
    "ForLoop",
  ].includes(node.type);
}

export function isLiteral(node: BaseNode): node is Literal {
  return [
    "NumberLiteral",
    "StringLiteral",
    "BooleanLiteral",
    "NullLiteral",
    "UnknownLiteral",
  ].includes(node.type);
}
