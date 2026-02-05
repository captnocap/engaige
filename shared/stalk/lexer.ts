/**
 * STALK Language Lexer
 *
 * Converts STALK source code into a stream of tokens.
 */

import { Token, TokenType, KEYWORDS } from "./tokens.js";

export interface LexerError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export interface LexerResult {
  tokens: Token[];
  errors: LexerError[];
}

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private errors: LexerError[] = [];

  private start = 0;
  private current = 0;
  private line = 1;
  private column = 1;
  private lineStart = 0;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): LexerResult {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
      offset: this.current,
    });

    return {
      tokens: this.tokens,
      errors: this.errors,
    };
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      // Single-character tokens
      case "{":
        this.addToken(TokenType.LBRACE);
        break;
      case "}":
        this.addToken(TokenType.RBRACE);
        break;
      case "(":
        this.addToken(TokenType.LPAREN);
        break;
      case ")":
        this.addToken(TokenType.RPAREN);
        break;
      case "[":
        this.addToken(TokenType.LBRACKET);
        break;
      case "]":
        this.addToken(TokenType.RBRACKET);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case "+":
        this.addToken(this.match("=") ? TokenType.PLUS_ASSIGN : TokenType.PLUS);
        break;
      case "-":
        this.addToken(this.match("=") ? TokenType.MINUS_ASSIGN : TokenType.MINUS);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "%":
        this.addToken(TokenType.PERCENT);
        break;

      // Two-character tokens
      case "=":
        this.addToken(this.match("=") ? TokenType.EQ : TokenType.ASSIGN);
        break;
      case "!":
        if (this.match("=")) {
          this.addToken(TokenType.NEQ);
        } else {
          this.addError(`Unexpected character '!'`);
        }
        break;
      case ">":
        this.addToken(this.match("=") ? TokenType.GTE : TokenType.GT);
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LTE : TokenType.LT);
        break;
      case "~":
        if (this.match("=")) {
          this.addToken(TokenType.VIBES_EQ);
        } else {
          this.addError(`Unexpected character '~'`);
        }
        break;

      // Comments and division
      case "/":
        if (this.match("/")) {
          // Single-line comment
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      case "#":
        if (this.match("*")) {
          // Multi-line comment
          this.multiLineComment();
        } else {
          // Single-line comment
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        }
        break;

      // Whitespace
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;

      case "\n":
        this.addToken(TokenType.NEWLINE);
        this.line++;
        this.column = 1;
        this.lineStart = this.current;
        break;

      // Strings
      case '"':
        this.string('"');
        break;
      case "'":
        this.string("'");
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.addError(`Unexpected character '${c}'`);
        }
        break;
    }
  }

  private multiLineComment(): void {
    let depth = 1;

    while (depth > 0 && !this.isAtEnd()) {
      if (this.peek() === "#" && this.peekNext() === "*") {
        depth++;
        this.advance();
        this.advance();
      } else if (this.peek() === "*" && this.peekNext() === "#") {
        depth--;
        this.advance();
        this.advance();
      } else {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 0;
          this.lineStart = this.current + 1;
        }
        this.advance();
      }
    }

    if (depth > 0) {
      this.addError("Unterminated multi-line comment");
    }
  }

  private string(quote: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = "";
    let hasInterpolation = false;
    const parts: (string | { expr: string })[] = [];
    let currentPart = "";

    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 0;
        this.lineStart = this.current + 1;
      }

      // Handle escape sequences
      if (this.peek() === "\\") {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case "n":
            currentPart += "\n";
            break;
          case "t":
            currentPart += "\t";
            break;
          case "\\":
            currentPart += "\\";
            break;
          case '"':
            currentPart += '"';
            break;
          case "'":
            currentPart += "'";
            break;
          case "{":
            currentPart += "{";
            break;
          default:
            currentPart += escaped;
        }
      }
      // Handle interpolation
      else if (this.peek() === "{") {
        hasInterpolation = true;
        if (currentPart) {
          parts.push(currentPart);
          currentPart = "";
        }

        this.advance(); // consume {
        let expr = "";
        let braceDepth = 1;

        while (braceDepth > 0 && !this.isAtEnd()) {
          if (this.peek() === "{") {
            braceDepth++;
          } else if (this.peek() === "}") {
            braceDepth--;
            if (braceDepth === 0) break;
          }
          expr += this.advance();
        }

        if (this.peek() === "}") {
          this.advance(); // consume closing }
          parts.push({ expr });
        } else {
          this.addError("Unterminated interpolation");
        }
      } else {
        currentPart += this.advance();
      }
    }

    if (this.isAtEnd()) {
      this.addError("Unterminated string");
      return;
    }

    // Consume closing quote
    this.advance();

    if (currentPart) {
      parts.push(currentPart);
    }

    if (hasInterpolation) {
      // Store as interpolated string with parts encoded
      this.tokens.push({
        type: TokenType.INTERPOLATED_STRING,
        value: JSON.stringify(parts),
        line: startLine,
        column: startColumn,
        offset: this.start,
      });
    } else {
      // Plain string
      value = parts.length > 0 ? (parts[0] as string) : "";
      this.tokens.push({
        type: TokenType.STRING,
        value,
        line: startLine,
        column: startColumn,
        offset: this.start,
      });
    }
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for decimal part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(TokenType.NUMBER);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const upperText = text.toUpperCase();

    // Check for keywords (case-insensitive)
    const type = KEYWORDS[upperText] ?? TokenType.IDENTIFIER;
    this.addToken(type, type === TokenType.IDENTIFIER ? text : upperText);
  }

  // Helper methods

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    const char = this.source[this.current];
    this.current++;
    this.column++;
    return char;
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    this.column++;
    return true;
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private addToken(type: TokenType, value?: string): void {
    const text = value ?? this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      value: text,
      line: this.line,
      column: this.column - (this.current - this.start),
      offset: this.start,
    });
  }

  private addError(message: string): void {
    this.errors.push({
      message,
      line: this.line,
      column: this.column,
      offset: this.current,
    });

    // Add invalid token for error recovery
    this.addToken(TokenType.INVALID);
  }
}

/**
 * Convenience function to tokenize STALK source code
 */
export function tokenize(source: string): LexerResult {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}
