import Utils from '../utils/Utils'

/** カリングと深度テスト */

const PROJECT_CODE = 'x020'

var init = function() {
  let c = document.getElementById('canvas')
  c.width = 500
  c.height = 300

  var gl = c.getContext('webgl') || c.getContext('experimental-webgl')
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // 頂点シェーダとフラグメントシェーダの生成
  let v_shader_request = Utils.get_shader_src(`${PROJECT_CODE}/BasicVertexShader.vert`)
  let f_shader_request = Utils.get_shader_src(`${PROJECT_CODE}/BasicFragmentShader.frag`)
  Promise.all([v_shader_request, f_shader_request]).then(values => {
    let v_shader = Utils.create_vertex_shader(gl, values[0])
    let f_shader = Utils.create_fragment_shader(gl, values[1])
    let prg = create_program(gl, v_shader, f_shader)
    let attLocation = new Array(2)
    attLocation[0] = gl.getAttribLocation(prg, 'position')
    attLocation[1] = gl.getAttribLocation(prg, 'color')
    let attStride = new Array(2)
    attStride[0] = 3
    attStride[1] = 4

    let tourus_model_data = torus_model(32, 32, 1.0, 2.0)
    let vertex_position =  tourus_model_data[0]
    let vertex_color =  tourus_model_data[1]
    let index = tourus_model_data[2]

    // VBOの生成
    let position_vbo = create_vbo(gl, vertex_position)
    let color_vbo = create_vbo(gl, vertex_color)
    let position_ibo = Utils.create_ibo(gl, index)

    // bind positon vbo
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo)
    gl.enableVertexAttribArray(attLocation[0])
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0)

    // bind index buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, position_ibo)

    // bind color vbo
    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo)
    gl.enableVertexAttribArray(attLocation[1])
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0)

    // 各種行列の生成と初期化
    let uniLocation = gl.getUniformLocation(prg, 'mvpMatrix')
    let m = new matIV()
    let mMatrix = m.identity(m.create())
    let vMatrix = m.identity(m.create())
    let pMatrix = m.identity(m.create())
    let tmpMatrix = m.identity(m.create())
    let mvpMatrix = m.identity(m.create())

    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix)
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix)
    m.multiply(pMatrix, vMatrix, tmpMatrix)

    var count = 0

    gl.depthFunc(gl.LEQUAL)

    var loop = function(){

      gl.enable(gl.CULL_FACE)
      gl.enable(gl.DEPTH_TEST)

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clearDepth(1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      count++

      // model one(circle)
      let rad = (count % 360) * Math.PI / 180
      m.identity(mMatrix)
      m.rotate(mMatrix, rad, [1, 1, 1], mMatrix)
      m.multiply(tmpMatrix, mMatrix, mvpMatrix)
      gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)

      gl.flush()

      setTimeout(loop, 1000/ 60)
    }
    loop()
  })
}

var torus_model = function(row, column, irad, orad) {
  let position = new Array()
  let color = new Array()
  let index = new Array()

  for(let i=0; i<=row; i++) {
    let r = Math.PI * 2 / row * i
    let rr = Math.cos(r)
    let ry = Math.sin(r)
    for(let ii=0; ii<=column; ii++) {
      let tr = Math.PI * 2 / column * ii
      let tx = (rr * irad + orad) * Math.cos(tr)
      let ty = ry * irad
      let tz = (rr * irad + orad) * Math.sin(tr)
      position.push(tx, ty, tz)
      let tc = hsva(360 / column * ii, 1,1,1)
      color.push(tc[0], tc[1], tc[2], tc[3])
    }
  }

  for(let i=0; i<row; i++) {
    for(let ii=0; ii<column; ii++) {
      let r = (column + 1) * i + ii
      index.push(r, r+column + 1, r+1)
      index.push(r + column + 1, r+column+2, r+1)
    }
  }
  return [position, color, index]
}

function hsva(h, s, v, a){
  if(s > 1 || v > 1 || a > 1){return}
  var th = h % 360
  var i = Math.floor(th / 60)
  var f = th / 60 - i
  var m = v * (1 - s)
  var n = v * (1 - s * f)
  var k = v * (1 - s * (1 - f))
  var color = new Array()
  if(!s > 0 && !s < 0){
    color.push(v, v, v, a)
  } else {
    var r = new Array(v, n, m, m, k, v)
    var g = new Array(k, v, v, n, m, m)
    var b = new Array(m, m, k, v, v, n)
    color.push(r[i], g[i], b[i], a)
  }
  return color
}

// プログラムオブジェクトを生成しシェーダをリンクする関数
var create_program = function(gl, vs, fs){
  let program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if(gl.getProgramParameter(program, gl.LINK_STATUS)){
    gl.useProgram(program)
    return program
  }else{
    alert(gl.getProgramInfoLog(program))
  }
}

// VBOを生成する関数
var create_vbo = function (gl, data){
  let vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return vbo
}

onload = init()
