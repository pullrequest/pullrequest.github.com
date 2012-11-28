---
layout: post
title: AndroidAnnotations
author: johanpoirier
tags: [android, androidannotations, framework, annotations, injection]
published: true
---

Dans le monde des [frameworks pour le développement Android](http://androidannotations.org/), je vous présente [AndroidAnnotations](http://androidannotations.org/) (mon coup de coeur). Comme son nom l’indique, ce framework apporte un bon nombre d'annotations qui nous permettent d'éliminer beaucoup de code boilerplate. Il simplifie le code et améliore sa lisibilité. Nous allons voir comment : 

<p class="center">
  <img src="public/img/2012-06-06-androidannotations/androidannotations.png" border="0" />
</p>


## Le principe

AA fonctionne par génération de code à la compilation (JAPT) en créant des classes suffixées d'un **\_**. Une activity **MyActivity** devient donc **MyActivity\_** et doit être déclarée telle quelle dans le AndroidManifest.xml. Ce qui peut paraître au premier abord un gros point négatif apporte un avantage non négligeable : pas d'injection au runtime, le code généré ressemble beaucoup à du code Android "classique".


## Les annotations

Nous allons voir les principales annotations regroupées par thème.
La [liste](https://github.com/excilys/androidannotations/wiki/AvailableAnnotations) complète est disponible sur la [documentation](https://github.com/excilys/androidannotations/wiki) du projet sur Github.


### Pour les composants

#### @EActivity

{% highlight java %}
// ...
@EActivity(R.layout.my_bookings)
public class MyBookings extends Activity {
    ...
}
{% endhighlight %}

Il s'agit de l'annotation principale. Elle permet la génèration de l'actvité **MyBookings_** dans laquelle la méthode onCreate est généré automatiquement et où le layout est défini avec la valeur contenue dans l'annotation. On peut dès maintenant utiliser quasiment toutes les autres annotations dans cette activité.

#### @EService, @EProvider, @EReceiver, EFragment...

La même chose pour les Service, IntentService, ContentProvider, BroadcastReceiver et autres fragments.

{% highlight java %}
// ...
@EService
public class MyService extends IntentService {
    ...
}
{% endhighlight %}

#### @EView et @EViewGroup

L'utilisation de ces 2 annotations nous facilite la création et l'utilisation de widgets personnalisés.

- `@EView` permet de redéfinir un bouton par exemple :

{% highlight java %}
// ...
@EView
public class MyButton extends Button {

    @StringRes
    String someStringResource;

    public MyButton(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
}
{% endhighlight %}

- `@EViewGroup` permet de définir un composant complet composé de plusieurs widgets dont des @EView :

{% highlight java %}
// ...
@EViewGroup(R.layout.title_with_subtitle)
public class TitleWithSubtitle extends RelativeLayout {

    @ViewById
    protected TextView title, subtitle;

    public TitleWithSubtitle(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void setTexts(String titleText, String subTitleText) {
        title.setText(titleText);
        subtitle.setText(subTitleText);
    }
}
{% endhighlight %}

Il faut comme toujours bien penser à utiliser le nom des classes générées avec le **\_** dans les layout.

#### @EBean

Une simple classe peut bénéficier d'AA grâce à cette annotation. Cela nous permet de pouvoir faire de l'injection partout où cela est nécessaire :

{% highlight java %}
// ...
@EBean(scope = Scope.Singleton)
public class HotelService {

    @RootContext
    Context context;
    
    @Bean
    HotelDao hotelDao;
    
    public HotelService() {
        
    }
}
{% endhighlight %}

Dans l'exemple ci-dessus, on injecte HotelDao (qui lui-même a été déclaré en @EBean) dans le @EBean HotelService qui par ailleurs a été défini en Singleton.
Ceci nous offre des perspectives très intéressantes car il nous permet de faire de l'injection de dépendances dans notre application sans risque de diminuer les performances (car aucune injection au runtime). Nous verrons plus bas un exemple plus évolué avec le couplage à ORMLite.


### L'injection

On peut quasiment tout injecter dans nos classes annotées, des vues, des ressources ou encore des services systèmes.

#### @ViewById, @StringRes, @DrawableRes, ...

{% highlight java %}
// ...
@EActivity(R.layout.my_bookings)
public class MyBookings extends Activity {

    @Bean
    UserService userService;
    
    @ViewById(R.id.buttonHotels)
    Button hotelsButton;

    ...
}
{% endhighlight %}

Dans l'exemple, on voit une belle illustration de ces annotations.

- le @ViewById nous débarasse enfin des findViewById(R.id.buttonHotels)
- le DrawableRes charge n'importe quel ressource présente dans nos répertoire /drawable/

#### @SystemService

Injection de systèmes services d'Android comme le NotificationManager, le LocationManager ou encore le ConnectivityManager.

#### @RootContext

L'accès au contexte est essentiel dans une application Android, et l'annotation @RootContext permet de fournir le contexte de l'application là où aucun autre n'est directement disponible.

#### @Extra

Permet de récupérer les valeurs passées dans un Intent. Encore une fois, ça simplifie la vie :

{% highlight java %}
// get value from extra bundle
@Extra("hotel_key")
Hotel hotel;
{% endhighlight %}

#### @AfterViews, @AfterInject

- `@AfterViews` annote une méthode pour indiquer qu'elle doit être appelée après que les vues aient été récupéré (via les @ViewId). Très pratique quand on doit manipuler ces vues avant l'affichage. La méthode annotée est souvent utilisée à la place de onResume().

- `@AfterInject` annote également une méthode mais est appelée après l'injection dans la classe annotée par un @EBean

### La gestion des évènements

#### @Click, @LongClick et @Touch

Ces annotations nous débarasse des listener d'events. Plus besoin d'implémenter d'interfaces, il suffit d'annoter une méthode @Click :

{% highlight java %}
// replace onClick method
@Click(R.id.buttonHotels)
public void buttonHotelsClick() {
    startActivity(new Intent(this, HotelsList_.class));
}
{% endhighlight %}

Simple, non ?

#### @OptionsMenu et @OptionItem

Idem pour la gestion des options de la touche menu. Le @OptionsMenu déclare le layout du menu pour l'activité et les @OptionItem gère l'évènement de l'option sélectionnée :

{% highlight java %}
// options declaration with layout
@EActivity(R.layout.my_bookings)
@OptionsMenu(R.menu.bookings)
public class MyBookings extends Activity {

    @OptionsItem(R.id.menu_search)
    public void searchOption() {
        onSearchRequested();
    }

    @OptionsItem(R.id.menu_bench)
    public void benchmarkOption() {
        benchmark();
    }
    
    ...
}
{% endhighlight %}

### Les threads

#### @Background

Fini les AsyncTask, le @Background simplifie à l'extrême les tâches de fond !
Cette annotation s'applique à une méthode qui, une fois appelée, s'exécute comme une AsyncTask. A la fin d'une telle méthode, vous pouvez appeler une autre méthode annotée par @UiThread pour agir sur l'interface utilisateur :

#### @UiThread

{% highlight java %}
// background and async task
@Background
public void benchmark() {
    // benchmark some stuff
    displayToast("Benchmark done !");
}

@UiThread
public void displayToast(String text) {
    Toast.makeText(this, text, Toast.LENGTH_LONG).show();
}
{% endhighlight %}


### Bonus

#### @SharedPref et @Pref

Cette annotation permet d'utiliser les SharedPreferences de façon typesafe.
Il suffit de déclarer une interface :

{% highlight java %}
// ...
@SharedPref(value=Scope.UNIQUE)
public interface BookingPrefs {
    
    @DefaultLong(-1L)
    long loggedUserId();
}
{% endhighlight %}

Puis tout simplement dans une activité :

{% highlight java %}
// ...
@EActivity(R.layout.my_bookings)
public class MyBookings extends Activity {

    @Pref
    BookingPrefs_ prefs;
    
    @Override
    protected void onResume() {
        if (prefs.loggedUserId().get() == -1L) {
            // show login activity
            startActivityForResult(new Intent(this, Login_.class), LOGIN_ACTIVITY_CODE);
        } else {
            displayBookings();
        }
    }
}
{% endhighlight %}

#### @Rest

[@Rest](https://github.com/excilys/androidannotations/wiki/Rest%20API) permet de déclarer une interface d'accès à une API Rest. Il est très courant d'appeler une API Rest dans nos applications, cette annotation se charge de générer toute l'implémentation nécessaire. Par contre, cela nécessite l'utilisation de RestTemplate du framework [Spring for Android](http://www.springsource.org/spring-android).

{% highlight java %}
// ...
@Rest("http://pullrequest.org/booking/api")
public interface BookingRestApi {
    
    @Get("/hotels")
    @Accept(MediaType.APPLICATION_JSON)
    HotelList getHotels();
    
    @Get("/hotel/{id}")
    @Accept(MediaType.APPLICATION_JSON)
    Hotel getHotel(long id);
    
    void setRestTemplate(RestTemplate restTemplate);
}
{% endhighlight %}

Le @Rest précise l'url de l'API. Ensuite, cela ressemble beaucoup à du JAX-RS.

Petite précision pour faire du JSON ou du XML, il faut ajouter un marshaller comme Jackson ou GSon et le préciser à l'appel des méthodes REST :

{% highlight java %}
// add GsonMessageConverter to resttemplate
RestTemplate restTemplate = new RestTemplate();
restTemplate.getMessageConverters().add(new GsonHttpMessageConverter());
bookingRestApi.setRestTemplate(restTemplate);

// call to API
HotelList hotels = bookingRestApi.getHotels();
{% endhighlight %}

## Intégration à d'autres frameworks

### RoboGuice

AA s'intègre à RoboGuice 1.1.1 (pas de support de la 2.0 encore) à l'aide de l'annotation [@RoboGuice](https://github.com/excilys/androidannotations/wiki/RoboGuiceIntegration).
Je préfère personellement n'utiliser que AA même si cela implique une injection de dépendance moins élaborée.

### ORMLite

Rien de prévu nativement pour l'intégration à ORMLite mais voici ce qui peut être réalisé :

- créer une classe générique Service&lt;T&gt; :

{% highlight java %}
// ...
@EBean(scope = Scope.Singleton)
public class UserService extends Service<User> {

    @RootContext
    Context context;

    public UserService() { }
    
    @AfterInject
    public void setDao() {
        this.setDao(context, User.class);
    }
}
{% endhighlight %}

- déclarer un service UserService par exemple héritant de notre classe Service :

{% highlight java %}
public abstract class Service<T> {

    protected Dao<T, Long> dao;

    public void setDao(Context context, Class<T> clazz) {
        try {
            dao = DaoManager.createDao(OpenHelperManager.getHelper(context, DatabaseHelper.class).getConnectionSource(), clazz);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    public Dao<T, Long> getDao() {
        return this.dao;
    }
}
{% endhighlight %}

- injecter le bean UserService dans une activité :

{% highlight java %}
// ...
@EActivity(R.layout.my_bookings)
public class MyBookings extends Activity {

    @Bean
    UserService userService;
    
    ...
}
{% endhighlight %}

On peut ainsi utiliser les DAO générés par ORMLite dans nos services, puis injecter nos services dans toutes les classes annotées par AA.
Dans l'idéal, il faudrait créer une annotation @OrmLiteDao(MyObject.class) afin de simplifier ce code.


## Conclusion

AndroidAnnotations est simple et efficace. Il est vraiment complet et allège d'une façon considérable le code, laissant apparaître uniquement ce qui est important : le fonctionnel. Je le conseille donc fortement pour tous les nouveaux projets Android, car il n'a pas vraiment d'inconvénients : il est léger (50Ko) et n'a pas d'impact sur les performances (tout le code est généré à la compilation donc pas d'introspection ni d'injection au runtime).

Par ailleurs, [Pierre-Yves Ricau](https://github.com/pyricau), le créateur du projet, est très actif et ouvert à la discussion. Il suit de près les évolutions d'Android et adapte rapidement AndroidAnnotations.
