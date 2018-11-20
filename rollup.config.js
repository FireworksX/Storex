import typescript from 'rollup-plugin-typescript'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/index.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'umd'
    },
    moduleName: 'Storex',
    plugins: [
        typescript(),
        serve('dist')
    ]
}