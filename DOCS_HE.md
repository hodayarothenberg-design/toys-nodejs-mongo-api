# Toys API — תיעוד בעברית

כתובת מקומית: `http://localhost:3001`  
כותרת אבטחה לראוטים מוגנים: `x-api-key: <JWT>`

המסמך הזה מיועד למתכנת צד לקוח שצריך לעבוד מול ה־API.

---

## 1. תהליך התחברות

1. `POST /users` — יצירת משתמש.
2. `POST /users/login` — שולחים אימייל וסיסמה, מקבלים `{ token, role, name }`.
3. שומרים את הטוקן.
4. בכל POST / PUT / DELETE ל־`/toys` שולחים כותרת:

```
x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

לא שולחים `Authorization: Bearer`. בדרישות הקורס הכותרת היא בדיוק `x-api-key`.

בלי כותרת:

```json
{ "err": "You must send a token in header x-api-key" }
```

טוקן לא תקין או שפג תוקף (60 דקות):

```json
{ "err": "Token invalid or expired" }
```

---

## 2. משתמשים

### POST `/users` — הרשמה

**מה מותר לשלוח ב־BODY**

| שדה | סוג | חובה | חוקים |
| --- | --- | --- | --- |
| name | string | כן | 2–99 תווים |
| email | string | כן | אימייל תקין, ייחודי במסד |
| password | string | כן | 6–99 תווים |

**מה אסור / מה השרת מתעלם ממנו**

- `role` — תמיד נשמר כ־`USER`
- הסיסמה לא נשמרת כטקסט גלוי
- אימייל שכבר קיים נכשל

**דוגמה**

```http
POST http://localhost:3001/users
Content-Type: application/json

{
  "name": "דנה כהן",
  "email": "dana@gmail.com",
  "password": "123456"
}
```

הצלחה: `201` ואובייקט משתמש עם `"password": "*****"`.

אימייל כפול: `400`

```json
{ "err": "Email already exists in system, try a different email" }
```

שגיאת Joi: `400` ומערך פירוט השגיאות.

### POST `/users/login`

ב־BODY רק `email` ו־`password`.

הצלחה:

```json
{
  "token": "eyJ...",
  "role": "USER",
  "name": "Regular User"
}
```

כישלון (אימייל או סיסמה לא נכונים) — אותה הודעה בשני המקרים:

```json
{ "err": "Email or password is wrong" }
```

### GET `/users/userInfo`

חובה טוקן. מחזיר את המשתמש בלי שדה הסיסמה.

---

## 3. צעצועים

### עימוד

בכל ראוט של רשימה יש `?skip=`

- בכל עמוד **10** צעצועים
- `skip` הוא מספר העמוד שמתחיל מ־**0**
- בשרת: `.skip(skip * 10).limit(10)`

דוגמאות:

- `?skip=0` — עמוד ראשון
- `?skip=1` — עמוד שני

### GET `/toys` — ראוט א' + בונוס

שליפה כללית. באותו ראוט אפשר גם:

| Query | משמעות |
| --- | --- |
| skip | מספר עמוד |
| s | חיפוש ב־name או info |
| category | סינון לפי קטגוריה (במקום PARAMS — בונוס) |
| min / max | טווח מחירים |

```
GET http://localhost:3001/toys
GET http://localhost:3001/toys?skip=1
GET http://localhost:3001/toys?s=bear
GET http://localhost:3001/toys?category=Plush
```

התשובה היא **מערך**.

### GET `/toys/search?s=...&skip=0` — ראוט ב'

חיפוש ב־`name` או `info` (regex, לא רגיש לאותיות גדולות/קטנות).

### GET `/toys/category/:catname?skip=0` — ראוט ג'

לדוגמה: `/toys/category/Outdoor`

### GET `/toys/prices?min=10&max=40&skip=0` — ראוט ז'

`$gte` ו־`$lte` על המחיר.

### GET `/toys/single/:id` — ראוט ח'

מחזיר **אובייקט אחד**, לא מערך. אם אין רשומה: `404`.

### GET `/toys/count` — ראוט ט'

```json
{ "count": 12 }
```

### POST `/toys` — ראוט ד' — חובה טוקן

```http
POST http://localhost:3001/toys
Content-Type: application/json
x-api-key: YOUR_TOKEN

{
  "name": "פאזל עץ",
  "info": "פאזל צבעוני עם חיות",
  "category": "Educational",
  "img_url": "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg",
  "price": 29
}
```

מה מותר ב־BODY: `name`, `info`, `category`, `price`, ו־`img_url` אופציונלי.  
מה אסור לשלוט בו: `user_id` (מגיע מהטוקן), `_id`, תאריכים.

בלי טוקן / טוקן שבור → `401` מה־middleware.

### PUT `/toys/:id` — ראוט ה' — חובה טוקן

אותו BODY כמו POST.  
מותר רק אם `user_id` של הצעצוע שווה ל־`_id` שבטוקן, או שהתפקיד `ADMIN`.

אחרת `403`:

```json
{ "err": "You can edit only toys that belong to your user_id" }
```

### DELETE `/toys/:id` — ראוט ו' — חובה טוקן

בלי BODY. אותם חוקי בעלות כמו בעריכה.

---

## 4. נתוני דמו אחרי `npm run seed`

3 קטגוריות, 12 צעצועים:

- Educational
- Outdoor
- Plush

| אימייל | סיסמה | תפקיד |
| --- | --- | --- |
| admin@toys.com | 123456 | ADMIN |
| user@toys.com | 123456 | USER |

כל הצעצועים של ה־seed שייכים ל־`user@toys.com`.

---

## 5. איך לבדוק ב־Thunder Client

1. יצירת משתמש או התחברות עם המשתמש של ה־seed
2. העתקת `token`
3. בראוטים מוגנים: Headers → `x-api-key` = הטוקן
4. בדיקת GET בלי טוקן — חייב לעבוד
5. בדיקת POST בלי טוקן — חייב להיכשל עם 401
6. בדיקת מחיקה של צעצוע של משתמש אחר — חייב להיכשל עם 403
