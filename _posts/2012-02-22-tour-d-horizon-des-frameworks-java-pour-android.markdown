---
layout: post
title: Tour d'horizon des frameworks java pour Android
author: johanpoirier
tags: [android, framework, java]
published: false
---

L'API d'Android est vaste et plutôt bien fournie. Mais il nous arrive
régulièrement d'écrire toujours le même code (plus ou moins bien) pour
effectuer certaines tâches de base (récupération et mise à jour de View,
traitements BDD, récupération de ressources, ...). La communauté Android,
qui est très active, nous propose déjà beaucoup de frameworks différents
pour nous aider à développer plus facilement et plus proprement. Je vous
propose donc de faire un petit tour d'horizon des frameworks que j'ai pu
découvrir (et tester pour certains).

Nous allons procéder par thèmes :

## Dependency Injection

### [RoboGuice](http://code.google.com/p/roboguice)

RoboGuice en version 1.1 est basé sur Google Guice 2.0. Google Guice est
un framework léger d'injection de dépendances pour les applications Java.
Il est intégré à RoboGuice dans sa version sans AOP (donc sans
génération dynamique de bytecode).
Ce framework nous permet d'injecter directement des vues (View),
ressources, services systèmes, etc... dans nos activités et autres
classes de nos applications Android. Cela nous permet d'éliminer beaucoup
de bouts de codes répétitifs et améliore grandement la lisibilité du
code.
Côté performances, je n'ai pas eu le temps de réaliser un vrai benchmark
mais cela ne saurait tarder. L'injection se faisant au runtime, il est de
bonne augure de se poser la question de l'impact d'un tel framework sur
l'exécution d'une application sur un mobile. La taille de la librairie
est d'environ 550Ko, ce qui est non négligeable (surtout pour les "vieux"
terminaux Android).
Un point négatif est qu'il faut étendre toutes vos classes de bases
(Activity, IntentService, AsyncTask, ...) en des classes venant de
RoboGuice (RoboActivity, RoboIntentService, RoboAsyncTask, ...).
L'intégration de RoboGuice avec d'autres frameworks ayant la même
logique peut donc poser problème.
Un point positif est que la version 2.0 est en beta 3 et se base sur
Guice 3.

### [Android Annotations](http://androidannotations.org/)

Comme son nom l'indique, ce framework apporte un bon nombre d'annotations
qui nous permettent d'éliminer beaucoup de code boilerplate. Un exemple
valant mieux qu'un long discours :

{% highlight java %}
// Activity handled by Android Annotations
@EActivity(R.layout.mon_activite) // content view => R.layout.mon_activite
public class MyActivity extends Activity {
    @InjectView  // Injection de R.id.titre
    TextView titre;
    
    @DrawableRes(R.drawable.logo)
    Drawable logo

    @SystemService
    SearchManager searchManager;
}
{% endhighlight %}

Le framework fonctionne par génération de code à la compilation ([JAPT](http://docs.oracle.com/javase/6/docs/technotes/guides/apt/index.html)) en
créant des classes suffixées d'un \_. Une activity MyActivity devient donc
MyActivity\_ et doit être déclarée telle quelle dans le AndroidManifest.xml.
Ce qui peut paraître au premier abord un gros point négatif apporte un
avantage non négligeable : pas d'injection au runtime, le code généré
ressemble beaucoup à du code Android "classique". De plus, Android
Annotations a un footprint très léger : 50Ko.

J'ai un vrai coup de coeur pour ce framework qui peut beaucoup nous aider
au quotidien et permettre aux nouveaux développeurs Android de se concentrer
sur le fonctionnel. Le développeur a même prévu une intégration avec
RoboGuice, intégration qui sera étudiée plus tard.

### [Tiny Spring](http://code.google.com/p/tiny-spring/)

Petit projet inspiré par le DI et IoC de Spring et prévu pour être dépoyé sur
n'importe quelle plateforme. La définition des beans est faite en XML.

Projet très jeune et peu documenté, pas du tout prêt à être utilisé.


## ORM

### [ORMLite Android](http://ormlite.com)

ORM basé sur des annotations :

{% highlight java %}
// ORMLite annotation (table name described here)
@DatabaseTable(tableName = "accounts")
public class Account {
    @DatabaseField(id = true)
    private String name;

    @DatabaseField(canBeNull = false)
    private String password;
    ...
    Account() {
        // all persisted classes must define a no-arg constructor with at least package visibility
    }
    ...
}
{% endhighlight %}

Il s'intègre bien dans les applications Android (l'API pour Android est [là](http://ormlite.com/javadoc/ormlite-android/)).
L'intégration avec RoboGuice est possible et on obtient alors une stack qui
s'approche du Spring + Hibernate côté serveur. On annote notre modèle, nos
DAOs et nos services qui seront directement injectés dans nos activités.
Ca fonctionne bien ensemble, reste à déterminer si les performances sont
acceptables (Footprint de 274Ko).

### [ActiveAndroid](http://www.activeandroid.com/)

Encore un ORM basé sur les annotations mais payant (20$ USD).
Inactif depuis le 12/2010...

### [greenDAO](http://greendao-orm.com/)

ORM léger et basé sur de la génération de code (encore un !). Cette génération
est faite à la main. Le modèle est défini directement en Java (sans annotations).

Ce framework se veut très rapide et léger mais il ne me donne aucune envie
de le tester. Devoir générer le code à la main ainsi que décrire son modèle
à coups de lignes Java ne me donne pas l'impression de m'aider dans mes
développements. J'ai plutôt l'impression de revenir dans le temps.

### [AndroidDataFramework](http://code.google.com/p/androiddataframework/)

Framework espagnol, très peu documenté et en langue originale. ORM très
simple basé sur une définition du modèle en XML. A creuser un peu plus
pour voir si il vaut le coup.

### [db4o](http://www.db4o.com/android/)

A étudier (Footprint de 1Mo...).


## Presentation

### [android-binding](http://code.google.com/p/android-binding/)

Il s'agit d'un Model and View framework (MVVM à la [WPF](http://msdn.microsoft.com/fr-fr/netframework/aa663326)).

Le model gère les données et les hanlders (on peut voir la déclaration de la
Command AddContact qui est en fait un handler onClick directement "bindé"
dans une vue XML avec binding:onClick="AddContact") :

{% highlight java %}
public class ContactManagerModel {
    private Activity mContext;
    
    public CursorSource<ContactRowModel> ContactList = new CursorSource<ContactRowModel>(ContactRowModel.class, new Factory());
    
    public BooleanObservable ShowInvisible = new BooleanObservable(false);

    public Command PopulateList = new Command(){
        public void Invoke(View view, Object... args) {
            populateContactList();
        }
    };
    public Command AddContact = new Command(){
        public void Invoke(View view, Object... args) {
            launchContactAdder();
        }
    };

    private void populateContactList() {
        // Build adapter with contact entries
        Cursor cursor = getContacts();
        ContactList.setCursor(cursor);
    }
}
{% endhighlight %}

Les vues correspondent aux layout en xml avec des namespaces binding: (ce qui
rend l'édition des vues xml incompatibles avec l'éditeur intégré au plugin eclipse) :

{% highlight xml %}
<LinearLayout xmlns:android="http://...." xmlns:binding="http://www.gueei.com/android-binding/" ..>
    <TextView binding:text="FirstName" ...
{% endhighlight %}

Les Activity Android se chargent de faire le lien entre le modèle et la vue
et absolument rien d'autre. Cela permet donc de bien séparer la partie
présentation de la partie fonctionnelle.

Le framework est très prometteur et permet d'effectuer de la validation de
modèle à l'aide d'annotations sur les champs du modèle :

{% highlight java %}
// Validation annotation
@Required(ErrorMessage="You must put the login name! (you can try Jean-Michel)")
public final Observable<CharSequence> Login;
{% endhighlight %}

ou encore :

{% highlight java %}
// Validation annotation + equals rule
@Required
@EqualsTo(Observable="Password")
public final Observable<CharSequence> ConfirmPassword;
{% endhighlight %}

Définitivement, un framework à tester, ainsi que son intégration avec RoboGuice.

### [Spring Android](http://static.springsource.org/spring-android/docs/1.0.x/reference/htmlsingle/)

Il s'agit en fait de plusieurs modules de Spring pour le monde Android :

* **RestTemplate** : un client REST très pratique qui nous permet de dialoguer en JSON / XML / RSS (footprint de 413Ko pour du JSON avec Google GSON par exemple)
* **Android Auth** : facilite l'authentification via OAuth 1/2 (avec des modules spéciaux pour Twitter / Facebook via Spring Social)

Un peu lourd en terme de taille de librairie mais nous facilite grandement la
vie pour dialoguer avec des APIs REST. Android Annotations a d'ailleurs intégré
RestTemplate dans ses annotations et ça devient vraiment sympa à coder.
Il suffit de coder son service REST :

{% highlight java %}
// REST server annotation (you just have to declare your server url)
@Rest("http://monserveur.fr/api")
public interface MonServiceRest {

    @Get("/item/{id}")
    @Accept(MediaType.APPLICATION_JSON)
    Item getItem(long id);
}
{% endhighlight %}

Puis dans sa vue d'injecter le service et de l'utiliser ensuite :

{% highlight java %}
// REST service injection
@RestService
MonServiceRest monServiceRest;

@AfterViews
@Background
void init() {
    item = monServiceRest.getItem(2L);
    if(item != null) {
        showItem();
    }
}
{% endhighlight %}

En 10 lignes, j'ai codé un bout d'appli qui récupère directement mes données
depuis mon serveur. A faire sans l'aide de framework, c'est beaucoup plus long
et le bug est vite arrivé. A approfondir aussi !


## Outils

### [Robolectric](http://pivotal.github.com/robolectric/)

Framework de tests unitaires qui nous aiderait à faire du TDD. S'intègre avec
RoboGuice. A tester.

### [Maven Android plugin](http://code.google.com/p/maven-android-plugin/)

Permet d'utiliser Maven dans le cycle de vie de développement d'une application
Android. Cela peut devenir pratique si on commence à utiliser beaucoup de librairies.

Pour builder mon appli :

{% highlight sh %}
mvn install
{% endhighlight %}

Pour déployer l'application sur un terminal :

{% highlight sh %}
mvn android:deploy
{% endhighlight %}
