module.exports = (api) => {
  const presetEnv = [
    '@babel/preset-env',
    {
      targets: {
        node: '8'
      }
    }
  ]

  return {
    presets: api.env('development') ? [presetEnv, 'power-assert'] : [presetEnv]
  }
}
