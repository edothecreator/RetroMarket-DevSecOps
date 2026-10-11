# RetroMarket

> **WARNING: This application is intentionally vulnerable and is for
> local educational use only. Never expose it to the public internet.**




## 🏗️ Architecture du projet

Le projet suit une **architecture en couches** : chaque package a une seule responsabilité et ne communique qu'avec la couche située juste en dessous.

### Flux d'une requête

```
Route → Middleware → Controller → Service → DAO → Base de données
```

### Arborescence

```
src/
├── models/        # Schémas de données
├── dao/           # Accès aux données (ORM)
├── services/      # Logique métier
├── controllers/   # Web services (HTTP)
├── routes/        # Définition des APIs
├── middlewares/   # Traitements intermédiaires
├── dto/           # Objets de transfert et validation
└── utils/         # Fonctions utilitaires
```

### Description des packages

#### 📦 `models`
Contient les **schémas** de données (entités / schémas ORM) qui décrivent la structure des tables et leurs relations (ex : `User`, `Role`).
> ❌ Ne contient aucune logique métier ni requête.

#### 📦 `dao` (Data Access Object)
Couche d'**accès à la base de données** via l'ORM. Elle regroupe toutes les requêtes (create, find, update, delete).
> ❌ Ne contient aucune règle métier.

#### 📦 `services`
Cœur de l'application : contient la **logique métier** (règles de gestion, authentification, orchestration des DAO).
> ❌ Ne connaît pas `req` / `res` (indépendant d'Express).

#### 📦 `controllers`
Couche **web service** : reçoit la requête HTTP, appelle le service approprié et renvoie la réponse (code HTTP + JSON).
> ❌ Ne contient aucune logique métier ni requête à la base.

#### 📦 `routes`
Définit les **APIs** (endpoints) et les associe aux controllers et aux middlewares.
Exemple : `POST /api/auth/login` → `authController.login`.

#### 📦 `middlewares`
Traitements exécutés **avant ou après** le controller : authentification (JWT), vérification des rôles, validation des données, gestion globale des erreurs.

#### 📦 `dto` (Data Transfer Object)
Définit la **forme des données** échangées avec le client et leurs **règles de validation** (entrées et sorties). Évite d'exposer directement les modèles (ex : ne jamais renvoyer `passwordHash`).

#### 📦 `utils`
Fonctions **utilitaires réutilisables** : hash des mots de passe, génération/vérification des JWT, classes d'erreurs personnalisées, helpers divers.

### Règles de l'architecture

| Couche | Peut appeler | Ne doit pas |
|---|---|---|
| Routes | Middlewares, Controllers | Contenir de la logique |
| Controllers | Services | Accéder à la base de données |
| Services | DAO | Utiliser `req` / `res` |
| DAO | Models (ORM) | Contenir des règles métier |