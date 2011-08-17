---
layout: post
title: Pourquoi avons nous besoin de WebCL
author: fcellier
tags: [WebCL, NaCl, javascript]
---
##Pourquoi, à mon avis, nous avons besoins de webCL ou d'un équivalent:

Je ne rentrerais pas ici dans un débat technique mais un petit contexte me paraît nécessaire (donc je demande pardon par avance aux puristes :) . Le WebCL c’est la capacité de faire un équivalent d’OpenCL dans le navigateur. Haha vous êtes bien avancés, en fait le WebCL c’est faire du traitement hautement parallèle (souvent nommé parallélisme sur la donnée) pouvant être exécuté sur le CPU ou sur le GPU. A noter que le code exécuté pour le WebCL est très proche des shaders OpenGL ou WebGL, c’est à dire une sous partie du C sans gestion de mémoire possible.
Une autre information me paraît importante: j'ai travaillais sur l’exécution de code javascript, des fonctions spéciales, capables d’être exécutées de manière efficace (pour ceux qui connaissent, ca serait plus l'équivalent de [clyther](http://clyther.sourceforge.net/) dans gecko) donc ma vision était légèrement différentes de ce qui se profile avec le webCL. Cependant, étant donnée qu’un standart semble se rapprocher, j’ai mis en pause mon projet pour tenter de voir ce que pourrais donner ce dernier.

Le webCL viens ici combler plusieurs manques qui existent dans le javascript:

* Le premier est le manque de parrallelisme sur les données. Bien sûr, il existe une manière d’exécuter de façon concurrente mais les webWorkers hérité de l'actor model ne sont pas efficaces ou adapté lorsque'il est question de traiter chaque élément d'un même tableau de façon parallèle.

* La deuxième qui est, de mon point de vue, plus polémique, est l'utilisation d’instruction bas niveau qui permet d’être plus optimisé que le javascript ( je n’ essaierai pas trop de défendre ce point de vue car je reste sceptique sur l’intérêt immédiat même si je suis forcé de constater le différence de performance sur les arbre binaire ou le k-nucleotide en C et en javascript). Si vous souhaitez débattre de ce point je vous propose  de parler à ﻿jensnockert et la proposition [ASM,SIMD dansjavascript](https://gist.github.com/7a0f6a99a0f3bde2facb)

* La troisième est l’utilisation efficace des ressources présentent dans la machine avec la possibilité optionnelle d’exécuter du code directement dans le GPU (ce qui permet d'éviter l'échange de données entre les mémoires qui peuvent tuer les performances).

Tant que le javascript ne considèrent pas ces problèmes  , travailler sur le WebCL me paraît nécessaire car cela permettra de nombreuses nouvelles utilisations du navigateur tel que les jeux ou le montage video et le tout sans rien devoir installer. Avec le temps, j'ai l'intime conviction que le navigateur devient OS virtualité à part entière (le fait même qu'une specification de p2p soit en cours ne fait que confirmer mon sentiment).

Je suis au courant qu’il existe d’autre solutions, mais je ne suis pas fan, par exemple, de NaCl... D’abord c’est natif ?!... on a beau dire, avoir une version pas processeur, c’est vraiment trop loin de ma vision du web, dans ce cas je pense plus utiliser les plugins avec pepper et les npappi.
De plus, je n’aime vraiment pas les binaires obscures que je vais télécharger et exécuter sans avoir un minimum de contrôle dessus. Il y a bien la sandbox, mais ca me donne quand même des démangeaisons. Je l'admet, il y a des propositions pour pouvoir donner du bytecode dans webCL, ce qui serait presque l'équivalent de [pNaCL](http://nativeclient.googlecode.com/svn/data/site/pnacl.pdf), cependant, ce dernier se concentre seulement sur donner les mêmes performances sur une application type C++ et non optimiser seulement les parties qui en ont besoins.
En effet NaCL paraît plus être «je ne veux pas coder en javascript, faisons autre chose» plutôt qu’essayer de compléter le javascript, ce qui, encore une fois, est trop éloigné de mes attentes! 

