import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'build/index.js',
    output: {file: 'build/bundle.js', format: 'cjs'},
};