---
layout: post
title: Des astuces pour structurer un projet BackboneJS
author: filirom1
tags: [backbonejs, javascript, webapp, spa]
---
<style>
.code {
  font-size: 90%;
}
</style>

[Bakbone](http://documentcloud.github.com/backbone/) est un projet que j'aime beaucoup car il embarque en très peu de lignes, un ensemble de bonnes pratiques qui rendra votre code bien plus lisible et
compréhensible par les autres développeurs.

<p class="center">
  <img src="/public/img/2012-02-25-backbone-tips-from-document-cloud/backbone.png" border="0" />
</p>

Mais Backbone comme jQuery,
vous laisse relativement libre pour structurer votre application. Ce qui est
très bien, mais qui pourrait vous laisser un peu démuni pendant la
phase d'apprentissage.

Cet article fait suite à [une session LyonJS](http://filirom1.github.com/lyonjs-DocumentCloud-slides/), pendant laquelle je commentais les sources de DocumentCloud afin d'en sortir les bonnes pratiques.

Maintenant, je vais beaucoup vous parler de la structuration d'un projet Backbone, mais finalement très peu du framework en tant que tel. Je vous laisse le soin de lire la [doc officiel](http://documentcloud.github.com/backbone/), ou même le [code commenté](http://documentcloud.github.com/backbone/docs/backbone.html) car celui ci est très claire. Pour ceux qui ne le connaissent pas encore, Backbone possède un Routeur pour gérer des URLs, des modèles et des collections qui ne partagent pas le même cycle de vie que les vues, des vues qui sont misent à jours automatiquement dès que le modèle change, un système d'événements simple mais efficace, un modèle objet très pratique, ... et tout ça dans 5Ko :)

Ce qui m'a plu dans l'utilisation faite de Backbone chez DocumentCloud, c'est la simplicité et la facilité de compréhension du code. Je vais donc vous présenter une approche pragmatique et minimaliste qui vous permettra de mettre en place des projets fronts conséquent (comme celui de [DocumentCloud](http://www.documentcloud.org/public/search/)).

Cet article se détache des présentations du type [How to build large scale jQuery applications](http://addyosmani.com/blog/large-scale-jquery/) qui je trouve bien pensé mais plus complexe à appliquer. Je trouve l'idée d'utiliser RequireJs et un PubSub intéressante, mais au final cela entraine une surcouche de complexité qui n'est pas nécessaire pour toute les applications.

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

Backbone, grâce à son Routeur, nous permet de construire des Single Page Web Applications (SPA) très simplement.

Une SPA signifie qu'il n'y a qu'un seul fichier HTML à charger pour gérer l'ensemble de l'application.

Ce fichier est en général très simple puisque les templates seront injectées dans le DOM en fonction de l'URL de la page.

Si vous voulez un exemple d'index.html prenez celui de HTML5Boilerplate dont voici la partie chargtement des scripts :

{% highlight html %}
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery.js"><\/script>')</script>

<!-- scripts concatenated and minified via build script -->
<script src="js/vendor/underscore.js"></script>
<script src="js/vendor/backbone.js"></script>
<script src="js/application.js"></script>
<!-- all your scripts here -->
<!-- end scripts -->
{% endhighlight %}



### Templates JST

Comme notre index.html est tout vide, il nous faudra gérer nos templates dans des fichiers séparés.

(J'ouvre une parenthèse, mais je préfère gérer mes templates HTML dans des fichiers séparés plutôt que de les inclure dans des balises script dans index.html)

Ce qu'il nous faut, c'est créer un fichier HTML, qui sera ensuite compilé en une fonction javascript, ce qui nous permettra de récupérer le texte dans notre application.

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

Mantenant vous avez compris le principe des JST. Si jamais ce n'est pas le cas,
lisez cet article là <http://ricostacruz.com/backbone-patterns/#jst_templates>, ou les liens ci dessous.

Il existe de nombreuses solutions pour faire du JST dans votre application, mais, si vous souhaitez quelque chose qui fonctionne avec n'importe quel template (underscore template, jquery-tmpl, handlebars, des strings pures) jetez un oeil à ce projet <https://github.com/Filirom1/universal-jst> #auto-promotion :)

Sinon regardez les projets ci dessous :

 * <http://github.com/wookiehangover/handlebars-jst>
 * <http://github.com/wookiehangover/jquery-tmpl-jst>
 * <http://github.com/mklabs/templatify>
 * <http://documentcloud.github.com/jammit/#jst>
 * <http://github.com/sstephenson/sprockets>


### Utilisation d'un Namespace

Trouvez un nom court pour votre namespace qui n'est pas un mot clé réservé. Par exemple, DocumentCloud à choisi d'utiliser ses initiales : `dc`

On défini le namespace au tout début de notre application, afin de
pouvoir l'utiliser n'importe où par la suite.

[application.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/application.js) :

{% highlight javascript %}
// Provide top-level namespaces for our javascript.
(function() {
  window.dc = {};
  dc.app = {};         /* anything that is shared globally in the application */
  dc.ui = {};          /* views */
  dc.model = {};       /* models and collections */
})();
{% endhighlight %}

Comme nous allons découper notre application en plein de petits fichiers, 
nous allons augmenter ce namespace dans chaque fichier:

[js/ui/workspace/panel.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/ui/workspace/panel.js):

{% highlight javascript %}
dc.ui.Panel = Backbone.View.extend({
  //...
});
{% endhighlight %}

[js/ui/common/dialog.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/ui/common/dialog.js) :

{% highlight javascript %}
dc.ui.Dialog = Backbone.View.extend({
      //...
});
{% endhighlight %}

[js/model/documents.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/model/documents.js) :

{% highlight javascript %}
dc.model.Document = Backbone.Model.extend({
      //...
});
{% endhighlight %}


En plus comme chacun de nos fichiers est contenu dans un objet, on ne risquera pas de pourrire la globale window ;)
Plus besoin d'entourer notre code dans un fonction auto appelante :

{% highlight javascript %}
// Before
(function(){
  /* your code here */
})()
{% endhighlight %}

De plus maintenant, chacun de nos objets est facilement accessible via la console.

    $ console.log(new dc.model.Document());

Ce qui est très pratique pour débugguer.

Comme vous allez beaucoup écrire ce namespace (ici `dc`), je vous conseil de choisir quelque chose de court. Deux lettres c'est bien.


### Dépendances et initialisations

Une des difficultés en Javascript c'est la gestion des dépendances entre les fichiers.

Dans le cas de notre application, il y a 2 sortes de dépendances :

* à la lecture du fichier, les variables doivent être connu par l'interpréteur JavaScript.

Comme nos fichiers commenceront tous par `dc.xxx.xxxx = Backbone.XXXXX.extend({`, il sera facile pour nous de gérer l'ordre dans l'index.html afin qu'il n'y ai pas de problèmes de dépendances.

Les dépendances qui se trouvent à l'intérieur des fonctions (initialize, render...) seront résolues plus tard.


* lors de l'instantiation, si l'on fait appel à un module externe, celui ci doit avoir été instancié préalablement.

Je m'explique, nous allons découper notre application en plein de petits fichiers. Une fois instancié ces modules vont communiquer entre eux. Mais on peut faire la distinction entre les modules qui seront utilisés par toute l'application et les modules qui ne seront utilisés que localement.



#### Dépendances partagées globalement

Si on défini un module comme quelque chose pouvant être appelé par n'importe quel autre module dans l'application. Il est important d'instancier ces modules dans un ordre précis (un module peut dépendre d'un autre module), c'est pour cela que l'on instanciera ces modules dans une fichier unique, par exemple le routeur. Ces modules seront accessibles par toute l'application.

<p class="center">
  <img src="/public/img/2012-02-25-backbone-tips-from-document-cloud/dependences-globales.png" border="0"  />
</p>

[js/app/workspace.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/app/workspace.js) :

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

Dans une application, nous avons toujours besoin de découper des modules en sous modules et donc d'avoir une relation de dépendance entre les deux.

Mais comme cette relation est du type parent - enfant, ce sera toujours via le module parent que les enfants pourront discuté entre eux ou avec le parent.

<p class="center">
  <img src="/public/img/2012-02-25-backbone-tips-from-document-cloud/dependences-hierarchiques.png" border="0" />
</p>

Nous allons donc attaché les instances des enfants au parent.

[js/app/editor](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/app/editor.js) :

{% highlight javascript %}
dc.app.editor = new Backbone.View.extend({

  initialize : function(docId, options) {
    this.createSubViews();
    this.renderSubViews();
  },
  
  createSubViews : function() {
    this.controlPanel       = new dc.ui.ViewerControlPanel();
    this.sectionEditor      = new dc.ui.SectionEditor();
    this.annotationEditor   = new dc.ui.AnnotationEditor();
    this.removePagesEditor  = new dc.ui.RemovePagesEditor({editor : this});
    this.reorderPagesEditor = new dc.ui.ReorderPagesEditor({editor : this});
    this.editPageTextEditor = new dc.ui.EditPageTextEditor({editor : this});
    this.replacePagesEditor = new dc.ui.ReplacePagesEditor({editor : this});
  },
{% endhighlight %}

Regardez également comment le module parent partage son instance avec ses enfants : `new dc.ui.ReplacePagesEditor({editor : this})`.
C'est ainsi que les enfants peuvent discuter avec le module parent, ou discuter avec les autres enfants.


#### Remarque sur RequireJS

Si pendant la lecture de ce paragraphe vous vous dites que vous n'avez pas besoin de tout ça car vous avez RequireJs. Sachez que lorsque vous définissez un module avec RequireJs, vous avez le choix entre retourner une classe, ou un singleton, mais faire les deux devient problématique. Vous aurez donc solutionné un problème, mais pas les deux.

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


### Communication entre modules.

Le plus simple pour faire communiquer deux modules entre eux, c'est de les faire interagir directement.

Prenons un exemple, ici le module Document communique directement avec le module Searcher.

[js/ui/documents/document.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/ui/documents/document.js) :

{% highlight javascript %}
dc.ui.Document = Backbone.View.extend({
  // ...

  searchAccount : function() {
    dc.app.searcher.addToSearch('account', this.model.get('account_slug'));
  },

  searchOrganization : function() {
    dc.app.searcher.addToSearch('group', this.model.get('organization_slug'));
  },

  searchSource : function() {
    dc.app.searcher.addToSearch('source', this.model.get('source').replace(/"/g, '\\"'));
  },

});
{% endhighlight %}

Je vous entends crier au loin, mais c'est fortement coupler ça !!!

Comme il n'y a pas de typage fort en javascript vous vous en moquez! C'est comme si vous utilisiez des interfaces en Java. Si vous voulez remplacer un module par un autre, il suffit que les deux modules possèdent les mêmes signatures de fonctions et vous pouvez les remplacer.

Maintenant si vous voulez savoir quelles sont les fonctions publiques et les fonctions privées, je vous déconseille de les préfixer par un undercsore. Déjà, c'est moche et en plus c'est inutile car un simple grep suffit pour savoir quelles sont les méthodes publiques :

    $ grep -R "replacePagesEditor\." .
    ./public/javascripts/ui/workspace/toolbar.js:    dc.app.editor.replacePagesEditor.open(); 
    ./public/javascripts/editor/control_panel.js:    dc.app.editor.replacePagesEditor.toggle();
    ./public/javascripts/app/editor.js:              this.replacePagesEditor.close();


Après vous pouvez communiquer via des événements, mais il faudra un peu plus de travail pour synchroniser plusieurs événements.  De plus, les appels seront moins facile à repérer dans le code.

Le problème avec les événements en JS, c'est que l'on perd vite le contrôle de l'application et tout parait magique.

Je ne vous interdit pas d'utiliser les événement, mais faîtes le avec parcimonie et justesse.


### Utiliser le modèle objet

Quand vous utilisez Backbone, vous créez des classes filles de Backbone.View, Backbone.Model, Backbone.Collection, ...

Alors pourquoi ne pas créer ses propres classe mère :

[js/ui/accounts/account_dialog.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/ui/accounts/account_dialog.js) :

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

[js/ui/common/dialog.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/ui/common/dialog.js) :

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


Ou même, améliorer nos classes à l'aide de mixins

[js/model/documents.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/model/documents.js) :

{% highlight javascript %}
_.extend(dc.model.DocumentSet.prototype, dc.model.Selectable);
{% endhighlight %}


### Des vues limitées à une petite portion du DOM

Une des choses les plus belles avec Backbone c'est l'attribut `this.el`, et les nombreuses utilisations : `this.$el`, `this.$`, ... Utiliser `el` vous permet de limiter l'interaction qui vous aurez avec le DOM. Non seulement vous gagnez en performance (les sélecteurs jQuery sont précis) mais en plus cela vous empêche de modifier des éléments qui n'appartiennent pas à votre vue.

<p class="center">
  <img src="/public/img/2012-02-25-backbone-tips-from-document-cloud/DocumentCloud.png" border="0" width="600" />
</p>


Alors vous l'aurez compris, je ne veux plus voir de `$` dans vos applications Backbone, seulement des `this.$` :D

### Des conventions qui rendent la lecture du code tellement plus agréable.

Il y a une autre chose que j'aime dans Backbone, ce sont ses conventions. Par exemple dans une vue, on repère instantanément les interactions utilisateurs : 

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

Mais vous pouvez faire la même chose partout, choisir des conventions et s'y tenir. Par exemple, mettre les constantes et haut et en majuscule :)

    Backbone.View.extend({
        FAVORITES_URL : '//twitter.com/favorites/documentcloud.json?callback=?',


### Créer des plugins Backbone

Tout le monde connait les plugins jQuery. Mais saviez vous que vous pouvez faire la même chose avec Backbone?

Par exemple, dans DocumentCloud il y a un plugin bien pratique le `setMode`.
SetMode permet de gérer une machine à état au niveau des vues. Lorsque l'on fait un setMode, on ajoute une classe CSS sur le `el` de la vue (pratique pour le CSS) et on ajoute un attribut à l'instance de la vue afin de faciliter les interactions inter-modules.


Je sens que vous ne m'avez pas bien compris, voici un exemple:

{% highlight javascript %}
xxx.setMode('is', 'draggable');

// xxx.el === '<div class="is_draggable"></div>'
// xxx.modes === {draggable: 'is'}

xxx.setMode('prompt', 'dialog');
xxx.setMode('isnot', 'draggable');

// xxx.el === '<div class="isnot_draggable prompt_dialog"></div>'
// xxx.modes === {draggable: 'isnot', dialog: 'prompt'}
{% endhighlight %}

[js/lib/backbone_extensions.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/lib/backbone_extensions.js): 

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

[js/lib/jquery_extensions.js](https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/lib/jquery_extensions.js):

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

Backbone est suffisamment petit pour que n'importe quel développeur se sente à l'aise avec les sources.
Franchement c'est tellement rare ça alors profitez en !

Vous pouvez avoir une utilisation minimaliste de Backbone.

Regarder par exemple la HomePage de DocumentCloud <https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/home/home.js>

Ou bien le modèle Documents de Backbone <https://github.com/lyonjs/documentcloud/blob/master/public/javascripts/model/documents.js>. 

Vous verrez que si vous n'utilisez le modèle qu'en lecture seule, vous pourrez le synchroniser bien plus simplement :

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

Nous allons sortir les annotations du document afin de les gérer indépendamment.

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

Souvent vous aurez besoin de lier les événements du sous-modèle avec le modèle. 
Il faudra le faire à la main, mais toute la démarche est bien expliquée sur le site officiel : <http://documentcloud.github.com/backbone/#FAQ-nested>. 
Ce n'est pas trop difficile à faire et tout est très logique.

### Et pour finir : la minification de vos fichier JS.

Vous n'alliez pas mettre en prod votre application avec tout ces petits
fichiers ...

Comme nous n'avons pas utilisé de loader javascript vous être entièrement
libre de choisir le minifieur JS que vous voulez. Et c'est un luxe ça !!!

Si vous n'avez pas de Backend, choisissez plutôt un des [builds scripts de HTML5BoilerPlate](http://html5boilerplate.com/docs/Build-script/).

Si vous utilisez un Backend en JAVA, [Wro4J](http://code.google.com/p/wro4j/) est un projet sérieux que vous pouvez utiliser sans risque.

Et n'oubliez pas de servir vos assets JS et CSS avec la compression GZIP activé :)
