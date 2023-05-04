import { menu } from './helpers/matrixUser.js';
import { color } from './helpers/matrixColor.js';

// Nettoyer la console
console.clear();

// Introduction du programme
console.log(color.white + 'Bienvenue dans le programme de manipulation d\'automates !');
console.log('Ce programme vous permet de manipuler des automates afin de les ' + color.brightCyan + 'déterminiser, les compléter, les standardiser, etc' + color.white + '.');
console.log('Pour commencer, veuillez ' + color.brightCyan + 'choisir' + color.white + ' un automate à manipuler.\n');

menu();
