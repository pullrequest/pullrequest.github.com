---
layout: post
title: Des astuces pour structurer un projet BackboneJS
author: filirom1
tags: [backbonejs, javascript, webapp, spa]
---


[Bakbone](http://documentcloud.github.com/backbone/) est un super projet car il embarque en très peu de ligne, un
ensemble de bonne pratiques qui rendra votre code bien plus lisible et
compréhensible par les autres développeurs. 

Mais Backbone comme jQuery,
vous laisse relativement libre pour structurer votre code. Ce qui est
très bien, mais qui pourrait vous laisser un peu démuni pendant la
phase d'apprentissage.

C'est pour cette raison que j'écris cette article. Suite à l'analyse de DocumentCloud qui j'ai réalisé pour une présentation à LyonJS, je pose par écrit un ensemble de conventions utilisés chez DocumentCloud et qui me semblent murement réfléchi.

Dans cet article je parlerais beaucoup de tout ça qui va autour de Backbone, mais finalement très peu du framework en tant que tel. Je vous laisse le soin de lire la [doc officiel](http://documentcloud.github.com/backbone/), ou même le [code commenté](http://documentcloud.github.com/backbone/docs/backbone.html) car celui ci est très claire.

Ce qui m'importe le plus pour structurer un code c'est la simplicité et la facilité de compréhension. Je vais donc vous présenter une approche pragmatique et minimaliste qui vous permettra de mettre en place des projets fronts conséquent (comme celui [DocumentCloud](http://www.documentcloud.org/public/search/)).

Je me détache des présentations du type [How to build large scale jQuery application](http://addyosmani.com/blog/large-scale-jquery/) qui je trouve bien pensé mais plus complexe à appliquer. Je trouve l'idée d'utiliser RequireJs et un PubSub intéressante, mais au final cela entraine une surcouche de complexité qui n'est pas nécessaire pour toute les applications.

### Structuration des fichiers

    .
    ├── index.html                       // l'unique fichier HTML (nous sommes sur une SPA)
    ├── css
    │   └── ...                          // les feuilles de styles
    ├── js
    │   ├── application.js               // défini le namespace + le routeur
    │   ├── model
    │   │   └── ...                      // ensemble des modèles et collections
    │   ├── ui
    │   │   └── ...                      // ensemble des vues backbones
    │   ├── lib
    │   │   ├── backbone.extension.js    // plugins Backbone fait maison
    │   │   └── jquery.extension.js      // plugins jQuery fait maison
    │   └── vendor                       // librairies externes
    │       ├── backbone.js
    │       ├── jquery.js
    │       └── underscore.js
    └── template
        └── ...                          // Nos templates au format JST

### Index.html

Backbone grâce à son Routeur nous permet de construire des Single Page Web Applications (SPA) très simplement.

Une SPA signifie qu'il n'y a qu'un seul fichier HTML à charger pour gérer l'ensemble de l'application.

Ce fichier est en général très simple puisque les templates seront injectées dans le DOM en fonction de l'URL de la page.

Si vous voulez un exemple d'index.html prenez celui de HTML5Boilerplate.

{% highlight html %}
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery.js"><\/script>')</script>

<!-- scripts concatenated and minified via build script -->
<script src="js/vendor/undercsore.js"></script>
<script src="js/vendor/backbone.js"></script>
<script src="js/application.js"></script>
<!-- all your scripts here -->
<!-- end scripts -->
{% endhighlight %}



### Templates JST

Comme notre index.html est tout vide, il nous faudra gérer nos templates dans des fichiers séparés.

(J'ouvre une parenthèse, mais je préfère gérer mes templates HTML dans des fichiers séparées plutôt que de les inclure dans des balises script dans l'index.html car je n'aime pas scroller)

Ce qui nous faut, c'est créer un fichier HTML, qui sera ensuite compilé en fonction une javascript ce qui nous permettra de récupérer le texte dans notre application.

Je m'explique. Prenons un template `hello-world.jst`

{% highlight html %}
<p>Hello {{name}}</p>
{% endhighlight %}

Transformons `hello-world.jst` en `templates.js` : 

{% highlight javascript %}
window.JST = {
  "hello-world": function(data){ return "<p>Hello " + data.name + "</p>" }
}
{% endhighlight %}

Il nous suffira de rajouter `<script src="template/templates.js"></script>` dans index.html et nous pourrons accéder à notre template n'importe où dans l'application à l'aide du namespace JST.

{% highlight javascript %}
$(function(){
    $('body').append(JST['hello-world']({name: 'World'}));
})
{% endhighlight %}

Mantenant vous avez compris le principe des JST. Si ce n'est pas le cas,
lisez cet article là <http://ricostacruz.com/backbone-patterns/#jst_templates>.

Il existe de nombreuses solutions pour votre application, mais si vous souhaitez quelque chose qui fonctionne avec n'importe quel template (underscore template, jquery-tmpl, handlebars, des strings pures) jetez un oeil à ce projet <https://github.com/Filirom1/universal-jst> #auto-promotion :)

Sinon regarder les projets ci dessous :

* <https://github.com/wookiehangover/handlebars-jst>
* <https://github.com/wookiehangover/jquery-tmpl-jst>
* <https://github.com/mklabs/templatify>
* <http://documentcloud.github.com/jammit/#jst>
* <https://github.com/sstephenson/sprockets>

### Utilisation d'un Namespace

Trouvez un nom court pour votre namespace, qui n'est pas un mot clé réservé. Par exemple, DocumentCloud à choisi d'utiliser ses initiales : `dc`

On définie le namespace au tout début de notre application, afin de
pouvoir l'utiliser n'importe où dans la suite.

application.js :

{% highlight javascript %}
// Provide top-level namespaces for our javascript.
(function() {
  window.dc = {};
  dc.app = {};
  dc.ui = {};
  dc.model = {};
})();
{% endhighlight %}

Comme nous allons découper notre application en plein de petits fichiers
(je n'aime pas scroller), nous allons augmenter ce namespace à chaque
fois:

js/ui/workspace/panel.js:

{% highlight javascript %}
dc.ui.Panel = Backbone.View.extend({
  //...
});
{% endhighlight %}

js/ui/common/dialog.js :

{% highlight javascript %}
dc.ui.Dialog = Backbone.View.extend({
      //...
});
{% endhighlight %}

js/model/documents.js

{% highlight javascript %}
dc.model.Document = Backbone.Model.extend({
      //...
});
{% endhighlight %}


En plus comme chacun de nos fichiers est contenu dans un objet, on ne pourrira pas la globale window.
Donc pas besoin d'enrober notre code dans un fonction auto appelante :

{% highlight javascript %}
// Before
(function(){
  /* your code here */
})()
{% endhighlight %}

Ce que l'on a gagné gratuitement c'est que chacun de nos objets est facilement accessible via la console.

    $ console.log(new dc.model.Document());

Ce qui est très pratique pour débugguer. 

Comme vous allez beaucoup écrire ce namespace (ici `dc`), je vous conseil de choisir quelque chose de court. Deux lettres ça me semble pas mal.


### Dépendances et initialisations

Une des difficultés en Javascript c'est la gestion des dépendances entre les fichiers. 

Dans le cas de notre application, il y a 2 sortes de dépendances :

* à la lecture du fichier, les variables doivent être connu par l'interpréteur JavaScript.

Comme nos fichiers commencerons tous par `dc.xxx.xxxx = Backbone.XXXXX.extend({`, il sera facile pour nous de gérer l'ordre dans l'index.html afin qu'il n'a ai pas de problème de dépendances.

Les dépendances qui se trouvent à l'intérieur des fonctions (initialize, render...) seront gérées plus tard.


* lors de l'instantiation, si l'on fait appel à un module externe, celui ci doit avoir été instancié préalablement.

#### Dépendances partagées globalement

Si on défini un module comme quelque chose pouvant être appelé par n'importe quel autre module dans l'application. Il est important d'instancier ces modules dans un ordre précis (un module peut dépendre d'un autre module), c'est pour cela que l'on instanciera ces modules dans une fichier unique par exemple le routeur.

{% highlight javascript %}
dc.app.Router = Backbone.Router.extend({

  routes : {
    // ...
  },

  initialize : function() {
    this.createSubViews();
    this.renderSubViews();
  },

  createSubViews : function() {
    dc.app.paginator  = new dc.ui.Paginator();
    dc.app.navigation = new dc.ui.Navigation();
    dc.app.toolbar    = new dc.ui.Toolbar();
    dc.app.organizer  = new dc.ui.Organizer();
    dc.ui.notifier    = new dc.ui.Notifier();
    dc.ui.tooltip     = new dc.ui.Tooltip();
    // ...
  },

  // Render all of the existing subviews and place them in the DOM.
  renderSubViews : function() {
    var content   = $('#content');
    content.append(this.sidebar.render().el);
    content.append(this.panel.render().el);
    dc.app.navigation.render();
    dc.app.hotkeys.initialize();
    this.help = new dc.ui.Help({el : $('#help')[0]}).render();
    this.panel.add('search_box', dc.app.searchBox.render().el);
    this.panel.add('pagination', dc.app.paginator.el);
    this.panel.add('search_toolbar', dc.app.toolbar.render().el);
    this.panel.add('document_list', this.documentList.render().el);
    this.sidebar.add('entities', this.entityList.render().el);
    $('#no_results_container').html(JST['workspace/no_results']({}));
    this.sidebar.add('organizer', dc.app.organizer.render().el);
  }
});

dc.app.router = new dc.app.MyRouter();
{% endhighlight %}


#### Dépendances partagées hiérarchiquement

Nous aurons besoin de découper nos modules, en sous modules et donc de faire dépendre nos modules de nos sous-modules. Comme les sous-modules ne seront utilisées que par le module, nous pouvons les attacher directement à l'instance du module parent :

{% highlight javascript %}
dc.app.editor = new Backbone.View.extend({

  initialize : function(docId, options) {
    this.createSubViews();
    this.renderSubViews();
  },
  
  createSubViews : function() {
    dc.ui.notifier          = new dc.ui.Notifier();
    this.controlPanel       = new dc.ui.ViewerControlPanel();
    this.sectionEditor      = new dc.ui.SectionEditor();
    this.annotationEditor   = new dc.ui.AnnotationEditor();
    this.removePagesEditor  = new dc.ui.RemovePagesEditor({editor : this});
    this.reorderPagesEditor = new dc.ui.ReorderPagesEditor({editor : this});
    this.editPageTextEditor = new dc.ui.EditPageTextEditor({editor : this});
    this.replacePagesEditor = new dc.ui.ReplacePagesEditor({editor : this});
  },
{% endhighlight %}

Regardez également comment le module parent partage sont instance avec ses modules enfants : `new dc.ui.ReplacePagesEditor({editor : this})`


#### Remarque sur RequireJS

Si pendant la lecture de ce paragraphe vous vous dites que vous n'avez pas besoin de tout ça car vous avez RequireJs. Ben sachez que lorsque vous définissez un module avec RequireJs, vous avez le choix entre retourner une classe, ou un singleton, mais faire les deux devient problématique.

MyModel.js : 
    
{% highlight javascript %}
define(['jquery', 'backbone'], function($, Backbone){
    return Backbone.Model.extend({}); // classe
})
{% endhighlight %}
    
MyCollection.js : 
    
{% highlight javascript %}
define(['jquery', 'backbone', 'MyModel'], function($, Backbone, MyModel){
    var Collection = Backbone.Collection.extend({
        model: MyModel
    });
    return new Collection(); // singleton
})
{% endhighlight %}


### Communication entre module.

Le plus simple pour faire communiquer deux modules entre eux c'est de les faire interagir directement. Je vous entend crier au loin, mais c'est fortement coupler ça !!!

Comme il n'y a pas de typage fort en javascript vous vous en moquez! C'est comme si vous utilisiez des interfaces en Java. Si vous voulez remplacer un module par un autre, il suffit que les deux modules possèdes les mêmes signatures de fonctions et vous pouvez les remplacer.

Maintenant si vous voulez savoir quelles sont les fonctions publiques et les fonctions privées, je vous déconseil de les préfixer par un _. Deja c'est moche et en plus c'est inutile car un simple grep suffit pour savoir quelles sont les methodes publiques :

    $ grep -R "replacePagesEditor\." .
    ./public/javascripts/ui/workspace/toolbar.js:    dc.app.editor.replacePagesEditor.open(); 
    ./public/javascripts/editor/control_panel.js:    dc.app.editor.replacePagesEditor.toggle();
    ./public/javascripts/app/editor.js:              this.replacePagesEditor.close();


Après vous pouvez communiquez via des événements, mais il faudra un peu plus de travail pour synchroniser plusieurs événements. Et les appels seront moins facile à repérer dans le code. Le problème avec les événements en JS, c'est que l'on perd vite le contrôle de l'application et tout parait magique. Je ne vous interdit pas d'utiliser les événement, mais faîtes le avec parcimonie et justesse.


### Utiliser le modèle objet

Quand vous utilisez Backbone,vous créez des classes filles de Backbone.View, Backbone.Model, Backbone.Collection, ...

Alors pourquoi ne pas créer ses propres classe mère. Par exemple :

js/ui/accounts/account_dialog.js:

{% highlight javascript %}
dc.ui.AccountDialog = dc.ui.Dialog.extend({

  constructor : function() {
    dc.ui.Dialog.call(this, {...} );
    // ...
  },

  render : function() {
    dc.ui.Dialog.prototype.render.call(this);
    // ...
  }
{% endhighlight %}

Ou bien créer des factories :

js/ui/common/dialog.js: 

{% highlight javascript %}
_.extend(dc.ui.Dialog, {

  alert : function(text, options) {
    return new dc.ui.Dialog(_.extend({
      mode      : 'alert',
      title     : null,
      text      : text
    }, options)).render();
  },
{% endhighlight %}


Ou même augmenter nos classes à l'aide de mixins

js/model/documents.js :

{% highlight javascript %}
_.extend(dc.model.DocumentSet.prototype, dc.model.Selectable);
{% endhighlight %}


### Des vues limitées à une petite portion du DOM

Une des choses les plus belles avec Backbone c'est l'attribut `this.el`, et les nombreuses utilisation : `this.$el`, `this.$`, ...Il vous permet de limiter l'interaction qui vous aurez avec le DOM. Non seulement vous gagnez en performance (les sélecteurs jQuery sont précis) mais en plus il vous empêche de modifier des éléments qui n'appartiennent pas à votre vue.

Alors vous l'aurez compris, je ne veux plus voir de `$` dans vos applications Backbone, seulement des `this.$` :D

### Des conventions qui rendent la lecture du code tellement agréable.

Il y a une autre chose que j'aime dans Backbone, ce sont ses conventions. Par exemple dans une vues, on repère instantanément les interactions utilisateurs : 

{% highlight javascript %}
events : {
  'keydown #search_box':   'maybeSearch',
  'search #search_box':    'search',
  'focus #search_box':     'addFocus',
  'blur #search_box':      'removeFocus',
  'click .cancel_search':  'cancelSearch',
  'click #login_button':   'login'
},
{% endhighlight %}

Mais vous pouvez faire la même chose ailleurs. Choisir des conventions et s'y tenir, par exemple les constantes et haut et en majuscule :)

    Backbone.View.extend({
        FAVORITES_URL : '//twitter.com/favorites/documentcloud.json?callback=?',


### Créer des plugins Backbone

Tout le monde connait les plugins jQuery. Mais saviez vous que vous pouvez faire la même chose avec Backbone?

Par exemple dans DocumentCloud il y a un plugin bien pratique le `setMode`.
SetMode permet de gérer une machine à état au niveau de ses vues. Lorsque l'on fait un setMode, on ajoute une classe CSS sur le `el` de la vue (pratique pour le CSS) mais on ajoute aussi un attribut sur la vue pour faciliter les interactions inter-modules.

Par exemple : 

{% highlight javascript %}
xxx.setMode('is', 'draggable');

// xxx.el === '<div class="is_draggable"></div>'
// xxx.modes === {draggable: 'is'}

xxx.setMode('prompt', 'dialog');
xxx.setMode('isnot', 'draggable');

// xxx.el === '<div class="isnot_draggable prompt_dialog"></div>'
// xxx.modes === {draggable: 'isnot', dialog: 'prompt'}
{% endhighlight %}

js/lib/backbone_extensions.js: 

{% highlight javascript %}
// Makes the view enter a mode. Modes have both a 'mode' and a 'group',
// and are mutually exclusive with any other modes in the same group.
// Setting will update the view's modes hash, as well as set an HTML class
// of *[mode]_[group]* on the view's element. Convenient way to swap styles
// and behavior.
Backbone.View.prototype.setMode = function(mode, group) {
  this.modes || (this.modes = {});
  if (this.modes[group] === mode) return;
  $(this.el).setMode(mode, group);
  this.modes[group] = mode;
};
{% endhighlight %}

js/lib/jquery_extensions.js

{% highlight javascript %}
$.fn.extend({
  // See Backbone.View#setMode...
  setMode : function(state, group) {
    group = group || 'mode';
    var re = new RegExp("\\w+_" + group + "(\\s|$)", 'g');
    var mode = (state === null) ? "" : state + "_" + group;
    this.each(function(){
      this.className = (this.className.replace(re, '') + ' ' + mode).replace(/\s\s/g, ' ');
    });
    return mode;
  },
})
{% endhighlight %}


### Ne pas se limiter à l'utilisation classique de Backbone

Backbone est suffisamment petit pour que n'importe quel développeur se sente à l'aise avec les sources. Vous pouvez donc utiliser Backbone avec un minimum de couche.

Regarder par exemple la HomePage de DocumentCloud <https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/home/home.js>

Ou bien le modèle Documents de Backbone <https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/model/documents.js>. 
Vous verrez que si vous n'utilisez le modèle qu'en lecture seule, vous pourrez les synchroniser bien plus simplement : 

{% highlight javascript %}
// Fetch all of the documents page mentions for a given search query.
fetchMentions : function(query) {
  $.getJSON(this.url() + '/mentions', {q: query}, _.bind(function(resp) {
    this.set(resp);
  }, this));
}, 

// Tell the server to reprocess the text for this document.
reprocessText : function(forceOCR) {
  var params = {};
  if (forceOCR) params.ocr = true;
  $.ajax({url : this.url() + '/reprocess_text', data: params, type : 'POST', dataType : 'json', success : _.bind(function(resp) {
    this.set({access : dc.access.PENDING});
  }, this)});
},
{% endhighlight %}


### Découper tout en petit morceau.

Je vous ai déjà dis que vous deviez découper vos vues en sous vues afin de ne travailler que sur des toutes petites portions du DOM. Mais vous pouvez, et devrez faire de même avec les modèles.

Lorsque l'on récupère un modèle à partir d'un JSON, on récupère un gros bloc d'un coup qu'il va falloir découper.

Ici prenons l'exemple d'un document contenant une liste d'annotations : 

{% highlight javascript %}
{
  "name": "document 1",
  "author": "white house",
  "annotations": [{
    "line": 154,
    "text": "it's true"
  }, {
    "line": 156,
    "text": "it's false"
  }]
}
{% endhighlight %}

Nous allons sortir les annotations du document afin de gérer indépendamment.

{% highlight javascript %}
dc.model.Document = Backbone.Model.extend({

  constructor : function(attrs, options) {
    this.notes = new dc.model.NoteSet();
    this.notes.url = function() {
      return '/documents/' + id + '/annotations';
    };
    if (this.get('annotations')) 
       this.notes.reset(this.get('annotations'));
{% endhighlight %}

Souvent nous aurons besoin de lier les événements du sous-modèle avec le modèle. Il faudra le faire à la main, mais toute la démarche est bien expliquée sur le site officiel : <http://documentcloud.github.com/backbone/#FAQ-nested>. Ce n'est pas trop difficile à faire et tout parait très logique.

### Et pour finir : la minification de vos fichier JS.

Vous n'alliez pas mettre en prod votre application avec tout ces petits
fichiers ...

Comme nous n'avons pas utilisé de loader javascript vous être entièrement
libre de choisir le minifier JS que vous voulez.

Je vais vous aider, si vous n'avez pas de Backend choisissez le build script HTML5BoilerPlate.

Si vous utilisez un Backend en JAVA Wro4J est un projet sérieux que vous pouvez utiliser sans risque.

Mais n'oubliez pas de servir vos assets JS et CSS avec la compression GZIP.
