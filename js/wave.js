/**
 * Wave Animation Effect
 * A WebGL-based animation that creates a field of particles moving in a wave-like pattern
 *
 * @author Claude (based on original code from Secur template)
 * @version 1.0.0
 */

class ShaderProgram {
  constructor(holder, options = {}) {
    options = Object.assign({
      antialias: false,
      depthTest: false,
      mousemove: false,
      autosize: true,
      side: 'front',
      vertex: `
        precision highp float;

        attribute vec4 a_position;
        attribute vec4 a_color;

        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mousemove;
        uniform mat4 u_projection;

        varying vec4 v_color;

        void main() {

          gl_Position = u_projection * a_position;
          gl_PointSize = (10.0 / gl_Position.w) * 100.0;

          v_color = a_color;

        }`,
      fragment: `
        precision highp float;

        uniform sampler2D u_texture;
        uniform int u_hasTexture;

        varying vec4 v_color;

        void main() {

          if ( u_hasTexture == 1 ) {

            gl_FragColor = v_color * texture2D(u_texture, gl_PointCoord);

          } else {

            gl_FragColor = v_color;

          }

        }`,
      uniforms: {},
      buffers: {},
      camera: {},
      texture: null,
      onUpdate: () => {},
      onResize: () => {}
    }, options);

    const uniforms = Object.assign({
      time: { type: 'float', value: 0 },
      hasTexture: { type: 'int', value: 0 },
      resolution: { type: 'vec2', value: [0, 0] },
      mousemove: { type: 'vec2', value: [0, 0] },
      projection: { type: 'mat4', value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
    }, options.uniforms);

    const buffers = Object.assign({
      position: { size: 3, data: [] },
      color: { size: 4, data: [] }
    }, options.buffers);

    const camera = Object.assign({
      fov: 60,
      near: 1,
      far: 10000,
      aspect: 1,
      z: 100,
      perspective: true
    }, options.camera);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: options.antialias });

    if (!gl) return false;

    this.count = 0;
    this.gl = gl;
    this.canvas = canvas;
    this.camera = camera;
    this.holder = holder;
    this.onUpdate = options.onUpdate;
    this.onResize = options.onResize;
    this.data = {};

    holder.appendChild(canvas);

    this.createProgram(options.vertex, options.fragment);
    this.createBuffers(buffers);
    this.createUniforms(uniforms);
    this.updateBuffers();
    this.updateUniforms();
    this.createTexture(options.texture);

    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl[options.depthTest ? 'enable' : 'disable'](gl.DEPTH_TEST);

    if (options.autosize) {
      window.addEventListener('resize', e => this.resize(e), false);
    }

    if (options.mousemove) {
      window.addEventListener('mousemove', e => this.mousemove(e), false);
    }

    this.resize();

    this.update = this.update.bind(this);
    this.time = {
      start: performance.now(),
      old: performance.now()
    };
    this.update();
  }

  mousemove(e) {
    let x = e.pageX / this.width * 2 - 1;
    let y = e.pageY / this.height * 2 - 1;

    this.uniforms.mousemove = [x, y];
  }

  resize(e) {
    const holder = this.holder;
    const canvas = this.canvas;
    const gl = this.gl;

    const width = this.width = holder.offsetWidth;
    const height = this.height = holder.offsetHeight;
    const aspect = this.aspect = width / height;
    const dpr = devicePixelRatio;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    gl.viewport(0, 0, width * dpr, height * dpr);
    gl.clearColor(0, 0, 0, 0);

    this.uniforms.resolution = [width, height];
    this.uniforms.projection = this.setProjection(aspect);

    this.onResize(width, height, dpr);
  }

  setProjection(aspect) {
    const camera = this.camera;

    if (camera.perspective) {
      camera.aspect = aspect;
      const fov = camera.fov * (Math.PI / 180);
      const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
      const rangeInv = 1.0 / (camera.near - camera.far);

      const matrix = [
        f / camera.aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (camera.near + camera.far) * rangeInv, -1,
        0, 0, camera.near * camera.far * rangeInv * 2, 0
      ];

      matrix[14] += camera.z;
      matrix[15] += camera.z;

      return matrix;
    } else {
      return [
        2 / this.width, 0, 0, 0,
        0, -2 / this.height, 0, 0,
        0, 0, 1, 0,
        -1, 1, 0, 1
      ];
    }
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
  }

  createProgram(vertex, fragment) {
    const gl = this.gl;

    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertex);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragment);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      this.program = program;
    } else {
      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }
  }

  createUniforms(uniforms) {
    const gl = this.gl;
    const data = this.data.uniforms = uniforms;
    const values = this.uniforms = {};

    Object.keys(data).forEach(name => {
      const uniform = data[name];
      uniform.location = gl.getUniformLocation(this.program, 'u_' + name);

      Object.defineProperty(values, name, {
        set: value => {
          data[name].value = value;
          this.setUniform(name, value);
        },
        get: () => data[name].value
      });
    });
  }

  setUniform(name, value) {
    const gl = this.gl;
    const uniform = this.data.uniforms[name];

    uniform.value = value;

    switch (uniform.type) {
      case 'int': {
        gl.uniform1i(uniform.location, value);
        break;
      }
      case 'float': {
        gl.uniform1f(uniform.location, value);
        break;
      }
      case 'vec2': {
        gl.uniform2f(uniform.location, ...value);
        break;
      }
      case 'vec3': {
        gl.uniform3f(uniform.location, ...value);
        break;
      }
      case 'vec4': {
        gl.uniform4f(uniform.location, ...value);
        break;
      }
      case 'mat2': {
        gl.uniformMatrix2fv(uniform.location, false, value);
        break;
      }
      case 'mat3': {
        gl.uniformMatrix3fv(uniform.location, false, value);
        break;
      }
      case 'mat4': {
        gl.uniformMatrix4fv(uniform.location, false, value);
        break;
      }
    }
  }

  updateUniforms() {
    const uniforms = this.data.uniforms;

    Object.keys(uniforms).forEach(name => {
      const uniform = uniforms[name];
      this.uniforms[name] = uniform.value;
    });
  }

  createBuffers(buffers) {
    const gl = this.gl;
    const data = this.data.buffers = buffers;
    const values = this.buffers = {};

    Object.keys(data).forEach(name => {
      const buffer = data[name];
      buffer.buffer = this.createBuffer('a_' + name, buffer.size);

      Object.defineProperty(values, name, {
        set: data => {
          buffer.data = data;
          this.setBuffer(name, data);

          if (name === 'position') {
            this.count = buffer.data.length / 3;
          }
        },
        get: () => buffer.data
      });
    });
  }

  createBuffer(name, size) {
    const gl = this.gl;
    const program = this.program;

    const index = gl.getAttribLocation(program, name);
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);

    return buffer;
  }

  setBuffer(name, data) {
    const gl = this.gl;
    const buffers = this.data.buffers;

    if (name === null || !data) {
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name].buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  updateBuffers() {
    const gl = this.gl;
    const buffers = this.buffers;

    Object.keys(buffers).forEach(name => {
      const buffer = this.data.buffers[name];
      this.setBuffer(name, buffer.data);
    });

    this.setBuffer(null);
  }

  createTexture(src) {
    const gl = this.gl;
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    this.texture = texture;

    if (src) {
      this.uniforms.hasTexture = 1;
      this.loadTexture(src);
    }
  }

  loadTexture(src) {
    const gl = this.gl;
    const texture = this.texture;

    const image = new Image();

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    image.src = src;
  }

  update() {
    const gl = this.gl;

    const now = performance.now();
    const time = (now - this.time.start) / 5000;
    const delta = now - this.time.old;

    this.time.old = now;

    this.uniforms.time = time;

    if (this.count > 0) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, this.count);
    }

    this.onUpdate(delta);

    requestAnimationFrame(this.update);
  }
}

/**
 * WaveEffect - Create a wave animation in a container element
 * @param {string|HTMLElement} selector - CSS selector or DOM element to contain the wave
 * @param {Object} options - Configuration options
 * @returns {Object} - The wave instance with control methods
 */
function WaveEffect(selector, options = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;

  if (!container) {
    // Use unified error handler for missing wave container
    ErrorHandler.ui('Wave container element not found', {
        source: 'wave_initialization',
        severity: ErrorHandler.SEVERITY.LOW,
        context: { selector: '.wave-container' }
    });
    return null;
  }

  // Default particle texture - a circular gradient
  const defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8v0wLRAAAAJHRSTlMAC/goGvDhmwcExrVjWzrm29TRqqSKenRXVklANSIUE8mRkGpv+HOfAAABCElEQVQ4y4VT13LDMAwLrUHteO+R9f/fWMfO6dLaPeKVEECRxOULWsEGpS9nULDwia2Y+ALqUNbAWeg775zv+sA4/FFRMxt8U2FZFCVWjR/YrH4/H9sarclSKdPMWKzb8VsEeHB3m0shkhVCyNzeXeAQ9Xl4opEieX2QCGnwGbj6GMyjw9t1K0fK9YZunPXeAGsfJtYjwzxaBnozGGorYz0ypK2HzQSYx1y8DgSRo2ewOiyh2QWOEk1Y9OrQV0a8TiBM1a8eMHWYnRMy7CZ4t1CmyRkhSUvP3gRXyHOCLBxNoC3IJv//ZrJ/kxxUHPUB+6jJZZHrpg6GOjnqaOmzp4NDR48OLxn/H27SRQ08S0ZJAAAAAElFTkSuQmCC';

  // Default configuration
  const defaultOptions = {
    texture: defaultTexture,
    speed: 5,
    size: 2.5,
    backgroundColor: null,
    color1: [0, 0.5, 1, 0.5],  // Blue
    color2: [0, 1, 0.5, 0.5],  // Teal
    density: 5, // Point density (higher = more dense)
    depth: 400
  };

  // Merge options
  const config = { ...defaultOptions, ...options };

  // Set background color if provided
  if (config.backgroundColor) {
    container.style.backgroundColor = config.backgroundColor;
  }

  // Configure color gradient (start, end)
  const colorStart = config.color1;
  const colorEnd = config.color2;

  // Create wave instance
  const waves = new ShaderProgram(container, {
    texture: config.texture,
    uniforms: {
      size: { type: 'float', value: config.size },
      field: { type: 'vec3', value: [0, 0, 0] },
      speed: { type: 'float', value: config.speed }
    },
    vertex: `
      #define M_PI 3.1415926535897932384626433832795

      precision highp float;

      attribute vec4 a_position;
      attribute vec4 a_color;

      uniform float u_time;
      uniform float u_size;
      uniform float u_speed;
      uniform vec3 u_field;
      uniform mat4 u_projection;

      varying vec4 v_color;

      void main() {

        vec3 pos = a_position.xyz;

        pos.y += (
          cos(pos.x / u_field.x * M_PI * 8.0 + u_time * u_speed) +
          sin(pos.z / u_field.z * M_PI * 8.0 + u_time * u_speed)
        ) * u_field.y * 0.8; /* Decreased amplitude for smaller waves */

        gl_Position = u_projection * vec4( pos.xyz, a_position.w );
        gl_PointSize = ( u_size / gl_Position.w ) * 100.0;

        v_color = a_color;

      }`,
    fragment: `
      precision highp float;

      uniform sampler2D u_texture;

      varying vec4 v_color;

      void main() {
        gl_FragColor = v_color * texture2D(u_texture, gl_PointCoord);
      }`,
    onResize(w, h, dpr) {
      const positions = [];
      const colors = [];
      const width = w * 0.5;

      const width_factor = width / h * config.depth;
      const density = config.density;

      for (let x = 0; x < width_factor; x += density) {
        for (let z = 0; z < config.depth; z += density) {
          positions.push(-width_factor / 2 + x, -30, -200 + z);

          // Calculate gradient color based on position
          const gradientFactor = x / width_factor;
          const r = colorStart[0] * (1 - gradientFactor) + colorEnd[0] * gradientFactor;
          const g = colorStart[1] * (1 - gradientFactor) + colorEnd[1] * gradientFactor;
          const b = colorStart[2] * (1 - gradientFactor) + colorEnd[2] * gradientFactor;
          const a = colorStart[3] * (1 - gradientFactor) + colorEnd[3] * gradientFactor;

          colors.push(r, g, b, a);
        }
      }

      this.uniforms.field = [width_factor, 3, config.depth]; // Decreased back to 3 for smaller waves
      this.buffers.position = positions;
      this.buffers.color = colors;
      this.uniforms.size = h / config.depth * config.size * dpr;
    }
  });

  // Return API for controlling the wave
  return {
    container,
    waves,

    // Change speed of the wave
    setSpeed(speed) {
      waves.uniforms.speed = speed;
    },

    // Change size of particles
    setSize(size) {
      waves.uniforms.size = size;
    },

    // Destroy the wave effect
    destroy() {
      if (waves.canvas && waves.canvas.parentNode) {
        waves.canvas.parentNode.removeChild(waves.canvas);
      }
      waves.gl = null;
      waves.canvas = null;
      waves.texture = null;
    }
  };
}

// Export WaveEffect as global function
window.WaveEffect = WaveEffect;
