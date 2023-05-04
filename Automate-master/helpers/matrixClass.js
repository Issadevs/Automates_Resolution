import fs from 'fs';
import { promptUserNumber } from './matrixUser.js';
import { isStandard, isDeterministe } from './matrixVerification.js';
import { color } from './matrixColor.js';
import { type } from 'os';

export class Automate {

    // Structure de l'automate
    constructor(etats, alphabet, transitions, etatsInitiaux, etatsFinaux, id) {
      this.etats = etats;
      this.alphabet = alphabet;
      this.transitions = transitions;
      this.etatsInitiaux = etatsInitiaux;
      this.etatsFinaux = etatsFinaux;
      this.id = id;
    }

    // Fonction qui lit l'automate depuis un fichier JSON
    static lireAutomate(cheminString) {
        // Lire la matrice
        const fichier = fs.readFileSync(cheminString);
        const automateJSON = JSON.parse(fichier);
        // Assigner les valeurs de la matrice
        const etats = automateJSON.etats;
        const alphabet = automateJSON.alphabet;
        const transitions = automateJSON.transitions;
        const etatsInitiaux = automateJSON.etat_initial;
        const etatsFinaux = automateJSON.etats_finaux;
        const id = automateJSON.id;
        return new Automate(etats, alphabet, transitions, etatsInitiaux, etatsFinaux, id);
    }
    
    // Fonction qui demande à l'utilisateur de saisir l'ID de l'automate (puis charger l'automate)
    static async chargerAutomate() {

        // Demander à l'utilisateur de saisir l'ID de l'automate
        // (Vérifier également si la saisie est un chiffre)

        const automateID = await promptUserNumber(44);

        // Charger l'automate
        const automate = Automate.lireAutomate(`automata/F-${automateID}.json`);

        // Assigner les valeurs de l'automate chargé à l'automate actuel
        this.etats = automate.etats;
        this.alphabet = automate.alphabet;
        this.transitions = automate.transitions;
        this.etatsInitiaux = automate.etatsInitiaux;
        this.etatsFinaux = automate.etatsFinaux;

        return automate;
    }

    // Fonction qui écrit l'automate dans un fichier JSON (Sauter la ligne seulement s'il y a des caractères '{' et/ou '}')
    // (Inutilisée)
    static ecrireAutomate(nomFichierString) {
        const automateJSON = {
            etats: this.etats,
            alphabet: this.alphabet,
            transitions: this.transitions,
            etat_initial: this.etatsInitiaux,
            etats_finaux: this.etatsFinaux
        };
        const automateString = JSON.stringify(automateJSON, null, 2);
        fs.writeFileSync(nomFichierString, automateString);
    }

    // Fonction qui affiche l'automate
    afficherAutomate() {
        console.log('Automate:');
        console.log(this.etats);
        console.log(this.alphabet);
        console.log(this.transitions);
        console.log(this.etatsInitiaux);
        console.log(this.etatsFinaux);
    }

    // Fonction qui affiche l'automate sous forme de tableau
    afficherTableauAutomate() {

        // Créer un tableau de transition
        const table = {};
        
        for (const etat of this.etats) {
            // Ajoute le préfixe "E-" aux états initiaux et "S-" aux états finaux
            // Si c'est une liste, ajouter le préfixe "E-" aux états initiaux et "S-" aux états finaux (premier élément)
            let label = etat;
            // S'il y a une présence de virgule, prendre chaucun des états séparés par une virgule puis vérifier si l'un d'eux est un état initial ou final
            // Si c'est le cas, ajouter le préfixe "E-" ou "S-" au label

            // Séparer les états par une virgule
            const etats = etat.split(',');

            // Pour chaque état, vérifier si c'est un état initial ou final
            // Si c'est le cas, ajouter le préfixe "E-" ou "S-" au label
            for (const etat of etats) {
                let state = 0;
                if (this.etatsInitiaux.includes(etat)) {
                    label = 'E-' + label;
                    state = 1;
                }
                if (this.etatsFinaux.includes(etat)) {
                    label = 'S-' + label;
                    state = 1;
                }
                if (state == 1) break;
            }
            
            // Crée une nouvelle ligne dans le tableau
            table[label] = {};
            
            // Ajoute les transitions pour chaque symbole
            for (const symbole of this.alphabet) {

              // Vérifie si l'état existe
              if (this.transitions[etat] === undefined) {
                table[label][symbole] = '-';
                continue;
              }

              const destinations = this.transitions[etat][symbole]

              // Vérifie si l'état a une transition pour le symbole
                if (destinations === undefined) {
                    table[label][symbole] = '-';
                    continue;
                }
                else {
                    table[label][symbole] = destinations.join(', ');
                }
            }
          }
        
        // Afficher le tableau de transition avec les libellés "Entrée" et "Sortie"
        console.log('Table de transition de l\'automate ' + color.brightCyan + this.id + color.white + ':');
        console.table(table, [...this.alphabet]);
    }


    // Fonction qui prend un automate en argument et le standardise
    // Fonctionnement : crée un nouvel état d'entrée i qui prend les transitions de sortie des états initiaux d'entrée de l'automate de base
    standardiser() {
      // Vérifie si l'automate est standard
      if (isStandard(this)) return this;
    
      // Créer un nouvel état i et ajouter ses transitions
      const i = 'i';
      this.etats.push(i);
      this.transitions[i] = {};
    
      // Ajouter les transitions de sortie des états initiaux à i
      for (const etatInitial of this.etatsInitiaux) {
        const transitions = this.transitions[etatInitial];
        for (const symbole of Object.keys(transitions)) {
          if (!this.transitions[i][symbole]) {
            this.transitions[i][symbole] = [];
          }
          this.transitions[i][symbole] = this.transitions[i][symbole].concat(transitions[symbole]);
        }
      }
    
      // Ajouter i aux états initiaux
      this.etatsInitiaux = [i];
    
      return this;
    }

    // Fonction qui prend un automate en argument et le déterminise
    // Regroupez tous les états initiaux en un seul état appelé état initial.
    // Pour chaque symbole de l'alphabet, trouvez tous les états accessibles à partir des états actuels et créez un nouvel état pour représenter cette transition.
    // Identifiez tous les états finaux qui peuvent être atteints à partir des états nouvellement créés.
    // Simplifiez l'automate en éliminant les états inutiles, c'est-à-dire les états qui ne sont pas atteints à partir de l'état initial ou qui ne mènent pas à un état final.
    determiniser() {

      // Vérifie si l'automate est déterministe
      if (isDeterministe(this)) return this;

      // ETAPE 1
      // Regroupement des états initiaux
      const etatInitial = this.etatsInitiaux.join(',');

      // Création d'un nouvel automate
      const nouvelAutomate = new Automate([etatInitial], this.alphabet, {}, [etatInitial], []);

      // Ajouter les transitions de sortie des états initiaux à l'état initial
      for (const etat of this.etatsInitiaux) {
        const transitions = this.transitions[etat];
        for (const symbole of Object.keys(transitions)) {
          if (!nouvelAutomate.transitions[etatInitial]) {
            nouvelAutomate.transitions[etatInitial] = {};
          }
          if (!nouvelAutomate.transitions[etatInitial][symbole]) {
            nouvelAutomate.transitions[etatInitial][symbole] = [];
          }
          nouvelAutomate.transitions[etatInitial][symbole] = nouvelAutomate.transitions[etatInitial][symbole].concat(transitions[symbole]);
        }
      }



      // Création d'une pile stockant les états à traiter
      const pileEtats = [etatInitial];
      const etatsTraites = [];

      // Tant que la pile n'est pas vide, on traite les états
      while (pileEtats.length > 0) {
        const etatCourant = pileEtats.pop();
        etatsTraites.push(etatCourant);
        for (const symbole of this.alphabet) {
          // etatsAccessibles contient tous les états accessibles à partir de l'état courant
          const etatsAccessibles = [];
          for (const etat of etatCourant.split(',')) {
            // Si l'état courant a une transition pour le symbole, on ajoute les états accessibles à partir de cet état
            if (this.transitions[etat] && this.transitions[etat][symbole]) {
              etatsAccessibles.push(...this.transitions[etat][symbole]);
            }
          }
          // On filtre les doublons pour éviter les boucles infinies
          const nouveauxEtatsAccessibles = [...new Set(etatsAccessibles)];
          // Tant qu'il y a des états accessibles, on les ajoute à la pile
          if (nouveauxEtatsAccessibles.length > 0) {
            // On crée un nouvel état à partir des états accessibles et on l'ajoute à la pile
            const nouvelEtat = nouveauxEtatsAccessibles.sort().join(',');
            // Si l'état n'a pas déjà été traité, on l'ajoute à la pile
            if (!nouvelAutomate.etats.includes(nouvelEtat)) {
              nouvelAutomate.etats.push(nouvelEtat);
              nouvelAutomate.transitions[nouvelEtat] = {};
              pileEtats.push(nouvelEtat);
            }
            nouvelAutomate.transitions[etatCourant][symbole] = [nouvelEtat];
          }
        }
      }

      // Assigner les états finaux
      this.etats = nouvelAutomate.etats;
      this.transitions = nouvelAutomate.transitions;
      
    }

    // Cette fonction prend un mot en entrée et retourne true si le mot est reconnu par l'automate, sinon elle retourne false.
    estReconnu(mot) {
      // On initialise les états courants avec les états initiaux de l'automate.
      let etatsCourants = this.etatsInitiaux;
      // On initialise l'indice de la lettre courante à 0.
      let lettreCouranteIndex = 0;
      
      // Tant que l'indice de la lettre courante est inférieur à la longueur du mot.
      while (lettreCouranteIndex < mot.length) {
        // On initialise une nouvelle liste d'états courants.
        let nouvelleListeEtatsCourants = [];
        // Pour chaque état courant.
        for (let i = 0; i < etatsCourants.length; i++) {
          // On récupère les transitions à partir de cet état.
          let transitions = this.transitions[etatsCourants[i]];
          // Pour chaque transition.
          for (let j = 0; j < transitions.length; j++) {
            // Si la lettre de la transition correspond à la lettre courante du mot.
            if (transitions[j].lettre === mot[lettreCouranteIndex]) {
              // On ajoute l'état de destination de la transition à la nouvelle liste d'états courants.
              nouvelleListeEtatsCourants.push(transitions[j].etat);
            }
          }
        }
        // Si la nouvelle liste d'états courants est vide.
        if (nouvelleListeEtatsCourants.length === 0) {
          // Le mot n'est pas reconnu par l'automate, on retourne false.
          return false;
        }
        // On met à jour les états courants avec la nouvelle liste d'états courants.
        etatsCourants = nouvelleListeEtatsCourants;
        // On passe à la lettre suivante du mot.
        lettreCouranteIndex++;
      }
      
      // On parcourt tous les états courants.
        for (let i = 0; i < etatsCourants.length; i++) {
        // Si un état courant est un état final de l'automate.
        if (this.etatsFinaux.indexOf(etatsCourants[i]) !== -1) {
        // Le mot est reconnu par l'automate, on retourne true.
        return true;
        }
      }
      
      // Le mot n'est pas reconnu par l'automate, on retourne false.
      return false;
    }


    // Fonction qui prend un automate en argument et inverse les sorties de celle-ci (Celles qui ne sont pas des sorties deviennent des sorties et vice versa)
    inverserSorties() {
      // Créer un automate temporaire
      const automateTemporaire = new Automate(this.etats, this.alphabet, this.transitions, this.etatsInitiaux, this.etatsFinaux);

      // Inverser les sorties
      automateTemporaire.etatsFinaux = automateTemporaire.etats.filter(etat => !automateTemporaire.etatsFinaux.includes(etat));

      // Assigner les nouvelles sorties
      this.etatsFinaux = automateTemporaire.etatsFinaux;
    }

    completer() {
      // Déterminiser l'automate
      this.determiniser();

      // Créer l'état poubelle P
      const p = 'P';
      this.etats.push(p);
      this.transitions[p] = {};

      // Modifier les transitions '-' (nulles) vers l'état poubelle P
      for (const etat of this.etats) {
        for (const symbole of this.alphabet) {
          if (!this.transitions[etat][symbole]) {
            this.transitions[etat][symbole] = [p];
          }
        }
      }
    }

    complementariser() {
      // Déterminiser l'automate et inverser les sorties
      this.determiniser();
      this.inverserSorties();
    }
}

