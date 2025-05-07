import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import typescript from '@rollup/plugin-typescript';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from "@rollup/plugin-replace";
import inject from "@rollup/plugin-inject";

const isDev = process.env.NODE_ENV === 'development';

const extensions = ['.ts', '.tsx'];

const indexConfig = {
  context: 'this',
  plugins: [
    resolve({ 
      extensions,
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    uglify(),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],      
      extensions,
    }),
    postcss({
      plugins: [autoprefixer(), tailwindcss()],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: true,
      inject: false,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**']
    }),
    typescriptPaths({ preserveExtensions: true }),
    terser({ output: { comments: false } }),
    ...(isDev
      ? [
          serve({
            open: true,
            verbose: true,
            contentBase: ['dist', 'public'],
            host: 'localhost',
            port: 5678,
          }),
          livereload({ watch: 'dist' }),
        ]
      : []),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      preventAssignment: true
    }),
    inject({
      ReactDOM: 'react-dom'
    })
  ],
  external: [],
  output: {
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
    format: 'es',
    sourcemap: true
  },
  onwarn(warning, warn) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  }
};

const configs = [
  {
    ...indexConfig,
    input: './src/web.ts',
    output: [
      {
        file: 'dist/web.js',
        format: 'es',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        sourcemap: true
      },
      {
        file: 'dist/web.umd.js',
        format: 'umd',
        name: 'FlowiseEmbed',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        sourcemap: true
      }
    ]
  },
  {
    ...indexConfig,
    input: './src/mockChatService.ts',
    output: {
      file: 'dist/mockChatService.js',
      format: 'es',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      },
      sourcemap: true
    },
  },
];

export default configs;
