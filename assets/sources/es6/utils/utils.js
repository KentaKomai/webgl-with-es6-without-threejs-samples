
export const SHARDER_ROOT = '/assets/dist/shader/'

export var get_shader_src = function(filename) {
  let url = SHARDER_ROOT + filename
  return fetch(url).then( src => src.text() )
}

export var create_vertex_shader = function(gl_context, shader_src) {
  let shader = gl_context.createShader(gl_context.VERTEX_SHADER)
  return create_shader(gl_context, shader, shader_src)
}

export var create_fragment_shader = function(gl_context, shader_src) {
  let shader = gl_context.createShader(gl_context.FRAGMENT_SHADER)
  return create_shader(gl_context, shader, shader_src)
}

export var create_program = function(gl_context, vertex_shader, fragment_shader){
  let program = gl_context.createProgram()
  gl_context.attachShader(program, vertex_shader)
  gl_context.attachShader(program, fragment_shader)
  gl_context.linkProgram(program)

  if(gl_context.getProgramParameter(program, gl_context.LINK_STATUS)) {
    gl_context.useProgram(program)
    return program
  }else{
    throw `failed create_program: ${gl_context.getProgramParameter(program, gl_context.LINK_STATUS)}`
  }
}

export var create_vbo = function(gl_context, data) {
  let vbo = gl_context.createBuffer()

  gl_context.bindBuffer(gl_context.ARRAY_BUFFER, vbo)
  gl_context.bufferData(gl_context.ARRAY_BUFFER, new Float32Array(data), gl_context.STATIC_DRAW)
  gl_context.bindBuffer(gl_context.ARRAY_BUFFER, null)

  return vbo
}

function create_shader(gl_context, shader,  shader_src) {
  gl_context.shaderSource(shader, shader_src)
  gl_context.compileShader(shader)
  if(gl_context.getShaderParameter(shader, gl_context.COMPILE_STATUS)){
    return shader
  }else{
    throw `failed create_sharder: ${gl_context.getShaderParameter(shader, gl_context.COMPILE_STATUS)}`
  }
}

var Utils = {
  create_vertex_shader: create_vertex_shader,
  create_fragment_shader: create_fragment_shader,
  get_shader_src: get_shader_src,
  create_program: create_program,
  create_vbo: create_vbo
}
export default Utils
