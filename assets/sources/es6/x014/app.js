import Utils from '../utils/Utils'

var init = function() {
  let c = document.getElementById('canvas')
  c.width = 300
  c.height = 300

  let gl = c.getContext('webgl') || c.getContext('experimental-webgl')
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // 頂点シェーダとフラグメントシェーダの生成
  let v_shader_request = Utils.get_shader_src('x014/BasicVertexShader.vert')
  let f_shader_request = Utils.get_shader_src('x014/BasicFragmentShader.frag')
  Promise.all([v_shader_request, f_shader_request]).then(values => {
    let v_shader = Utils.create_vertex_shader(gl, values[0])
    let f_shader = Utils.create_fragment_shader(gl, values[1])

    let prg = create_program(gl, v_shader, f_shader)
    let attLocation = gl.getAttribLocation(prg, 'position')
    let attStride = 3
    let vertex_position = [
      0.0, 1.0, 0.0,
      1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0
    ]

    // VBOの生成
    let vbo = create_vbo(gl, vertex_position)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.enableVertexAttribArray(attLocation)
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0)

    // 各種行列の生成と初期化
    let m = new matIV()
    let mMatrix = m.identity(m.create())
    let vMatrix = m.identity(m.create())
    let pMatrix = m.identity(m.create())
    let mvpMatrix = m.identity(m.create())

    // ビュー座標変換行列
    m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix)
    // プロジェクション座標変換行列
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix)
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(pMatrix, vMatrix, mvpMatrix)
    m.multiply(mvpMatrix, mMatrix, mvpMatrix)

    // uniformLocationの取得
    let uniLocation = gl.getUniformLocation(prg, 'mvpMatrix')
    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    // モデルの描画
    gl.drawArrays(gl.TRIANGLES, 0, 3)
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
