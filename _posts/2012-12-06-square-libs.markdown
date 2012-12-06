---
layout: post
title: Les libs Android de Square
author: johanpoirier
tags: [android, square, libraries, bus, injection, rest, http]
published: true
---

Ayant eu la chance d'aller au [Devoxx](http://devoxx.com) encore une fois cette année, j'ai pu assister à la conférence de [Jake Wharton](https://github.com/JakeWharton) (créateur de [ActionBarSherlock](http://actionbarsherlock.com/)) intitulée [Bootstrapping Android Apps with Open Source](http://devoxx.com/display/DV12/Bootstrapping+Android+Apps+with+Open+Source). Il s'agissait en fait d'une présentation de toutes les librairies développées et utilisées par [Square](https://github.com/square) pour développer leur [application de paiement par mobile](https://squareup.com/).

Le principal message que Jake a voulu faire passer était de nous inciter à partager nos projets ou nos divers développements en Open Source si cela peut avoir un intérêt pour la communauté. Square s'appuyant très largement sur des projets Open Source, ils se doivent de partager à leur tour leur travail.

Nous allons donc voir quelque unes de ces librairies illustrées dans une petite applicaton Android : Dagger, Otto et Retrofit.

<p class="center">
  <img src="/public/img/2012-11-28-square-libs/square.png" border="0" />
</p>


## [Dagger](http://square.github.com/dagger/) : l'injection de dépendance

Dagger se veut être le successeur de Guice dont le créateur [Bob Lee](https://twitter.com/crazybob) est justement le CTO de Square. Il a voulu créer un framework d'injection de dépendances rapide et moderne qui fonctionne aussi bien en java "classique" que sur Android avec sa JVM Dalvik adapté au mobile.

A l'instar d'[AndroidAnnotations](http://androidannotations.org/), Dagger s'appuie sur la génération de code à la compilation (JSR 269 : Annotation Processing). Pour chaque classe gérée par Dagger, une classe est créée contenant toute la logique d'injection en se basant sur le graph d'objets. C'est cette classe qui s'occupera d'invoquer les constructeurs et d'injecter les variables annotées en @Inject (JSR 330).

Dagger se passe donc de tout usage de réflexion contrairement à Guice (et sa version pour Android : RoboGuice). Et ceci est une bonne chose pour nos applications Android car le principal défaut de Guice était bien le temps de construire le graph au démarrage de l'application.

Place à l'illustration de la librairie par un peu de code pour Android :

### Les principes

{% highlight java %}
// Main activity of the app
public class MainActivity extends Activity {

    @Inject
    UserService userService;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        DaggerModule.getObjectGraph().inject(this);
    }

    ...
}
{% endhighlight %}

Cet exemple nous montre 2 choses :
 - l'annotation @Inject de mon service gérant mes utilisateurs
 - l'injection de la classe à la création de l'activité

Pour satisfaire les dépendances, Dagger construit les objets via leurs constructeurs sans argument annotés par @Inject ou bien via des @Provides si la première solution n'est pas possible. Les méthodes annotées en @Provides doivent appartenir à un @Module :

{% highlight java %}
// Dagger module for the app
@Module(entryPoints = { MainActivity.class })
public class DaggerModule {

    private static ObjectGraph graph;
    
    @Provides
    public UserService provideUserService() {
        return new UserService();
    }
}
{% endhighlight %}

Ce module est indispensable pour construire le graph d'objets :

{% highlight java %}
// graph construction from the module and its entry points
ObjectGraph objectGraph = ObjectGraph.create(new DaggerModule());
{% endhighlight %}

Grâce à ce graph d'objets, nous pouvons injecter les classes gérées par Dagger :

{% highlight java %}
// self inject
objectGraph.inject(this);
{% endhighlight %}

Il y a plein d'autres concepts intéressants dans Dagger comme la surcharge de Module à des fins de tests, ou encore les @Singleton et l'injection statique.

### En pratique sur Android

Pour éviter d'appeler l'ObjectGraph pour injecter mes activités dans le onCreate, j'ai créé une DaggerActivity dont toutes mes activités héritent :

{% highlight java %}
// Parent of all activities
public abstract class DaggerActivity extends Activity {

    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        DaggerModule.getObjectGraph().inject(this);
    }
}
{% endhighlight %}

Le module de mon application s'occupe de fournir les instances via des @Provides et sert de point d'entrée à toute mon application pour fournir le graph d'objets :

{% highlight java %}
// the entry point is where the graph begins
@Module(entryPoints = { MainActivity.class })
public class DaggerModule {

    private static ObjectGraph graph;

    @Provides
    @Singleton
    public MyService provideUserService() {
        return new UserService();
    }

    @Provides
    @Singleton
    public Bus provideBus() {
        // our event bus running on any thread
        return new Bus(ThreadEnforcer.ANY);
    }
    
    // give access to the graph in the entire app
    public static ObjectGraph getObjectGraph() {
        if(graph == null) {
            graph = ObjectGraph.create(new DaggerModule());
        }
        return graph;
    }
}
{% endhighlight %}

J'ai réalisé une petite application de test disponible sur Github : [squarelibs-android-demo](https://github.com/johanpoirier/squarelibs-android-demo). Au lancement de l'application, c'est immédiat, pas de temps de création du graph décelable par l'utilisateur.


## [Otto](http://square.github.com/otto/) : le bus d'évènements

Otto est un bus d'évènements permettant de découpler les différentes parties de nos applications Android. Ce projet est un fork de [Guava](http://code.google.com/p/guava-libraries/) modifié et spécialisé pour Android.

### Le principe

Il est extrêmement simple.

Pour publier un évènement, il suffit de poster un évènement sur le bus :

{% highlight java %}
// AwesomeEvent could be anything
bus.publish(new AwesomeEvent());
{% endhighlight %}

Pour s'abonner à un évènement, il faut s'enregistrer auprès du bus :

{% highlight java %}
// the bus need to know that you're listening
bus.register(this);
{% endhighlight %}

et être prêt à recevoir l'évènement :

{% highlight java %}
// subscription to the AwesomeEvent(s)
@Subscribe
public void awesomeEventOccured(AwesomeEvent event) {
    Log.d("AwesomeApp", event.getAwesomeMessage());
}
{% endhighlight %}

Pour ne plus recevoir les évènements, il suffit de se désenregistrer :

{% highlight java %}
// tell the bus we don't care anymore
bus.unregister(this);
{% endhighlight %}

Enfin, il est possible de fournir une valeur dès l'enregistrement sur le bus via des @Produce. Cela peut permettre ainsi de fournir le dernier évènement publié sur le bus au client qui vient juste de s'enregistrer.

{% highlight java %}
// useful when you need to know what was going on before you listened
@Produce
public AwesomeEvent produceAwesomeEvent() {
    // lastAwesomeEvent must exist
    return new AwesomeEvent(this.lastAwesomeEvent);
}
{% endhighlight %}

Les producteurs comme les clients souscripteurs doivent s'enregistrer auprès du bus.


### En pratique sur Android

On a vu avec Dagger que le module de l'application peut produire des instances à injecter dans les classes gérées par celui-ci : c'est exactement ce qu'il nous faut pour fournir une intance du bus à tous ceux qui en ont besoin :

{% highlight java %}
// take the bus !
@Module(entryPoints = { MainActivity.class })
public class DaggerModule {
    
    ...

    @Provides
    @Singleton
    public Bus provideBus() {
        // our event bus running on any thread
        return new Bus(ThreadEnforcer.ANY);
    }

    ...
}
{% endhighlight %}

Nous allons également modifier notre DaggerActivity :

{% highlight java %}
// bus injection and registration
public abstract class DaggerActivity extends Activity {

    @Inject
    protected Bus bus;
    
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dagger will inject instances
        DaggerModule.getObjectGraph().inject(this);
        
        // The activity will register itself to the Otto bus
        bus.register(this);
    }
}
{% endhighlight %}

Ainsi, chaque activité a accès au bus.
Pour l'exemple, mon activité va écouter les évènements liés à l'activité WiFi du téléphone :
{% highlight java %}
// event subscription
public class MainActivity extends Activity {

    ...

    @Subscribe
    public void displayNetworks(final NetworksAvailableEvent event) {
        // event is coming from the background, requesting UI thread
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                networkListAdapter.changeData(event.getNetworks());
            }
        });
    }

    ...
}
{% endhighlight %}

L'évènement NetworksAvailableEvent est produit par un BroadcastReceiver qui tourne en background. C'est lui qui va poster des évènements sur le bus.

{% highlight java %}
// event post on the bus
public class WifiInfoReceiver extends DaggerBroadcastReceiver {

    private List<ScanResult> scanResults;
    private WifiManager wifiManager;

    @Inject
    protected Bus bus;

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);

        DaggerModule.getObjectGraph().inject(this);

        // scan results available : post event to the bus to display on the main activity
        if (intent.getAction().equals(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)) {
            scanResults = wifiManager.getScanResults();
            bus.post(new NetworksAvailableEvent(scanResults));
        }
        // the wifi state changed : display it on the main activity
        else if (intent.getAction().equals(WifiManager.WIFI_STATE_CHANGED_ACTION)) {
            bus.post(new WifiStateChangeEvent(wifiManager.getWifiState()));
        }
    }
}
{% endhighlight %}


## [Retrofit](https://github.com/square/retrofit) : un client REST

Retrofit est un client REST pour Android, dans le même esprit que Spring Android [RestTemplate](http://static.springsource.org/spring-android/docs/1.0.x/reference/html/rest-template.html).

Retrofit est très léger : 52 Ko contre 252 Ko pour RestTemplate.

### Le principe

Encore une fois très simple, il suffit d'écrire nos interfaces via les annotations @GET, @POST, @DELETE, @PUT :

{% highlight java %}
// our rest client for the github api
public interface Github {

    @GET("orgs/square/repos")
    List<Repo> getSquareRepos();

    @GET("orgs/square/repos/{id}")
    Repo getSquareRepo(@Named("id") String id);
}
{% endhighlight %}

Les classes Repo et Org sont de simples POJOs qui ont les mêmes attributs (même partiellement) que ceux de l'API appelée.

Pour utliser notre interface, il nous faut utiliser un RestAdapater :

{% highlight java %}
// the RestAdapter builder is nice
restAdapter = new RestAdapter.Builder()
    .setServer(new Server("https://api.github.com"))
    .setClient(new DefaultHttpClient())
    .setConverter(new GsonConverter(new Gson()))
    .build();
{% endhighlight %}

et de l'appeler avec notre interface :

{% highlight java %}
// rest client instanciation
Github githubApi = restAdapter.create(Github.class);
List<Repo> repos = githubApi.getSquareRepos();
{% endhighlight %}

Et voilà !


### En pratique sur Android

Nous allons encore une fois utiliser notre module Dagger comme point d'entrée de l'application pour avoir accès à notre RestAdapter dans toute l'application :

{% highlight java %}
// Dagger + Retrofit : awesome
@Module(entryPoints = { Main.class })
public class DaggerModule {

    private static ObjectGraph graph;

    ...
    
    @Provides
    @Singleton
    public RestAdapter getRestAdapter() {
        // give access to the rest api to the entire app
        return new RestAdapter.Builder()
            .setServer(new Server("https://api.github.com"))
            .setClient(new DefaultHttpClient())
            .setConverter(new GsonConverter(new Gson()))
            .build();
    }
}
{% endhighlight %}

Nous utilisons Gson comme librairie de sérialisation/désérialisation et le client HTTP par défaut d'Android. A ce propos, Square propose une autre librairie nommée [OkHttp](https://github.com/square/okhttp) qui est un client HTTP+SPDY pour Android. OkHttp permet de pouvoir compter sur le même client HTTP sur toutes les versions d'Android et ne pas dépendre de la version de celui-ci. Il faudrait le tester et surtout attendre une version plus finalisée.


## Conclusion

Dagger, Otto et Retrofit sont de petites librairies, encore jeunes mais très prometteuses. Elles sont parfaitement adpatées à un contexte d'utilisation mobile car elles ont été pensées pour. Elles fonctionnent parfaitement ensemble mais si vous ne devez en retenir qu'une, je vous conseille Otto qui est un merveilleux petit outil pour découpler les composants de votre application Android.

Pour rappel, ces 3 librairies sont illustrées dans une application Android sur Github : [squarelibs-android-demo](https://github.com/johanpoirier/squarelibs-android-demo). Dans le même registre, [Pierre-Yves Ricau](https://github.com/pyricau) a fourni un exemple d'intégration de Dagger, Otto et AndroidAnnotations sur Github : [CleanAndroidCode](https://github.com/pyricau/CleanAndroidCode).
