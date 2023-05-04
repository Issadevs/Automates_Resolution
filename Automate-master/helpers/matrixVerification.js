export function isDeterministe(automate) {
    
    /* 
    Un automate déterministe respecte ces conditions :
     - Un unique état initial
     - Pas d'epsilon-transition (ignoré)
     - Une seule transition par état et par symbole
    */

    // Vérifier si l'automate a un unique état initial
    if (automate.etatsInitiaux.length !== 1) return false;

    // Vérifier si l'automate a une seule transition par état et par symbole
    for (const etat of automate.etats) {
        for (const symbole of automate.alphabet) {
            // Si les transitions ne sont pas définies, on les initialise
            if (!automate.transitions[etat]) automate.transitions[etat] = {};
            
            if (automate.transitions[etat][symbole] && automate.transitions[etat][symbole].length > 1) {
                return false;
            }
        }
    }

    // Nous avons passé toutes les conditions, l'automate est déterministe
    return true;
}

export function isComplet(automate) {

    /* 
    Un automate complet respecte ces conditions :
     - Un unique état initial
     - Pas d'epsilon-transition (ignoré)
     - Une transition par état et par symbole
    */

    // Vérifier si l'automate a un unique état initial
    if (automate.etatsInitiaux.length !== 1) return false;

    // Vérifier si l'automate a une transition par état et par symbole
    for (const etat of automate.etats) {
        for (const symbole of automate.alphabet) {
            // Vérifier si la transition est définie
            if (!automate.transitions[etat]) automate.transitions[etat] = {};

            if (!automate.transitions[etat][symbole]) {
                return false;
            }
        }
    }

    // Nous avons passé toutes les conditions, l'automate est complet
    return true;
}

export function isStandard(automate) {

    /*
    Un automate standard respecte ces conditions :
      - Un unique état initial
      - Pas de transition vers l'état initial
    */

    // Vérifier si l'automate a un unique état initial
    if (automate.etatsInitiaux.length !== 1) return false;

    // Vérifier si l'automate a une transition vers l'état initial
    for (const etat of automate.etats) {
        for (const symbole of automate.alphabet) {
            // Vérifier si la transition est définie
            if (!automate.transitions[etat]) automate.transitions[etat] = {};

            // Vérifier si la transition est vers l'état initial
            if (automate.transitions[etat][symbole] && automate.transitions[etat][symbole].includes(automate.etatsInitiaux[0])) {
                return false;
            }

        }
    }

    // Nous avons passé toutes les conditions, l'automate est standard
    return true;
}