import { Automate } from '../helpers/matrixClass.js';
import readline from 'readline';
import { isStandard, isDeterministe, isComplet } from '../helpers/matrixVerification.js';
import { color } from '../helpers/matrixColor.js';

export function promptUserNumber(maxNumber) {

    // Créer un interface de lecture
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Fonction qui sera appelée lorsque la promesse sera résolue
    let resolveFn;
    
    // Fonction qui demande à l'utilisateur de saisir un chiffre
    function askForNumber(maxNumber) {
      rl.question(color.brightCyan + "> " + color.white + "Veuillez saisir un chiffre (entre 1 et " + maxNumber + "): ", (id) => {
        if (isNaN(id)) {
            console.log(color.brightRed + "La saisie doit être un chiffre." + color.white);
            askForNumber(maxNumber);
        } 
        else if (id < 1) {
            console.log(color.brightRed + "La saisie doit être un chiffre supérieur à 0." + color.white);
            askForNumber(maxNumber);
        }
        else if (id > maxNumber) {
            console.log(color.brightRed + "La saisie doit être un chiffre inférieur à " + maxNumber + "." + color.white);
            askForNumber(maxNumber);
        }
        else {
          rl.close();
          resolveFn(Number(id));
        }
      });
    }
    
    // Créer une promesse (qui sera résolue par la fonction askForNumber)
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
      askForNumber(maxNumber);
    });
  
    return promise;
  }

// Menu principal
export async function menu() {

    // Demande à l'utilisateur de saisir l'ID de l'automate
    let automate = await Automate.chargerAutomate();

    // Nettoyer la console
    console.clear();

    // Afficher le menu
    console.log(color.white + 'Que voulez-vous faire ? (Sélection: Automate ' + color.brightCyan + automate.id + color.white + ')');
    console.log(color.brightCyan + '1. ' + color.white + 'Afficher l\'automate');
    console.log(color.brightCyan + '2. ' + color.white + 'Déterminiser l\'automate');
    console.log(color.brightCyan + '3. ' + color.white + 'Compléter & déterminiser l\'automate');
    console.log(color.brightCyan + '4. ' + color.white + 'Standardiser l\'automate');
    console.log(color.brightCyan + '5. ' + color.white + 'Quitter');

    // Demande à l'utilisateur de saisir l'action à effectuer
    const action = await promptUserNumber(5);

    // Exécuter l'action
    switch (action) {
        // Afficher l'automate
        case 1:
            console.clear();
            automate.afficherTableauAutomate();
            break;

        // Déterminiser l'automate
        case 2:
            console.clear();
            if (isDeterministe(automate)) {
                console.log('L\'automate ' + automate.id + ' est déjà déterministe.');
            }
            else {
                automate.afficherTableauAutomate();
                console.log('L\'automate ' + automate.id + ' est non-déterministe.');
                automate.determiniser();
                automate.afficherTableauAutomate();
            }
            break;
        
        // Compléter & déterminiser l'automate
        case 3:
            console.clear();
            if (isComplet(automate)) {
                console.log('L\'automate ' + automate.id + ' est déjà complet.');
            }
            else {
                automate.afficherTableauAutomate();
                console.log('L\'automate ' + automate.id + ' est non-complet.');
                automate.completer();
                automate.afficherTableauAutomate();
            }
            break;
        
        // Standardiser l'automate
        case 4:
            console.clear();
            if (isStandard(automate)) {
                console.log('L\'automate ' + automate.id + ' est déjà standard.');
            }
            else {
                automate.afficherTableauAutomate();
                console.log('L\'automate ' + automate.id + ' est non-standard.');
                automate.standardiser();
                automate.afficherTableauAutomate();
            }
            break;
        
        // Quitter le programme
        case 5:
            console.clear();
            console.log(color.brightGreen + 'Merci d\'avoir utilisé notre programme. A bientôt !' + color.white);
            process.exit(0);

        // Inutilisé mais au cas où
        default:
            console.log('Choix invalide. Veuillez choisir entre 1 et 5.');
            break;
    }

    // Demande à l'utilisateur de saisir un automate
    console.log('\nSELECTION D\'AUTOMATE');
    menu();
}
