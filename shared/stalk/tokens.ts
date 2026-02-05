/**
 * STALK Language Token Definitions
 */

export enum TokenType {
  // Literals
  NUMBER = "NUMBER",
  STRING = "STRING",
  INTERPOLATED_STRING = "INTERPOLATED_STRING",

  // Identifiers
  IDENTIFIER = "IDENTIFIER",

  // Keywords - Block types
  STALK = "STALK",
  REQUIRE = "REQUIRE",
  CONFIG = "CONFIG",
  OBSERVE = "OBSERVE",
  PREDICT = "PREDICT",
  DECLARE = "DECLARE",
  IMPACT = "IMPACT",
  DISCLAIMER = "DISCLAIMER",

  // Keywords - Logic
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  UNLESS = "UNLESS",
  IF = "IF",
  THEN = "THEN",
  ELSE = "ELSE",
  END = "END",

  // Keywords - Events
  ON = "ON",
  CLICK = "CLICK",
  CHANGE = "CHANGE",
  SUBMIT = "SUBMIT",
  TICK = "TICK",

  // Keywords - Prepositions
  TO = "TO",
  FROM = "FROM",
  AS = "AS",
  WITH = "WITH",
  FOR = "FOR",
  UNTIL = "UNTIL",
  IN = "IN",

  // Keywords - Literals
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",
  UNKNOWN = "UNKNOWN",

  // Keywords - Prediction metadata
  CONFIDENCE = "CONFIDENCE",
  EVIDENCE = "EVIDENCE",
  TIMEFRAME = "TIMEFRAME",
  AUDIENCE = "AUDIENCE",

  // Keywords - UI Elements
  WINDOW = "WINDOW",
  TEXT = "TEXT",
  BUTTON = "BUTTON",
  SLIDER = "SLIDER",
  INPUT = "INPUT",
  CHART = "CHART",
  NOTIFY = "NOTIFY",
  TOAST = "TOAST",
  MODAL = "MODAL",

  // Keywords - Actions
  POST = "POST",
  DM = "DM",
  REACT = "REACT",
  PRINT = "PRINT",
  FLASH = "FLASH",
  SOUND = "SOUND",

  // Keywords - Capabilities
  ALLOW_BROADCAST = "ALLOW_BROADCAST",
  ALLOW_RELATIONSHIP_WRITE = "ALLOW_RELATIONSHIP_WRITE",
  ALLOW_NPC_CONTACT = "ALLOW_NPC_CONTACT",
  ALLOW_MARKET_INFLUENCE = "ALLOW_MARKET_INFLUENCE",
  ALLOW_VIRALITY = "ALLOW_VIRALITY",
  ALLOW_SYSTEMIC = "ALLOW_SYSTEMIC",

  // Keywords - Audience
  SELF = "SELF",
  FRIENDS = "FRIENDS",
  FOLLOWERS = "FOLLOWERS",
  PUBLIC = "PUBLIC",

  // Keywords - UI Styles
  HEADING = "HEADING",
  SUBHEADING = "SUBHEADING",
  CAPTION = "CAPTION",
  RESULT = "RESULT",
  ERROR = "ERROR",
  NORMAL = "NORMAL",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  DANGER = "DANGER",
  CENTER = "CENTER",
  BOTTOM = "BOTTOM",
  LINE = "LINE",
  BAR = "BAR",
  PIE = "PIE",

  // Keywords - Trigger modes
  ONCE = "ONCE",
  ON_CONDITION = "ON_CONDITION",
  CONTINUOUS = "CONTINUOUS",

  // Operators - Arithmetic
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  PERCENT = "PERCENT",

  // Operators - Comparison
  EQ = "EQ",           // ==
  NEQ = "NEQ",         // !=
  GT = "GT",           // >
  LT = "LT",           // <
  GTE = "GTE",         // >=
  LTE = "LTE",         // <=
  VIBES_EQ = "VIBES_EQ", // ~=

  // Operators - Assignment
  ASSIGN = "ASSIGN",       // =
  PLUS_ASSIGN = "PLUS_ASSIGN",   // +=
  MINUS_ASSIGN = "MINUS_ASSIGN", // -=

  // Punctuation
  LBRACE = "LBRACE",       // {
  RBRACE = "RBRACE",       // }
  LPAREN = "LPAREN",       // (
  RPAREN = "RPAREN",       // )
  LBRACKET = "LBRACKET",   // [
  RBRACKET = "RBRACKET",   // ]
  DOT = "DOT",             // .
  COMMA = "COMMA",         // ,
  COLON = "COLON",         // :
  NEWLINE = "NEWLINE",

  // Special
  EOF = "EOF",
  INVALID = "INVALID",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  offset: number;
}

export const KEYWORDS: Record<string, TokenType> = {
  // Block types
  STALK: TokenType.STALK,
  REQUIRE: TokenType.REQUIRE,
  CONFIG: TokenType.CONFIG,
  OBSERVE: TokenType.OBSERVE,
  PREDICT: TokenType.PREDICT,
  DECLARE: TokenType.DECLARE,
  IMPACT: TokenType.IMPACT,
  DISCLAIMER: TokenType.DISCLAIMER,

  // Logic
  AND: TokenType.AND,
  OR: TokenType.OR,
  NOT: TokenType.NOT,
  UNLESS: TokenType.UNLESS,
  IF: TokenType.IF,
  THEN: TokenType.THEN,
  ELSE: TokenType.ELSE,
  END: TokenType.END,

  // Events
  ON: TokenType.ON,
  CLICK: TokenType.CLICK,
  CHANGE: TokenType.CHANGE,
  SUBMIT: TokenType.SUBMIT,
  TICK: TokenType.TICK,

  // Prepositions
  TO: TokenType.TO,
  FROM: TokenType.FROM,
  AS: TokenType.AS,
  WITH: TokenType.WITH,
  FOR: TokenType.FOR,
  UNTIL: TokenType.UNTIL,
  IN: TokenType.IN,

  // Literals
  TRUE: TokenType.TRUE,
  FALSE: TokenType.FALSE,
  NULL: TokenType.NULL,
  UNKNOWN: TokenType.UNKNOWN,

  // Prediction metadata
  CONFIDENCE: TokenType.CONFIDENCE,
  EVIDENCE: TokenType.EVIDENCE,
  TIMEFRAME: TokenType.TIMEFRAME,
  AUDIENCE: TokenType.AUDIENCE,

  // UI Elements
  WINDOW: TokenType.WINDOW,
  TEXT: TokenType.TEXT,
  BUTTON: TokenType.BUTTON,
  SLIDER: TokenType.SLIDER,
  INPUT: TokenType.INPUT,
  CHART: TokenType.CHART,
  NOTIFY: TokenType.NOTIFY,
  TOAST: TokenType.TOAST,
  MODAL: TokenType.MODAL,

  // Actions
  POST: TokenType.POST,
  DM: TokenType.DM,
  REACT: TokenType.REACT,
  PRINT: TokenType.PRINT,
  FLASH: TokenType.FLASH,
  SOUND: TokenType.SOUND,

  // Capabilities
  ALLOW_BROADCAST: TokenType.ALLOW_BROADCAST,
  ALLOW_RELATIONSHIP_WRITE: TokenType.ALLOW_RELATIONSHIP_WRITE,
  ALLOW_NPC_CONTACT: TokenType.ALLOW_NPC_CONTACT,
  ALLOW_MARKET_INFLUENCE: TokenType.ALLOW_MARKET_INFLUENCE,
  ALLOW_VIRALITY: TokenType.ALLOW_VIRALITY,
  ALLOW_SYSTEMIC: TokenType.ALLOW_SYSTEMIC,

  // Audience
  SELF: TokenType.SELF,
  FRIENDS: TokenType.FRIENDS,
  FOLLOWERS: TokenType.FOLLOWERS,
  PUBLIC: TokenType.PUBLIC,

  // UI Styles
  HEADING: TokenType.HEADING,
  SUBHEADING: TokenType.SUBHEADING,
  CAPTION: TokenType.CAPTION,
  RESULT: TokenType.RESULT,
  ERROR: TokenType.ERROR,
  NORMAL: TokenType.NORMAL,
  PRIMARY: TokenType.PRIMARY,
  SECONDARY: TokenType.SECONDARY,
  DANGER: TokenType.DANGER,
  CENTER: TokenType.CENTER,
  BOTTOM: TokenType.BOTTOM,
  LINE: TokenType.LINE,
  BAR: TokenType.BAR,
  PIE: TokenType.PIE,

  // Trigger modes
  ONCE: TokenType.ONCE,
  ON_CONDITION: TokenType.ON_CONDITION,
  CONTINUOUS: TokenType.CONTINUOUS,
};

export function isCapabilityKeyword(type: TokenType): boolean {
  return [
    TokenType.ALLOW_BROADCAST,
    TokenType.ALLOW_RELATIONSHIP_WRITE,
    TokenType.ALLOW_NPC_CONTACT,
    TokenType.ALLOW_MARKET_INFLUENCE,
    TokenType.ALLOW_VIRALITY,
    TokenType.ALLOW_SYSTEMIC,
  ].includes(type);
}

export function isUIElementKeyword(type: TokenType): boolean {
  return [
    TokenType.WINDOW,
    TokenType.TEXT,
    TokenType.BUTTON,
    TokenType.SLIDER,
    TokenType.INPUT,
    TokenType.CHART,
    TokenType.NOTIFY,
    TokenType.TOAST,
    TokenType.MODAL,
  ].includes(type);
}

export function isActionKeyword(type: TokenType): boolean {
  return [
    TokenType.POST,
    TokenType.DM,
    TokenType.REACT,
    TokenType.PRINT,
    TokenType.FLASH,
    TokenType.SOUND,
    TokenType.NOTIFY,
    TokenType.TOAST,
  ].includes(type);
}

export function isTriggerKeyword(type: TokenType): boolean {
  return [
    TokenType.TICK,
    TokenType.CLICK,
    TokenType.CHANGE,
    TokenType.SUBMIT,
  ].includes(type);
}
