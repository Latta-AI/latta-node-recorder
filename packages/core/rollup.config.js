import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const packageJson = require('./package.json');

const apiUrl = process.env.API_URL;

if (!apiUrl)
  throw new Error("API_URL variable missing");

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: "inline",
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: "inline",
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({
        "process.env.API_URL": `"${apiUrl}"`,
        preventAssignment: true
      }),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  }
];