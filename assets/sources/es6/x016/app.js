import Utils from '../utils/Utils'

const PROJECT_CODE = 'x016'

var init = function() {
  let c = document.getElementById('canvas')
  c.width = 300
  c.height = 300

  let gl = c.getContext('webgl') || c.getContext('experimental-webgl')
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

    let vertex_position = [
      0.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
    ]
    let vertex_color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
    ]

    // VBOの生成
    let position_vbo = create_vbo(gl, vertex_position)
    let color_vbo = create_vbo(gl, vertex_color)

    // bind positon vbo
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo)
    gl.enableVertexAttribArray(attLocation[0])
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0)

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
    m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix)
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix)
    m.multiply(pMatrix, vMatrix, tmpMatrix)
    // model one
    m.translate(mMatrix, [1.5, 0.0, 0.0], mMatrix)
    m.multiply(tmpMatrix, mMatrix, mvpMatrix)
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // model two
    m.identity(mMatrix)
    m.translate(mMatrix, [-1.5, 0.0, 0.0], mMatrix)
    m.multiply(tmpMatrix, mMatrix, mvpMatrix)

    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // uniformLocationの取得
    // コンテキストの再描画
    gl.flush()
  })
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
