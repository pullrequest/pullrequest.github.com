---
layout: post
title: Spring-data-jpa
author: jvillanti
tags: [resthub, spring-data, QueryDsl]
---

La préparation [de la version 2 de RESThub](http://pullrequest.org/2011/09/07/resthub-2-preview.html) et l’objectif de remplacer [Hades](http://redmine.synyx.org/) par [Spring-data](http://www.springsource.org/spring-data) nous a emmené à étudier le module spring-data-jpa et ses capacités.

## Présentation

Le projet [Spring-data](http://www.springsource.org/spring-data) est un projet visant à simplifier l’utilisation des bases relationnelles et des bases NO SQL (Graph, Key-Value, Document).
En plus des facilités de manipulation de données offertes par le project, Spring-data supporte le framework [QueryDsl](http://www.querydsl.com/) et ainsi la possibilité de donner [une orientation DDD](http://en.wikipedia.org/wiki/Domain-driven_design) introduit par *Eric Evans* à son travail. Sans rentrant dans les détails, on assiste peut être à la fin de nos modèles métiers anémiques !

## Cas d’utilisation basique
Maintenant on rentre dans le vif du sujet avec un projet exemple montrant les possibilités offertes par Spring-data-jpa.

### 1)Objet domain
	@Entity
	public class User {
		@Id
		@GeneratedValue(strategy = GenerationType.AUTO)
		private Long id;

		@Column(unique = true, nullable = false)
		private String username;

		@Column(nullable = false)
		private Integer age;     

		//Get et Set
	}

Ici, Pojo classique pour ne pas dire "anémique". Aucune référence à spring-data n'est nécessaire.

### 2)Repository
	public interface UserRepository extends JpaRepository<User, Long> {
		User findByUsername(String username);     
		
		List<User> findByUsernameAndAge(String username, Integer age);     
		
		Page<User> findByUsernameLike(String username, Pageable pageable);     

		@Query("SELECT u FROM User u WHERE u.username like ?1")
		Page<User> findByUsernameLikeCusom(String username, Pageable pageable);     
		
		List<User> findByAgeBetween(Integer min, Integer max);
	}

Le travail au niveau du repository se limite à l'écriture de l'interface et c'est Spring-data-jpa qui se charge de faire l'implémentation. Les habitués du framework [Hades](http://redmine.synyx.org/) reconnaitrons sans mal ce mode de fonctionnement. 
Pour les autres, plusieurs modes sont disponibles : 

* le framework compose automatiquement les requêtes en se basant sur des mots clés (ByXXX, Order, …) (ex : findByUsernameAndAge, ...) [liste de mots clés](http://static.springsource.org/spring-data/data-jpa/docs/1.0.0.RC1/reference/html/#repositories.query-methods.property-expressions)
* l’utilisateur écrit directement la requête (utilisation de @Query) avec la posibilité d'utiliser des paramètres nommés

A savoir, qu’il est possible de gérer les Pages pour les requêtes qui peuvent ramener beaucoup de résultats.

### 3)Configuration Spring
Il faut juste indiquer à Spring-data-jpa le package ou se trouve vos repositories qu'il doit gérer 
	
	<jpa:repositoriesbase-package="fr.test.repository" />

### 4)Tests
Maintenant on passe aux tests unitaires de notre "userRepository"
	public class UserRepositoryTest {
		  @Autowired
		  private UserRepository userRepositoryImpl;

		  private User userTest1 = newUser("Test1", 16);
		  private User userTest2 = newUser("Test2", 18);
		  private User userTest3 = newUser("Toto", 21);
		  private List<User> usersTest = new ArrayList<User>(Arrays.asList(userTest1, userTest2, userTest3));

		  @Test
		  public void testSave() {
				userRepositoryImpl.save(userTest1);
				assertNotNull(userRepositoryImpl.findOne(userTest1.getId()));
		  }     

		  @Test
		  public void testFindOne() {
				User user = userRepositoryImpl.save(userTest1);
				assertNotNull(userRepositoryImpl.findOne(userTest1.getId()));
				
				user = userRepositoryImpl.findOne(userTest1.getId());
				assertNotNull(user);
				assertEquals(user.getId(), userTest1.getId());
		  }
		   //ETC ...
	}

Rien de spécial, on injecte notre repository et on peut ensuite tester toutes les fonctions.

## 1er bilan :

* Avantages :

	* pour ceux qui connaissent Hades, on est très proche du mode de fonctionnement;
	* les fonctions CRUD déjà implémentées;
	* le mode implémentation automatique permet de gagner du temps dans les petits développements.

* Limitations :

	* les interfaces peuvent vite devenir confuses avec des FindByXXXandYYY,  FindByXXXandYYYOrderBy, ...
	* les requêtes persos ne sont pas vérifiées avant l’exécution (aie aux tests unitaires oubliés)

## Cas d’utilisation avancé
### 1)Ajouter des comportements au repository
	
	public interface UserRepositoryCustom {
		public boolean customMethod(User user);
	}
 
	@Repository("userRepositoryImpl") 
	public class UserRepositoryCustomImpl implements UserRepositoryCustom {   
		private static final Logger LOGGER = LoggerFactory.getLogger(UserRepositoryCustom.class);  
		
		public boolean customMethod(User user){ 
			LOGGER.info("Methode ajoutee au repository : UserRepository");   
			return true; 
		} 
	}
	
	@Repository("userRepositoryImpl")
	public class UserRepositoryCustomImpl implements UserRepositoryCustom {
	   private static final Logger LOGGER = LoggerFactory.getLogger(UserRepositoryCustom.class);
	 
	   public boolean customMethod(User user){
		  LOGGER.info("Methode ajoutee au repository : UserRepository");
		  return true;
	   } 
	}
	
Que du classique : A savoir la déclaration et l'implémentation des comportements que l'on souhaite ajouter à notre repository. Il s'agit d'un bean classique que l'on pourrait injecter dans une classe indépendamment de notre repository.

	public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom{
	   User findByUsername(String username);
	 
	   List<User> findByUsernameAndAge(String username, Integer age);
	 
	   Page<User> findByUsernameLike(String username, Pageable pageable);
	 
	   @Query("SELECT u FROM User u WHERE u.username like ?1")
	   Page<User> findByUsernameLikeCusom(String username, Pageable pageable);
	 
	   List<User> findByAgeBetween(Integer min, Integer max);
	}

On rajoute à notre repository "UserRepository" un extends sur notre repository UserRepositoryCustom et hop on profite des fonctionnalités de spring-data-jpa plus celles de notre implémentation de UserRepositoryCustom
 
A savoir qu'il est possible d'ajouter des comportements "par défaut" à tous les repositories. [(cf la doc de spring-data)]( http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#repositories.custom-behaviour-for-all-repositories).

	public class UserRepositoryTest {
	   //...
	   
	   @Autowired
	   private UserRepository userRepositoryImpl;
	 
	   @Test
	   public void testCustomMethod() {
		  boolean result = userRepositoryImpl.customMethod(userTest1);
		  assertTrue(result);
	   }
		//.....
	}
Rien de particulier, on teste que notre UserRepository profite bien de la fonction définie dans notre UserRepositoryCustom.

### 2)Utilisation de queryDsl
QueryDsl est un framework qui permet d'écrire des requêtes type-safe dans un langage humainement compréhensible.
Grâce à QueryDsl on va pouvoir supprimer une des limites énoncée dans le 1er bilan et éviter pas mal de surprise à l'éxécution. On va même discrètement rajouter un peu de métier dans autre objet domain.
 
#### 1er étape : Génération des classes Q*

Afin de pouvoir utiliser les classes QXXX (ici QUser) il faut les générer. Il existe un plugin Maven dédié à ce travail.

	<plugin>
		<groupId>com.mysema.maven</groupId>
		<artifactId>maven-apt-plugin</artifactId>
		<version>1.0.2</version>
		<executions>
			<execution>
				<phase>generate-sources</phase>
				<goals>
					<goal>process</goal>
				</goals>
				<configuration>
					<outputDirectory>target/generated-sources</outputDirectory>
					<processor>com.mysema.query.apt.jpa.JPAAnnotationProcessor</processor>
				</configuration>
			</execution>
		</executions>
	</plugin>

Rem : Pour les personnes sous Eclipse il faut penser à faire un "update project configuaration".
	
#### 2ème étape : Utilisation de QueryDsl dans les repositories

	public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom, QueryDslPredicateExecutor<User>{
	   User findByUsername(String username);
	 
	   List<User> findByUsernameAndAge(String username, Integer age);
	 
	   Page<User> findByUsernameLike(String username, Pageable pageable);
	 
	   @Query("SELECT u FROM User u WHERE u.username like ?1")
	   Page<User> findByUsernameLikeCusom(String username, Pageable pageable);
	 
	   List<User> findByAgeBetween(Integer min, Integer max);
	}

#### 3ème étape : On teste

	public class UserRepositoryTest {
	   //...
	 
	   @Test
	   public void testQueryDsl() {
			List<User> users = userRepositoryImpl.save(usersTest);
			users = userRepositoryImpl.findAll();
			assertNotNull(users);
			assertTrue(users.size() == 3);
	 
			users = (List<User>) userRepositoryImpl.findAll(QUser.user.username.like("Test%").and                                                                       	   (QUser.user.age.eq(userTest1.getAge())));
			assertNotNull(users);
			assertTrue(users.size() == 1);
			assertTrue(users.get(0).getId() == userTest1.getId()); 
			assertTrue(users.size() == 1); assertTrue(users.get(0).getAge() < 18);
	   }
	   //....
	}

Et hop, on peut profiter de tout un langage pour générer ses requêtes type-safe! [voir la document QueryDsl]( http://source.mysema.com/static/querydsl/2.2.0/reference/html). La complétion rajoute vraiment un confort non négligeable.

#### 4ème étape : Enrichissement du modèle avec les prédicats

	@Entity
	public class User {
	   @Id
	   @GeneratedValue(strategy = GenerationType.AUTO)
	   private Long id;
	 
	   @Column(unique = true, nullable = false)
	   private String username;
	 
	   @Column(nullable = false)
	   private Integer age; 
	 
	   public static BooleanExpression isMinor() {
		  return QUser.user.age.lt(18);
	   } 
	   //GET et SET
	}

Ici, on voit le côté DDD et l'ajout de métier dans le modèle.
 
#### 5ème étape : On teste les prédicats
	
	public class UserRepositoryTest {
		//...
		@Test
		public void testQueryDsl2() {
			List<User> users = userRepositoryImpl.save(usersTest);
			users = userRepositoryImpl.findAll();
			assertNotNull(users);
			assertTrue(users.size() == 3);
	 
			users = (List<User>) userRepositoryImpl.findAll(User.isMinor());
			assertNotNull(users);
			assertTrue(users.size() == 1);
			assertTrue(users.get(0).getAge() < 18);
		}
		//...
	}
	
On peut maintenant utiliser les prédicats prédéfinis pour générer des requêtes.

## 2ème bilan :
* On retrouve biens les concepts d'Hades et la possibilité d'étendre les repositories afin de rajouter des comportements.
* L'utilisation du QueryDsl est vraiment intéressante. On peut fabriquer des requêtes type-safe et dans un langue proche de langage courant et on profite de la complétion!. On évite aussi de rajouter toutes les 5secondes une nouvelle méthode dans le repostitory (cela évite d'avoir plusieurs dizaines findByXXXandYYY, ...).
