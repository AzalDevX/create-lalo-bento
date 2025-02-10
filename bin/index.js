#!/usr/bin/env node

import { exec } from 'child_process';
import { join, resolve } from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import ora from 'ora';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';

const REPO_URL = 'https://github.com/AzalDevX/bento-portfolio.git';

// Spinner de carga
const spinner = ora();

// Función para mostrar el título bonito ✨
function showTitle() {
  console.clear();
  console.log(
    gradient.pastel(
      figlet.textSync('Bento Portfolio', { horizontalLayout: 'full' })
    )
  );
  console.log(chalk.cyan('\n🚀 Generador Automático de Bento Portfolio\n'));
}

// Función para preguntar la ruta de descarga
async function askDownloadPath() {
  const { downloadPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'downloadPath',
      message: '📁 Ingresa la ruta donde quieres descargar el portfolio:',
      default: process.cwd(),
      validate: (input) =>
        fs.existsSync(input) || '⚠️ La ruta no existe. Intenta nuevamente.',
    },
  ]);
  return resolve(downloadPath);
}

// Función principal
async function main() {
  showTitle();

  // Animación de bienvenida
  const welcomeAnimation = chalkAnimation.rainbow(
    '\n✨ ¡Bienvenido al generador de Bento Portfolio! ✨\n'
  );
  await new Promise((resolve) => setTimeout(resolve, 2000));
  welcomeAnimation.stop();

  // Preguntar la ruta de descarga
  const downloadPath = await askDownloadPath();
  const targetDir = join(downloadPath, 'bento-portfolio');

  // Verificar si la carpeta ya existe
  if (fs.existsSync(targetDir)) {
    const { removeExisting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'removeExisting',
        message:
          "⚠️ La carpeta 'bento-portfolio' ya existe. ¿Quieres eliminarla y continuar?",
        default: false,
      },
    ]);

    if (removeExisting) {
      spinner.start('🗑 Eliminando carpeta existente...');
      fs.removeSync(targetDir);
      spinner.succeed('✅ Carpeta eliminada.');
    } else {
      console.log(
        chalk.yellow('⚠️ Instalación cancelada. La carpeta ya existe.')
      );
      process.exit(0);
    }
  }

  // Clonar el repositorio
  spinner.start('📥 Clonando Bento Portfolio...');
  try {
    await simpleGit().clone(REPO_URL, targetDir);
    spinner.succeed('✅ Repositorio clonado correctamente.');
  } catch (error) {
    spinner.fail('❌ Error clonando el repositorio.');
    console.error(error);
    process.exit(1);
  }

  // Pedir rutas de archivos generados
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'dataPath',
      message: '📁 Ingresa la ruta del archivo personal-data.json:',
      validate: (input) =>
        fs.existsSync(input) || '⚠️ El archivo no existe. Intenta nuevamente.',
    },
    {
      type: 'input',
      name: 'tailwindPath',
      message: '📁 Ingresa la ruta del archivo tailwind.config.mjs:',
      validate: (input) =>
        fs.existsSync(input) || '⚠️ El archivo no existe. Intenta nuevamente.',
    },
  ]);

  // Copiar archivos al proyecto clonado
  spinner.start('📂 Copiando archivos...');
  try {
    fs.copySync(
      answers.dataPath,
      join(targetDir, 'src', 'data', 'personal-data.json')
    );
    fs.copySync(answers.tailwindPath, join(targetDir, 'tailwind.config.mjs'));
    spinner.succeed('✅ Archivos copiados correctamente.');
  } catch (error) {
    spinner.fail('❌ Error copiando los archivos.');
    console.error(error);
    process.exit(1);
  }

  // Instalar dependencias
  spinner.start('📦 Instalando dependencias...');
  exec('npm install', { cwd: targetDir }, (error, stdout, stderr) => {
    if (error) {
      spinner.fail('❌ Error instalando dependencias.');
      console.error(error);
      return;
    }
    spinner.succeed('✅ Dependencias instaladas.');

    // Mensaje final con estilo y spam
    console.log(
      gradient.pastel('\n🎉 ¡Bento Portfolio está listo para usarse! 🎉')
    );
    console.log(
      chalk.yellow(
        `\n📂 Dirígete a la carpeta: ${chalk.bold(`cd ${targetDir}`)}`
      )
    );
    console.log(
      chalk.cyan('▶️ Para iniciar el servidor: ') +
        chalk.green.bold('npm run dev\n')
    );
    console.log(chalk.bold.green('🔥 ¡Construye tu portafolio ahora mismo!'));
    console.log(
      chalk.cyan('\n💡 ¿Necesitas un portafolio profesional y personalizable?')
    );
    console.log(
      chalk.magenta.bold('🚀 Visita mi portafolio en: https://lalo.lol/me')
    );
    console.log(
      chalk.yellow.bold(
        '\n⚡ Proyecto Lalo: https://lalo.lol/generator para más herramientas de desarrollo.'
      )
    );
    console.log(
      chalk.green('\n📣 ¡Haz crecer tu presencia online con Bento Portfolio!')
    );
  });
}

main();
