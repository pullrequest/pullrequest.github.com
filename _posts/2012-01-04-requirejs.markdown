---
layout: post
title: Organiser son code JavaScript avec RequireJS
author: filirom1
tags: [requirejs, javascript, webapp]
---

Je suis certain que vous aussi, vous avez connu la frénésie jQuery. Le JavaScript prend de plus en plus de place au sein de l'application. On commence à avoir des difficultés à gérer l'ordre des balises scripts, le navigateur télécharge un nombre incroyable de fichiers js et le navigateur rame, on perd le compte du nombre de variables globales, on trouve du code javascript dans l'html et du html dans du javascript, le code dupliqué se multiplie et très vite, on ne sait plus qui fait quoi et rien n'est testé...

Alors comment s'en sortir ?

Il existe plusieurs méthodes qui couvrent un spectre plus ou moins large des problèmes exposés ci-dessus. Je vais commencer par vous les expliquer avant de vous présenter la solution que je préfère : `RequireJS`.


Module Pattern
--------------
<http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth>

Il nous permet de ne pas pourrir notre scope global. En Javascript un scope est défini au niveau des fonctions. Pour éviter que nos variables arrivent dans le scope globale, il suffit de wrapper notre code autour d'une fonction et de l'exécuter tout de suite après.

{% highlight javascript %}
(function(){
  var private = 'I am private, the global scope is free of me !';

  function iAmPrivateToo(){
    return 'This function is private and will not be available via the global scope !'
  }
})()
{% endhighlight %}

Object Litteral Pattern
-----------------------
<http://stackoverflow.com/questions/1600130/javascript-advantages-of-object-literal>

Maintenant que nous savons isolé notre code, nous devons le découper pour éviter de se retrouver avec un seul gros fichier.

A partir du moment où l'on découpe notre code, nous allons avoir besoin d'exporter des fonctions et des attributs publiquement dans une variable globale (ça va une seule, on ne crie pas au scandale tout de suite).

{% highlight javascript %}
// script1.js
(function(){

  // if window.myApp does not exist, create it with an empty object
  // multiple = are allowed in JS
  // `var a = a || {};` is often used in JS, it means `var a or= {}`
  var myApp = window.myApp = window.myApp || {};
  
  var aPublicVariable = 'I am public, yeahhh';
  
  function aPublicFunction(){
    return 'This function will be public';
  }
  
  var aPrivateVariable = 'I am private, Yeahh !!!';
  
  function aPrivateFunction(){
    return 'I will never export this function';
  }
  
  // exports public functions and variables
  myApp.aPublicVariable = aPublicVariable;
  myApp.aPublicFunction = aPublicFunction;
})();

// script2.js use script1 functions
(function(){
  var myApp = window.myApp = window.myApp || {};
  
  console.log(myApp.aPublicFunction());
})();
{% endhighlight %}

Attention script2 dépend de script1. Il y a un ordre à respecter au niveau de la déclaration des dépendances.

{% highlight html %}
<script src="script1.js"></script>
<script src="script2.js"></script>
{% endhighlight %}
    
Grouper les fichiers JS pour la prod
------------------------------------

On se retrouve avec deux fichiers JavaScripts, pour le développement c'est mieux, mais pour la prod c'est moins bien ! On a augmenté le nombre de ressources à faire télécharger par le navigateur. Maintenant, il faut grouper et minifier les ressources JS avant de les servir en prod. Pour faire ça, nous pouvons utiliser un simple script shell:

    cat js/src/* >> js/build/app.js

Mais attention, les dépendances risquent d'être cassées. Nous pouvons également utiliser des outils plus évolués : 

* [Wro4J](http://code.google.com/p/wro4j/) qui possède même un plugin Tapestry <https://github.com/lltyk/tapestry-wro4j> ;)
* le script de build de [html5 boilerplate](https://github.com/h5bp/html5-boilerplate/wiki/Build-script)
* ...

Si vous avez d'autres outils, laissez un commentaire à cet article.


Gestion des dépendances avec RequireJS
--------------------------------------

C'est à ce moment que je commence à vous parler de RequireJS.

RequireJS a été créé par [James Burke](https://github.com/jrburke), pour
DOJO. Mais finalement, cette librairie a été séparé du projet initial pour
devenir framework agnostique. Merci James ;)

RequireJs va vous permettre de faire :

*  de l'encapsulation (visibilité public / privée )
*  de la modularité
*  de la gestion de dépendances
*  de ne plus écrire d'HTML dans des fichiers JS
*  de l'optimisation d'assets (grouper et minifier les JS et les CSS)

RequireJS est actuellement la solution mise en avant par :

* [Rebecca Murphey pour utiliser RequireJS avec jQuery](http://jqfundamentals.com/)
* [Addy Osmani pour utiliser RequireJS avec Backbone](https://github.com/addyosmani/backbone-fundamentals)
* [Alex Sexton le père de YepNope, qui explique pourquoi il préfère RequireJS](http://www.quora.com/What-are-the-use-cases-for-RequireJS-vs-Yepnope-vs-LABjs)
* [Resthub-JS dans sa solution pour construire des Single Page Web Apps](http://resthub.org/javascript/)


Voici un exemple de code de RequireJS, suivez les commentaires pour les explications.

{% highlight javascript %}
/* js/script1.js */
define(
  id, /* (optionnel) */
  [ 'jquery', 'underscore' ], /* La liste des dépendances */
  function($, _) { 
    /* on retrouve le module pattern ici */
    var privateVariable = 'I am private';
    function privateFunction(){ ... }
    
    var publicVariable = 'I am public';
    function publicFunction(){ ... }
  
    /* Variables et functions à exporter */
    return {
        publicVariable: publicVariable,
        publicFunction: publicFunction
    }
  }
)

/* bootstrap.js qui utilise la dépendance définie ci dessus. */
require({
  paths: {
    jquery: 'js/libs/jquery-1.7.1.min',
    underscore: 'js/libs/underscore-min'
  }
},['js/script1'], function(script1){
    console.log(script.publicFunction());
})
{% endhighlight %}

Reprenons l'exemple précédent tout doucement.

RequireJS définit deux notions : `define` et `require`. Simple non :D

* `define` permet de définir un module avec des dépendances et des choses (fonction ou variable) à exporter.
* `require` permet de charger dynamiquement des modules.

### Définir un module avec `define`

Si nous prenons l'exemple d'un module simple.

{% highlight javascript %}
define([
    'jquery',
    'underscore',
    'js/myScript',
    ...
], function($, _, myScript, ...){
  
  /* your private methods and variable here */
  
  return { /* your public variables and functions here */ }
});
{% endhighlight %}

Je n'ai pas spécifié l'ID, RequireJs va s'en occuper pour moi et je vous conseil de faire de même. Votre code sera réutilisable plus facilement.

Dans mon module, j'ai spécifié une liste de dépendances.

{% highlight javascript %}
[
  'jquery',
  'underscore',
  'js/myScript',
  ...
]
{% endhighlight %}
    
Nous remarquons que pour myScript, le nom de la dépendance correspond à son chemin sans l'extension. Nous verrons par la suite comment configurer RequireJS afin de donner des chemins raccourcis (comme pour jQuery et underscore).


RequireJs m'assure que les dépendances seront chargées et accessibles à l'intérieur de la fonction : `function($, _, myScript, ...){ ... }`

Mon module peut exporter des choses (fonction ou variable) à l'aide du return: `return { publicFunction: publicFunction, .... }` Tout ce qui n'est pas exporté est privé. Simple n'est-ce pas ;)

Et comme vous l'aurez supposé, tout ce qui est exporté par un module est disponible par les autres modules via les arguments de la fonction : `$, _, myScript, ...`

RequireJs va s'occuper de charger les dépendances des dépendances, ... et au final je n'aurai plus qu'à définir qu'un seul module : myApplication et de ne charger que ce module pour que toutes les dépendances de mon application soient chargées automatiquement (ce n'est plus à nous de gérer l'ordre c'est cool ;) ).


### Charger des modules avec `require`

Maintenant c'est sympa nous avons défini des modules, mais il nous manque un point d'entrée à notre application. C'est le rôle de `require` de faire ça. L'appel à `require` va charger dynamiquement un module, puis ses dépendances, puis appeler la fonction passée en dernier paramètre.

{% highlight javascript %}
require({
  paths: {
    jquery: 'js/libs/jquery-1.7.1.min',
    underscore: 'js/libs/underscore-min'
  }
},['jquery', 'js/script1'], function($, script1){
  $(function(){
    $('#myID').text('Loaded ' + script1.publicFunction());
  });
})
{% endhighlight %}


### Configurer RequireJS

Comme vous l'avez remarqué, le premier paramètre de RequireJS est un objet de configuration :

{% highlight javascript %}
paths: {
  jquery: 'js/libs/jquery-1.7.1.min',
  underscore: 'js/libs/underscore-min'
}
{% endhighlight %}

Le paramètre `paths` nous permet de définir l'emplacement des librairies utilisées

Tout à l'heure je vous ai dit, n'utilisez pas d'ID dans vos modules et vous allez maintenant comprendre pourquoi.

jQuery définie dans son [code](https://github.com/jquery/jquery/blob/cae1b6174917df3b4db661f20ef4745dd6e7f305/src/core.js#L949) un `define('jquery', function(){ return jQuery });` Le premier paramètre `jquery` est l'ID et nous oblige à utiliser le terme `jquery` pour l'ajouter en tant que dépendance. Vous avez compris, c'est relou, alors ne le faîtes pas :)

Normalement nous aurions pu faire appel à jquery via son chemin complet : 
`define(['js/libs/jquery-1.7.1.min'], function($){ ... })`, mais à cause de l'ID nous devons faire réference à jquery par son id :`define(['jquery'], function($){ ... })`

C'est le rôle de la configuration `paths: { jquery: 'js/libs/jquery-1.7.1.min', }`. RequireJS va remplacer chaque dépendance `jquery` par son chemin réel afin de trouver la librairie.

#### RequireJS et jQuery

Depuis jQuery 1.7, le support de AMD (RequireJS est un implémentation de AMD) à été ajouté.

Pour les versions précédentes il existe une version de RequireJS qui
intègre jQuery : <https://github.com/jrburke/require-jquery>

#### RequireJS et Backbone

Si vous voulez utiliser RequireJS avec Backbone, James Burke le créateur
de RequireJS a créé un repo avec une version de Backbone compatible AMD :
<https://github.com/jrburke/backbone/blob/optamd3/backbone.js>

Une [issue](https://github.com/documentcloud/backbone/pull/710) est en cours sur Github pour que ce fork soir mergé avec
Backbone.

### Intégrer RequireJS dans notre HTML

Il faut rajouter dans le HTML les balises `script` pour RequireJS et notre bootstrap.js (celui faisant appel à toute nos dépendances) afin que le navigateur charge notre application.

{% highlight html %}
<html>
    <head>...</head>
    <body>
      <!-- Ajoutons requireJS et notre script à la fin du body -->
      <script src="require.js"></script>
      <script src="bootstrap.js"></script>
    </body>
</html>
{% endhighlight %}

RequireJS rajoutera les dépendances chargées via des balises script dans
le head et le navigateur les chargera automatiquement. Si la dépendance
est nécessaire plusieurs fois, RequireJs a l'intelligence de ne la
récupérer qu'une seule fois.

Maintenant lorsque nous naviguons sur notre site, le navigateur télécharge RequireJS, le bootstrap, et toutes les dépendances.


### Optimiser les ressources

Avec RequireJS nous avons découpé notre application en plusieurs fichiers, malheureusement tous les fichiers sont téléchargés un par un par le navigateur.

Nous aurions besoin de grouper et minifier l'ensemble de ces fichiers avant de les servir en production.

RequireJS arrive avec un [script de build](https://github.com/jrburke/r.js/) qui a exactement ce rôle là. 

Si on appelle r.js avec le paramètre -o et en lui spécifiant un fichier de configuration : `r.js -o build.js`. r.js va parcourir l'ensemble des scripts et les minifier, puis va parcourir nos dépendances afin de les grouper. Les fichiers résultant seront placés dans un nouveau répertoire afin de ne pas écraser les sources.

{% highlight javascript %}
({
    appDir: './src',    /* Repertoire des sources */
    baseUrl: ".",       /* Le repertoire racine */
    dir: "./build",     /* Repertoire de destination */
    modules: [ {
      name: 'bootstrap' /* Une dependance vers un module */
    } ],
    optimizeCss: "standard.keepLines", /* On va même optimiser les CSS */
    dirExclusionRegExp: /node_modules|test|build/ /* on va exclure du processus de build certain repertoires. */
})
{% endhighlight %}

Le fichier bootstrap.js du répertoire build contiendra l'ensemble de notre code js minifié.

PS : r.js nécessite node ou Rhino pour fonctionner.

### Chargement dynamique de code

Il se peut que lors de la construction d'une Single Page Web App vous ayez besoin de définir des ensembles de modules. Par exemple un module qui contient l'ensemble du code JS pour le frontend de votre appli et un autre module qui va contenir le code JS supplémentaire nécessaire pour charger le backend.

Vous ne souhaitez pas que les internautes qui accèdent à votre frontend soit ralenti par le téléchargement des ressources du backend.

C'est pour répondre à cette problématique que le script de build r.js peut être configuré avec plusieurs modules ayant des options d'include et d'exclude.


### RequireJS sur mobile

Sur mobile on a toujours des contraintes des taille. Nous ne voulons surtout pas charger de librairies inutilement. Du fait que nous avons utilisé la structuration AMD (Asynchrnous Module Definition) dans notre code, nous sommes obligé d'utiliser une implementation AMD pour lancer notre application et RequireJs n'est pas la seule implémentation existante. 

Actuellement il en existe plusieurs dont 3 que j'ai testé personnellement.

* Almond la plus petite (moins de 1Ko gzippé) ne fait pas de chargement dynamique; tous les modules doivent être contenus dans un seul fichier. Elle fonctionne très bien en complément du script builder r.js. Comme tout le code est groupé en un seul fichier, Almond peut faire son travail. Almond est la solution privilégiée sur mobile.
* Curl.js qui est deux fois moins gros que RequireJs et peut être une bonne alternative si vous avez besoin de chargement dynamique de code.

Par contre, sur des projets un peu gros, souvent RequireJS est le seul à s'en sortir.

Et voici une comparaison des implémentations en terme de taille

    $ ls -l
    -rw-r--r-- 1 romain users  925 29 nov.  15:41 almond.min.js.gz
    -rw-r--r-- 1 romain users 2,6K 29 nov.  15:41 curl.js.gz
    -rw-r--r-- 1 romain users 5,5K 29 nov.  15:41 require.js.gz


Si vous utilisez Almond qui ne fait pas de chargement dynamique, vous aurez besoin en prod de remplacer 'RequireJS + votre code' par un seul fichier minifié contenant tout.

{% highlight html %}
- <script src="require.js"></script>
- <script src="boostrap.js"></script>
+ <script src="almond-and-bootstrap.js"></script>
{% endhighlight %}

Pour cela vous pouvez :

*  soit utiliser [httpBuild](https://github.com/jrburke/r.js/blob/master/build/tests/http/httpBuild.js) afin de toujours compiler en dev vos assets RequireJS côté serveur (utilise nodejs)
* soit utiliser les fonctionnalités de [has avec RequireJS](http://requirejs.org/docs/optimization.html#hasjs) : [exemple](https://github.com/alankligman/gladius/blob/develop/src/gladius.js)

### Stop au JS dans les HTML et à l'HTML dans les JS

Avec RequireJS et son plugin text vous avez la chance, de ne plus jamais écrire de JavaScript dans des fichiers HTML, ni d'écrire du HTML dans les fichiers JavaScript.

Voici un exemple de module RequireJS avec une dépendance texte (regardez
le préfixe text!) :

{% highlight javascript %}
/* bootstrap.js */
require([
  'jquery',
  'underscore',
  'text!views/template.html'
], function($, _, tmpl){
  var compiledTemplate = _.template(tmpl);

  $(function(){
    var $el = $('.injectHere');
    $('.btn').click(function(){
        $el.html(compiledtemplat({
            firstName: firstName,
            lastName: lastName
        })));
    });
  });
})
{% endhighlight %}

Et voici le template en HTML utilisant le [micro templating underscore](http://documentcloud.github.com/underscore/#template)

{% highlight javascript %}
<!-- views/template.html -->
<div class="personn">
    <p>My name is <%= firstName %> <%= lastName %></p>
</div>
{% endhighlight %}

Si on faisait tourner le script de build r.js on obtiendrait dans le même fichier :

* jQuery
* undercore
* le template inliné. Il ressemblerait à ça : define('text!views/template.html', function(){ return '< div class= ....' });
* et notre bootstrap.js

RequireJS possède même des plugins afin de compiler les templates par le script de build r.js : [underscore template](https://github.com/ZeeAgency/requirejs-tpl), [handlebars](https://github.com/SlexAxton/require-handlebars-plugin) . Encore une chose de moins à faire côté client :).


Conclusion
----------

Bien RequireJS puisse paraitre un poil complexe à configurer, RequireJs permet de répondre à pas mal de problématiques et pour l'instant je n'ai rien trouvé de mieux pour faire des Single Page Web Apps (SPA).

D'ailleurs, pour de la SPA : RequireJS + Backbone c'est un must have. Je l'ai déjà
cité, mais regardez le livre de Addy Osmani : [Backbone Fondamentals](https://github.com/addyosmani/backbone-fundamentals) il vaut vraiment le coup.

Si vous voulez voir des exemples de code utilisant RequireJS, j'ai créé
un repo pour ça : <https://github.com/Filirom1/requirejs-examples> à
l'occasion d'un talk à [LyonJS](http://lyonjs.org).

Et concernant les tests, jetez un oeil à [js-library-skeleton](https://github.com/tkellen/js-library-skeleton) qui est un exemple d'integration de RequireJs, r.js, Almond et le framework de test Jasmine.

Si vous souhaitez plus de ressources sur RequireJS :

* [Lisez le site officiel de RequireJS](http://requirejs.org/)
* [Plongez vous dans la présentation de AMD, CommonJS et des ES imports/exports par Addy Osmani](http://addyosmani.com/writing-modular-js/)
* [Lisez l'article de mklabs](http://blog.mklog.fr/article/require-js)
* [Si vous souhaitez des plugins supplémentaire pour RequireJS](https://github.com/millermedeiros/requirejs-plugins)
* [Sur mobile essayez Almond](https://github.com/jrburke/almond)
* [sinon curl](https://github.com/unscriptable/curl)

Merci d'avoir lu cet article jusqu'au bout ;)
