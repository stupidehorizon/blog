export class Vector2D {
    constructor(x = 1, y = 0) {
      this.x = x;
      this.y = y;
    }

    get length() {
      return Math.hypot(this.x, this.y);
    }
  
    get dir() {
      return Math.atan2(this.y, this.x);
    }
  
    copy() {
      return new Vector2D(this.x, this.y);
    }
  
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
  
    sub(v) {
      debugger
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
  
    scale(a) {
      this.x *= a;
      this.y *= a;
      return this;
    }
  
    cross(v) {
      return this.x * v.y - v.x * this.y;
    }
  
    dot(v) {
      return this.x * v.x + v.y * this.y;
    }
  
    normalize() {
      return this.scale(1 / this.length);
    }
  
    rotate(rad) {
      const c = Math.cos(rad),
        s = Math.sin(rad);
      const [x, y] = this;
  
      this.x = x * c + y * -s;
      this.y = x * s + y * c;
  
      return this;
    }
  }